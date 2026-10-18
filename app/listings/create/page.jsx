import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CreateListingClient from '@/components/CreateListingClient'

export const metadata = { title: 'Post a service' }

export default async function CreateListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // proxy.js already guards this route, but defense-in-depth doesn't hurt
  if (!user) redirect('/login?redirectTo=/listings/create')

  return <CreateListingClient userId={user.id} />
}