import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ListingDetailClient from '@/components/ListingDetailClient'
import { PUBLIC_PROFILE_COLUMNS } from '@/lib/profile'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, category')
    .eq('id', id)
    .single()

  if (!listing) return { title: 'Listing not found' }

  return {
    title: listing.title,
    description: listing.description?.slice(0, 160),
  }
}

export default async function ListingDetailPage({ params }) {
  const { id } = await params

  // Validate UUID — security first
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) notFound()

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Single joined query — listing + public profile fields only
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`*, profiles(${PUBLIC_PROFILE_COLUMNS})`)
    .eq('id', id)
    .single()

  if (error || !listing) notFound()

  const profile = listing.profiles
  const isOwner = user?.id === listing.user_id

  return (
    <div className="min-h-screen bg-toro-light font-sans">
      <ListingDetailClient
        listing={listing}
        profile={profile}
        user={user}
        isOwner={isOwner}
      />
    </div>
  )
}