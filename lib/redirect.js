/**
 * lib/redirect.js
 *
 * Returns `value` only if it is a same-origin path such as `/inbox`.
 * Rejects absolute URLs and protocol-relative ones (`//evil.com`, `/\evil.com`),
 * which browsers would otherwise follow off-site (open redirect).
 */
export function safeRedirectPath(value, fallback = '/') {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}
