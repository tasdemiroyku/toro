'use server'

import { sendEmail } from '@/utils/email'

/**
 * Contact form → e-mail to the founders' inbox (CONTACT_INBOX_EMAIL, server-only,
 * never shown on the site). Reply-To is the sender, so answering is one click.
 *
 * Spam protection: a hidden honeypot field and a minimum fill time. Bots that
 * trip either get a fake success. Persistent rate limiting is ROADMAP S5.
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const LIMITS = { name: 100, email: 254, message: 2000 }
const MIN_FILL_MS = 3000

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export async function sendContactMessage({ name, email, message, website, startedAt }) {
  // Honeypot filled in, or the form was submitted faster than a human can type
  if (website || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return { success: true }
  }

  const cleanName = typeof name === 'string' ? name.trim().slice(0, LIMITS.name) : ''
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const cleanMessage = typeof message === 'string' ? message.trim() : ''

  if (!cleanName) return { error: 'Please tell us your name.' }
  if (cleanEmail.length > LIMITS.email || !EMAIL_RE.test(cleanEmail)) {
    return { error: 'Please enter a valid e-mail address so we can reply.' }
  }
  if (cleanMessage.length < 10) return { error: 'Your message is a bit short. Tell us a little more.' }
  if (cleanMessage.length > LIMITS.message) {
    return { error: `Please keep your message under ${LIMITS.message} characters.` }
  }

  const inbox = process.env.CONTACT_INBOX_EMAIL
  if (!inbox) {
    console.error('CONTACT_INBOX_EMAIL is not set')
    return { error: 'The contact form is not available right now.' }
  }

  try {
    await sendEmail({
      to: inbox,
      replyTo: cleanEmail,
      subject: `[Toro contact] ${cleanName}`,
      text: `From: ${cleanName} <${cleanEmail}>\n\n${cleanMessage}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;color:#132600">
          <p><strong>From:</strong> ${escapeHtml(cleanName)} &lt;${escapeHtml(cleanEmail)}&gt;</p>
          <p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(cleanMessage)}</p>
        </div>`,
    })
  } catch (err) {
    console.error('Contact e-mail failed:', err.message)
    return { error: 'We could not send your message. Please try again later.' }
  }

  return { success: true }
}
