/**
 * lib/reports.js
 *
 * Reasons a listing or a user can be reported for. `value` is stored in
 * public.reports (CHECK constraint in supabase/migrations); `label` is UI text.
 */
export const REPORT_REASONS = [
  { value: 'spam',          label: 'Spam or advertising' },
  { value: 'scam',          label: 'Scam or fraud' },
  { value: 'fake',          label: 'Fake or misleading' },
  { value: 'inappropriate', label: 'Inappropriate or illegal content' },
  { value: 'harassment',    label: 'Harassment or hate' },
  { value: 'other',         label: 'Something else' },
]

export const REPORT_REASON_LABEL = Object.fromEntries(REPORT_REASONS.map(r => [r.value, r.label]))

export const REPORT_DETAILS_MAX = 1000
export const REPORTS_PER_DAY = 10
