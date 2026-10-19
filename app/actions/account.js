'use server'

import { createClient } from '@/utils/supabase/server'
import { getSupabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

const BUCKET = 'toro-uploads'

/**
 * Removes everything the user uploaded: avatars/{uid}/… and listings/{uid}/{listingId}/…
 * Storage objects are not covered by database cascades, so they are deleted explicitly.
 */
async function removeUserFiles(userId) {
  const supabaseAdmin = getSupabaseAdmin()
  const bucket = supabaseAdmin.storage.from(BUCKET)
  const paths = []

  const { data: avatarFiles } = await bucket.list(`avatars/${userId}`, { limit: 1000 })
  for (const file of avatarFiles ?? []) paths.push(`avatars/${userId}/${file.name}`)

  const { data: listingFolders } = await bucket.list(`listings/${userId}`, { limit: 1000 })
  for (const folder of listingFolders ?? []) {
    const { data: files } = await bucket.list(`listings/${userId}/${folder.name}`, { limit: 1000 })
    for (const file of files ?? []) paths.push(`listings/${userId}/${folder.name}/${file.name}`)
  }

  if (paths.length) {
    const { error } = await bucket.remove(paths)
    if (error) console.warn('Some uploaded files could not be deleted:', error.message)
  }
}

/**
 * Permanently deletes the user account: uploaded files, public.profiles (which
 * cascades to listings, messages and private data) and auth.users
 */
export async function deleteUserAccount() {
  const supabaseAdmin = getSupabaseAdmin()
  const supabase = await createClient()

  // 1. Authenticate the requester
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Authentication failed during account deletion:', authError)
    throw new Error('Authentication required.')
  }

  try {
    // 2. Remove uploaded photos from storage
    await removeUserFiles(user.id)

    // 3. Remove user metadata and profile from public schema
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.warn('Profile record could not be deleted:', profileError.message)
    }

    // 4. Delete the user from the core authentication system via Admin API
    const { error: adminDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (adminDeleteError) {
      throw adminDeleteError
    }

    // 5. Clear the local session and send the user home
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('Critical error during account deletion process:', error)
    throw new Error('Failed to delete account. Please contact support if the issue persists.')
  }

  redirect('/')
}