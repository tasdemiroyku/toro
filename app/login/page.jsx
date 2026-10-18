import LoginClient from '@/components/LoginClient'
import { safeRedirectPath } from '@/lib/redirect'

export const metadata = {
  title: 'Log in',
}

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const candidate = resolvedSearchParams?.redirectTo ?? resolvedSearchParams?.next
  const redirectTarget = safeRedirectPath(candidate)

  return <LoginClient redirectTarget={redirectTarget} />
}
