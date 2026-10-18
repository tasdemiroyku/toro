import { createClient } from '@/utils/supabase/server'
import HomeClient from '@/components/HomeClient'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: listings, error }, { data: categoryRows }] = await Promise.all([
    supabase
      .from('listings')
      .select('*, profiles(id, full_name, avatar_url, username, is_verified)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(12),
    // Only the category column; fine at this scale (swap for a SQL view/RPC later)
    supabase.from('listings').select('category').eq('is_active', true),
  ])

  if (error) {
    console.error('Supabase error on Home:', error.message)
  }

  const categoryCounts = {}
  for (const { category } of categoryRows ?? []) {
    categoryCounts[category] = (categoryCounts[category] ?? 0) + 1
  }

  return <HomeClient user={user} listings={listings || []} categoryCounts={categoryCounts} />
}