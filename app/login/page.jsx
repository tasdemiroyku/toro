import LoginClient from '@/components/LoginClient'
import { safeRedirectPath } from '@/lib/redirect'

export const metadata = {
  title: 'Log in',
}

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const candidate = resolvedSearchParams?.redirectTo ?? resolvedSearchParams?.next
  const redirectTarget = safeRedirectPath(candidate)

  const mode = resolvedSearchParams?.mode === 'signup' ? 'signup' : 'login'

  // key: remount when the header switches between ?mode=signup and log in
  return <LoginClient key={mode} redirectTarget={redirectTarget} initialMode={mode} />
}
