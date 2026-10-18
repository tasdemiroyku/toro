import { NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/proxy'

const PROTECTED_ROUTES = ['/profile', '/listings/create', '/listings/my', '/inbox']

// Routes that are always publicly accessible — even without a username
const PUBLIC_PREFIXES = ['/listings', '/u/', '/login', '/onboarding', '/reset-password', '/auth/', '/api/', '/privacy', '/terms', '/contact']

function isPublicRoute(pathname) {
  if (pathname === '/') return true
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export async function proxy(request) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // ── 1. Onboarding gate (zero DB cost — reads from JWT metadata) ─────────
  // Any logged-in user without a username is funnelled to /onboarding.
  // The username is written into user_metadata when onboarding completes,
  // so this check is free (no Supabase DB round-trip required).
  if (user) {
    const hasUsername = !!user.user_metadata?.username
    const isOnboarding = pathname.startsWith('/onboarding')
    const isAuthRoute = pathname.startsWith('/auth/')

    if (!hasUsername && !isOnboarding && !isAuthRoute) {
      // Redirect to onboarding, preserving the intended destination
      const onboardingUrl = new URL('/onboarding', request.url)
      if (!isPublicRoute(pathname)) {
        onboardingUrl.searchParams.set('next', pathname)
      }
      return NextResponse.redirect(onboardingUrl)
    }

    // Already has username → don't let them re-visit onboarding
    if (hasUsername && isOnboarding) {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  // ── 2. Protect authenticated routes ──────────────────────────────────────
  const isDynamicProtected = /^\/listings\/[^/]+\/edit$/.test(pathname)

  if (
    (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) || isDynamicProtected)
    && !user
  ) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 3. Redirect logged-in users away from /login ──────────────────────
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}