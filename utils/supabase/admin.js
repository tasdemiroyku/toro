import { createClient } from '@supabase/supabase-js'

let client

/**
 * WARNING: This client uses the secret key.
 * It bypasses Row Level Security (RLS).
 * Use ONLY on the server: Server Actions, server pages and API Routes.
 *
 * The client is created on first use, so importing this module (for example
 * while Next.js collects page data during the build) never needs the secret.
 */
export function getSupabaseAdmin() {
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY, // Uses the SECRET key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  return client
}
