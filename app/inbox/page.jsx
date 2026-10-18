import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import InboxClient from '@/components/InboxClient'

export const metadata = { title: 'Inbox' }

export default async function InboxPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/inbox')

  // Fetch all messages involving this user, joined with profiles + listing
  // Use column-name FK hints since messages has two FKs to profiles
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      id,
      listing_id,
      sender_id,
      receiver_id,
      content,
      read,
      created_at,
      listing:listings!messages_listing_id_fkey ( id, title, image_url ),
      sender:profiles!messages_sender_id_fkey ( id, full_name, avatar_url, is_verified ),
      receiver:profiles!messages_receiver_id_fkey ( id, full_name, avatar_url, is_verified )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) console.error('Inbox fetch error:', error.message)

  // Read active conversation from URL search params
  const { listing: listingId, with: withUserId } = await searchParams

  return (
    <InboxClient
      initialMessages={messages ?? []}
      currentUserId={user.id}
      activeListingId={listingId ?? null}
      activeWithUserId={withUserId ?? null}
    />
  )
}