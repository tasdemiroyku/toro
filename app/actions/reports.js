'use server'

import { createClient } from '@/utils/supabase/server'
import { getSupabaseAdmin } from '@/utils/supabase/admin'
import { sendEmail } from '@/utils/email'
import { SITE_URL } from '@/lib/site'
import { REPORT_REASONS, REPORT_REASON_LABEL, REPORT_DETAILS_MAX, REPORTS_PER_DAY } from '@/lib/reports'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TARGET_TYPES = ['listing', 'user']

/**
 * Report a listing or a user. The insert runs with the reporter's own session
 * (RLS: reporter_id must be auth.uid()); target lookups and the daily limit use
 * the service role because reports are not readable by clients.
 * Returns { error } or { success: true }.
 */
export async function reportContent({ targetType, targetId, reason, details }) {
  const supabaseAdmin = getSupabaseAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in to report content.' }

  if (!TARGET_TYPES.includes(targetType) || !UUID_RE.test(targetId ?? '')) {
    return { error: 'This content cannot be reported.' }
  }
  if (!REPORT_REASONS.some(r => r.value === reason)) {
    return { error: 'Please choose a reason.' }
  }
  const cleanDetails = typeof details === 'string' ? details.trim().slice(0, REPORT_DETAILS_MAX) : ''

  // What is being reported (and make sure it is not your own)
  let summary
  if (targetType === 'listing') {
    const { data: listing } = await supabaseAdmin
      .from('listings').select('id, title, user_id').eq('id', targetId).maybeSingle()
    if (!listing) return { error: 'This listing no longer exists.' }
    if (listing.user_id === user.id) return { error: 'You cannot report your own listing.' }
    summary = { label: `Listing: ${listing.title}`, url: `${SITE_URL}/listings/${listing.id}` }
  } else {
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('id, username, full_name').eq('id', targetId).maybeSingle()
    if (!profile) return { error: 'This user no longer exists.' }
    if (profile.id === user.id) return { error: 'You cannot report yourself.' }
    summary = {
      label: `User: ${profile.full_name || profile.username}`,
      url: profile.username ? `${SITE_URL}/u/${profile.username}` : SITE_URL,
    }
  }

  // Daily limit per reporter
  const { count } = await supabaseAdmin
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('reporter_id', user.id)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  if ((count ?? 0) >= REPORTS_PER_DAY) {
    return { error: 'You have sent many reports today. Please try again tomorrow.' }
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: cleanDetails || null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already reported this. We are looking into it.' }
    console.error('Report insert failed:', error.message)
    return { error: 'Could not send your report. Please try again.' }
  }

  // Notify the founders; the report is saved even if the e-mail fails
  if (process.env.CONTACT_INBOX_EMAIL) {
    try {
      await sendEmail({
        to: process.env.CONTACT_INBOX_EMAIL,
        subject: `[Toro report] ${REPORT_REASON_LABEL[reason]}: ${summary.label}`.slice(0, 180),
        text: [
          `${summary.label}`,
          `Link: ${summary.url}`,
          `Reason: ${REPORT_REASON_LABEL[reason]}`,
          `Details: ${cleanDetails || '(none)'}`,
          '',
          `Review it at ${SITE_URL}/admin/reports`,
        ].join('\n'),
      })
    } catch (err) {
      console.error('Report e-mail failed:', err.message)
    }
  }

  return { success: true }
}
