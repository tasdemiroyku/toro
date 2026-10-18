'use server'

import { revalidatePath } from 'next/cache'
import supabaseAdmin from '@/utils/supabase/admin'
import { getAdminUser } from '@/utils/supabase/adminGuard'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ACTIONS = ['dismiss', 'resolve', 'remove_listing']

/**
 * Admin-only. Resolves a report:
 *  - dismiss         → status 'dismissed'
 *  - resolve         → status 'actioned' (handled outside the app, e.g. a user)
 *  - remove_listing  → hides the reported listing for everyone but its owner,
 *                      and marks every open report on it as 'actioned'
 */
export async function resolveReport({ reportId, action, note }) {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Not allowed.' }
  if (!UUID_RE.test(reportId ?? '') || !ACTIONS.includes(action)) return { error: 'Invalid request.' }

  const { data: report } = await supabaseAdmin
    .from('reports').select('id, target_type, target_id, reason').eq('id', reportId).maybeSingle()
  if (!report) return { error: 'Report not found.' }

  const now = new Date().toISOString()
  const resolution = { resolved_at: now, resolved_by: admin.id }

  if (action === 'remove_listing') {
    if (report.target_type !== 'listing') return { error: 'Only listings can be removed here.' }

    const { error: removeError } = await supabaseAdmin
      .from('listings')
      .update({
        is_removed: true,
        removed_at: now,
        removed_reason: typeof note === 'string' && note.trim() ? note.trim().slice(0, 300) : report.reason,
      })
      .eq('id', report.target_id)
    if (removeError) return { error: 'Could not remove the listing.' }

    await supabaseAdmin
      .from('reports')
      .update({ status: 'actioned', ...resolution })
      .eq('target_type', 'listing')
      .eq('target_id', report.target_id)
      .eq('status', 'open')
  } else {
    const { error } = await supabaseAdmin
      .from('reports')
      .update({ status: action === 'dismiss' ? 'dismissed' : 'actioned', ...resolution })
      .eq('id', reportId)
    if (error) return { error: 'Could not update the report.' }
  }

  revalidatePath('/admin/reports')
  revalidatePath('/listings')
  return { success: true }
}
