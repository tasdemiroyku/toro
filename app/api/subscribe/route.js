import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Same rule as the subscribers.email_format CHECK constraint
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export async function POST(request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('subscribers').insert({ email })

  // 23505 = already subscribed. Report success either way so the endpoint
  // does not reveal which addresses are on the list.
  if (error && error.code !== '23505') {
    console.error('Subscribe failed:', error.message)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
