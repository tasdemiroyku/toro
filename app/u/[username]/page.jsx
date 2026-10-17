import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProfileClient from '@/components/ProfileClient'
import { PUBLIC_PROFILE_COLUMNS } from '@/lib/profile'

export async function generateMetadata({ params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, username')
    .eq('username', username)
    .single()

  if (!profile) return { title: 'Profile not found' }

  return {
    title: profile.full_name || `@${username}`,
    description: profile.bio?.slice(0, 160) || `View ${profile.full_name || username}'s services on Toro.`,
  }
}

export default async function PublicProfilePage({ params }) {
  const { username } = await params
  const supabase = await createClient()

  // Validate username format before hitting the database
  const USERNAME_RE = /^[a-z0-9_]{3,30}$/
  if (!USERNAME_RE.test(username)) notFound()

  // Fetch profile and current viewer in parallel
  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase.from('profiles').select(PUBLIC_PROFILE_COLUMNS).eq('username', username).single(),
    supabase.auth.getUser(),
  ])

  if (!profile) notFound()

  // Fetch this user's active listings
  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(id, full_name, avatar_url, username, is_verified)')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="min-h-screen bg-toro-light font-sans">
      <ProfileClient
        profile={profile}
        listings={listings ?? []}
        isOwnProfile={isOwnProfile}
        currentUserId={user?.id ?? null}
      />
    </div>
  )
}