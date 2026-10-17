import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/redirect'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // `next` is user-controlled: only allow same-origin paths
  const next = safeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Re-fetch the user after the session is established
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fast-path: metadata already has username (returning user)
        if (user.user_metadata?.username) {
          return NextResponse.redirect(`${origin}${next}`)
        }

        // Slower path: first-time OAuth user — check the DB
        // This only fires once per user, so the extra query is acceptable.
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.username) {
          // Profile has a username but metadata doesn't (sync lag).
          // Write it back to metadata so future middleware checks are free.
          await supabase.auth.updateUser({
            data: { username: profile.username },
          })
          return NextResponse.redirect(`${origin}${next}`)
        }

        // No username anywhere → send to onboarding
        const onboardingUrl = new URL('/onboarding', origin)
        if (next !== '/') onboardingUrl.searchParams.set('next', next)
        return NextResponse.redirect(onboardingUrl.toString())
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}