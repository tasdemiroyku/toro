/**
 * utils/email.js
 *
 * Transactional e-mail through Resend. Server-only: import it from Server
 * Actions or route handlers, never from a client component.
 *
 * RESEND_FROM_EMAIL must use a domain verified in Resend. Without one, Resend's
 * test sender (onboarding@resend.dev) only delivers to the Resend account owner.
 */
import { Resend } from 'resend'

const DEFAULT_FROM = 'Toro <onboarding@resend.dev>'

export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')

  // Created per call so a missing key fails here, not at import time
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
    to,
    subject,
    text,
    html,
    ...(replyTo && { replyTo }),
  })

  if (error) throw new Error(error.message)
}
