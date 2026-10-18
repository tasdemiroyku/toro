import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MyListingsClient from '@/components/MyListingsClient'

export const metadata = { title: 'My listings' }

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <MyListingsClient listings={listings ?? []} />
}