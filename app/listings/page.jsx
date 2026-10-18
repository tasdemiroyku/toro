import { createClient } from '@/utils/supabase/server'
import ListingsClient from '@/components/ListingsClient'

export const metadata = {
  title: 'Services in Torino',
}

const PAGE_SIZE = 12

export default async function ListingsPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { q, category, page } = await searchParams
  const rawQuery = q?.trim().slice(0, 100) ?? ''
  const searchQuery = rawQuery.replace(/[().,]/g, '')
  const activeCategory = category?.trim() ?? ''
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // --- 1. Fetch Listings (with Search Logic) ---
  let listingsQuery = supabase
    .from('listings')
    .select('*, profiles(id, full_name, avatar_url, username, is_verified)', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (activeCategory) {
    listingsQuery = listingsQuery.eq('category', activeCategory)
  }

  if (searchQuery) {
    listingsQuery = listingsQuery.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
    )
  }

  // --- 2. Fetch Profiles (The Unified Part) ---
  // We only search for students if there is an active search query
  let profiles = []
  if (searchQuery && !activeCategory) {
    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username, is_verified, bio, skills')
      .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,skills.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
      .not('username', 'is', null)
      .limit(5) // Limit to top 5 matches to keep the focus on services
    
    profiles = matchedProfiles ?? []
  }

  const { data: listings, count, error } = await listingsQuery

  if (error) console.error('Search error:', error.message)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen flex flex-col bg-toro-light font-sans">
      <main className="flex-grow toro-container py-12">
        <ListingsClient
          user={user}
          initialListings={listings ?? []}
          initialProfiles={profiles} // Passing found students
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={count ?? 0}
        />
      </main>
    </div>
  )
}