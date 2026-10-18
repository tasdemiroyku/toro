/**
 * lib/site.js
 *
 * Site-wide constants. Change them here (and only here).
 */

// Canonical public URL of the deployed app
export const SITE_URL = 'https://toro-next.vercel.app'
export const SITE_HOST = new URL(SITE_URL).host

// Public contact / privacy address. While null, legal pages point to the /contact
// form instead (it e-mails CONTACT_INBOX_EMAIL, a server-only env var).
export const CONTACT_EMAIL = null

// Date shown on /privacy and /terms; update whenever their content changes
export const LEGAL_LAST_UPDATED = '18 October 2026'
