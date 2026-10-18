/**
 * lib/site.js
 *
 * Site-wide constants. Change them here (and only here).
 */

// Canonical public URL of the deployed app
export const SITE_URL = 'https://toro-next.vercel.app'
export const SITE_HOST = new URL(SITE_URL).host

// Public contact / privacy address. null until the custom domain exists:
// legal pages then show a placeholder and the footer hides the Contact link.
export const CONTACT_EMAIL = null

// Date shown on /privacy and /terms; update whenever their content changes
export const LEGAL_LAST_UPDATED = '18 October 2026'
