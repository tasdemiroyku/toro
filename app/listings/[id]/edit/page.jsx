import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import EditListingClient from '@/components/EditListingClient'

export const metadata = { title: 'Edit listing' }

export default async function EditListingPage({ params }) {
  const { id } = await params

  // UUID guard — same pattern as listing detail
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID.test(id)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  // Only the owner can edit
  if (listing.user_id !== user.id) redirect(`/listings/${id}`)

  return <EditListingClient listing={listing} />
}