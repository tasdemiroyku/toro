'use server'

import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { getSupabaseAdmin } from '@/utils/supabase/admin'
import { sendEmail } from '@/utils/email'

/**
 * Student verification: prove ownership of a university e-mail with a 6-digit
 * code. The sign-up e-mail can be anything; only this flow grants the badge.
 *
 * Codes are stored as an HMAC (keyed with VERIFICATION_CODE_SECRET), expire,
 * allow a limited number of guesses and are rate-limited per user. Tables are
 * only reachable with the service role (see 20261017130000 migration).
 * Both actions return { error } instead of throwing so messages reach the UI.
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const CODE_RE = /^\d{6}$/
const CODE_TTL_MINUTES = 15
const MAX_ATTEMPTS = 5
const MAX_CODES_PER_HOUR = 3
const RESEND_COOLDOWN_SECONDS = 60

const NOT_CONFIGURED = { error: 'Student verification is not available right now.' }

function hashCode(userId, email, code) {
  return createHmac('sha256', process.env.VERIFICATION_CODE_SECRET)
    .update(`${userId}:${email}:${code}`)
    .digest('hex')
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

function verificationEmail(code) {
  const text = [
    `Your Toro verification code is ${code}.`,
    '',
    `Enter it in your profile settings within ${CODE_TTL_MINUTES} minutes to get the Verified Student badge.`,
    'If you did not request this, you can ignore this e-mail.',
  ].join('\n')

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#132600">
      <h1 style="font-size:20px">Verify your student status</h1>
      <p>Your Toro verification code is:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</p>
      <p>Enter it in your profile settings within ${CODE_TTL_MINUTES} minutes.</p>
      <p style="color:#6b7280;font-size:13px">If you did not request this, you can ignore this e-mail.</p>
    </div>`

  return { subject: `Your Toro verification code: ${code}`, text, html }
}

export async function requestStudentCode(rawEmail) {
  const supabaseAdmin = getSupabaseAdmin()
  const user = await getCurrentUser()
  if (!user) return { error: 'Please log in again.' }
  if (!process.env.VERIFICATION_CODE_SECRET) return NOT_CONFIGURED

  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid e-mail address.' }
  }

  // The allowlist lives in the database (public.is_student_email)
  const { data: isStudentEmail } = await supabaseAdmin.rpc('is_student_email', { p_email: email })
  if (!isStudentEmail) {
    return { error: 'This domain is not on our list of university e-mails yet.' }
  }

  const { data: linked } = await supabaseAdmin
    .from('private_profiles')
    .select('id')
    .eq('student_email', email)
    .maybeSingle()
  if (linked && linked.id !== user.id) {
    return { error: 'This university e-mail is already linked to another account.' }
  }

  // Rate limit: a few codes per hour, with a short cooldown between them
  const { data: recent } = await supabaseAdmin
    .from('student_verifications')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  if ((recent?.length ?? 0) >= MAX_CODES_PER_HOUR) {
    return { error: 'Too many codes requested. Please try again in an hour.' }
  }
  if (recent?.[0] && Date.now() - new Date(recent[0].created_at).getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
    return { error: 'Please wait a minute before requesting a new code.' }
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
  const now = new Date()

  // Only the newest code stays valid
  await supabaseAdmin
    .from('student_verifications')
    .update({ consumed_at: now.toISOString() })
    .eq('user_id', user.id)
    .is('consumed_at', null)

  const { data: pending, error: insertError } = await supabaseAdmin
    .from('student_verifications')
    .insert({
      user_id:    user.id,
      email,
      code_hash:  hashCode(user.id, email, code),
      expires_at: new Date(now.getTime() + CODE_TTL_MINUTES * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()

  if (insertError) return { error: 'Could not create a code. Please try again.' }

  try {
    await sendEmail({ to: email, ...verificationEmail(code) })
  } catch (err) {
    console.error('Verification e-mail failed:', err.message)
    await supabaseAdmin
      .from('student_verifications')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', pending.id)
    return { error: 'We could not send the e-mail. Please try again later.' }
  }

  return { success: true }
}

export async function confirmStudentCode(rawCode) {
  const supabaseAdmin = getSupabaseAdmin()
  const user = await getCurrentUser()
  if (!user) return { error: 'Please log in again.' }
  if (!process.env.VERIFICATION_CODE_SECRET) return NOT_CONFIGURED

  const code = typeof rawCode === 'string' ? rawCode.trim() : ''
  if (!CODE_RE.test(code)) return { error: 'Enter the 6-digit code from the e-mail.' }

  const { data: pending } = await supabaseAdmin
    .from('student_verifications')
    .select('id, email, code_hash, attempts, expires_at')
    .eq('user_id', user.id)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!pending || new Date(pending.expires_at) < new Date()) {
    return { error: 'This code has expired. Please request a new one.' }
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    return { error: 'Too many attempts. Please request a new code.' }
  }

  // Constant-time comparison of the two HMACs
  const expected = Buffer.from(pending.code_hash, 'hex')
  const actual = Buffer.from(hashCode(user.id, pending.email, code), 'hex')
  if (!timingSafeEqual(expected, actual)) {
    const attempts = pending.attempts + 1
    await supabaseAdmin.from('student_verifications').update({ attempts }).eq('id', pending.id)
    const left = MAX_ATTEMPTS - attempts
    return {
      error: left > 0
        ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
        : 'Too many attempts. Please request a new code.',
    }
  }

  const now = new Date().toISOString()
  await supabaseAdmin.from('student_verifications').update({ consumed_at: now }).eq('id', pending.id)

  const { error: linkError } = await supabaseAdmin
    .from('private_profiles')
    .upsert({ id: user.id, student_email: pending.email, student_verified_at: now, updated_at: now })

  if (linkError) {
    return {
      error: linkError.code === '23505'
        ? 'This university e-mail is already linked to another account.'
        : 'Could not save your verification.',
    }
  }

  const { error: badgeError } = await supabaseAdmin
    .from('profiles')
    .update({ is_verified: true })
    .eq('id', user.id)

  if (badgeError) return { error: 'Could not save your verification.' }

  revalidatePath('/profile/edit')
  return { success: true, studentEmail: pending.email }
}
