import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import ContactClient from '@/components/ContactClient'

export const metadata = {
  title: 'Contact',
  description: 'Questions, feedback or a privacy request? Write to the Toro team.',
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="bg-toro-light">
      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-20 flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-widest uppercase text-toro-gold">Contact</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-toro-dark" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Write to us
          </h1>
          <p className="text-base text-toro-dark/60 leading-relaxed">
            Questions, feedback, a problem with a listing, or a request about your personal data
            (see the <Link href="/privacy" className="underline text-toro-dark">Privacy Policy</Link>):
            your message goes straight to the founders.
          </p>
        </header>

        <ContactClient
          defaultName={user?.user_metadata?.full_name ?? ''}
          defaultEmail={user?.email ?? ''}
        />
      </div>
    </div>
  )
}
