import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/utils/supabase/admin'
import { getAdminUser } from '@/utils/supabase/adminGuard'
import AdminReportsClient from '@/components/AdminReportsClient'

export const metadata = {
  title: 'Reports',
  robots: { index: false, follow: false },
}

// Look up listings and people referenced by the reports, in two queries
async function loadTargets(reports) {
  const supabaseAdmin = getSupabaseAdmin()
  const listingIds = [...new Set(reports.filter(r => r.target_type === 'listing').map(r => r.target_id))]
  const profileIds = [...new Set([
    ...reports.filter(r => r.target_type === 'user').map(r => r.target_id),
    ...reports.map(r => r.reporter_id),
  ])]

  const [{ data: listings }, { data: profiles }] = await Promise.all([
    listingIds.length
      ? supabaseAdmin.from('listings').select('id, title, user_id, is_removed').in('id', listingIds)
      : { data: [] },
    profileIds.length
      ? supabaseAdmin.from('profiles').select('id, username, full_name').in('id', profileIds)
      : { data: [] },
  ])

  return {
    listings: Object.fromEntries((listings ?? []).map(l => [l.id, l])),
    profiles: Object.fromEntries((profiles ?? []).map(p => [p.id, p])),
  }
}

export default async function AdminReportsPage() {
  // Non-admins get a 404, so the page's existence is not revealed
  const admin = await getAdminUser()
  if (!admin) notFound()
  const supabaseAdmin = getSupabaseAdmin()

  const [{ data: open }, { data: resolved }] = await Promise.all([
    supabaseAdmin.from('reports').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(100),
    supabaseAdmin.from('reports').select('*').neq('status', 'open').order('resolved_at', { ascending: false }).limit(20),
  ])

  const targets = await loadTargets([...(open ?? []), ...(resolved ?? [])])

  return <AdminReportsClient open={open ?? []} resolved={resolved ?? []} targets={targets} />
}
