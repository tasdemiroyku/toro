/**
 * lib/password.js
 *
 * Password policy, mirroring Supabase Auth settings (Authentication → Email):
 * minimum 8 characters with lowercase, uppercase, digits and symbols.
 * Supabase enforces it on the server; the UI uses these rules to explain them
 * up front instead of failing after submit.
 */

// The symbol set Supabase accepts for the "symbols" requirement
const SYMBOL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/

export const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_RULES = [
  { id: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: p => p.length >= PASSWORD_MIN_LENGTH },
  { id: 'lower',  label: 'A lowercase letter',                         test: p => /[a-z]/.test(p) },
  { id: 'upper',  label: 'An uppercase letter',                        test: p => /[A-Z]/.test(p) },
  { id: 'digit',  label: 'A number',                                   test: p => /[0-9]/.test(p) },
  { id: 'symbol', label: 'A symbol, e.g. ! ? # @',                     test: p => SYMBOL_RE.test(p) },
]

export const PASSWORD_HINT = 'At least 8 characters, with upper and lower case letters, a number and a symbol'

export function isStrongPassword(password) {
  return typeof password === 'string' && PASSWORD_RULES.every(rule => rule.test(password))
}
