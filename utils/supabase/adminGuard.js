/**
 * utils/supabase/adminGuard.js
 *
 * Server-only helper (deliberately not a 'use server' module, so it is not
 * exposed as a callable Server Action). Returns the signed-in user when they are
 * an admin (private_profiles.is_admin), otherwise null.
 */
import { createClient } from '@/utils/supabase/server'
import supabaseAdmin from '@/utils/supabase/admin'

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabaseAdmin
    .from('private_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  return data?.is_admin ? user : null
}
