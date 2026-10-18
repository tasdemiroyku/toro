import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import OnboardingClient from '@/components/OnboardingClient'
import { safeRedirectPath } from '@/lib/redirect'

export const metadata = { title: 'Complete your profile' }

export default async function OnboardingPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → send to login
  if (!user) redirect('/login')

  // Already has a username → proxy.js handles this, but defense-in-depth
  if (user.user_metadata?.username) redirect('/profile')

  const { next } = await searchParams
  const redirectAfter = safeRedirectPath(next)

  // Pre-fetch the profile row — may already exist from a DB trigger
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // If the profile somehow already has a username, sync metadata and redirect
  if (profile?.username) {
    await supabase.auth.updateUser({ data: { username: profile.username } })
    redirect(redirectAfter)
  }

  return (
    <OnboardingClient
      user={user}
      profile={profile}
      redirectAfter={redirectAfter}
    />
  )
}