'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import ToretBull from '@/components/ToretBull'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/listings', label: 'Browse services' },
      { href: '/listings/create', label: 'Post a service' },
      { href: '/login?mode=signup', label: 'Create an account' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: 'https://github.com/tasdemiroyku/toro', label: 'Source on GitHub', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Use' },
    ],
  },
]

// Launch-updates sign-up (POST /api/subscribe → subscribers table)
function LaunchUpdates() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'done' : 'error')
      if (res.ok) setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <p className="text-sm font-semibold text-toro-light">Launch updates</p>
      <p className="text-sm text-toro-light/65">One e-mail when Toro opens to everyone. Nothing else.</p>
      {status === 'done' ? (
        <p role="status" className="text-sm text-toro-gold">Thanks. We will let you know.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <label htmlFor="footer-email" className="sr-only">E-mail address</label>
          <input
            id="footer-email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-xl bg-toro-light/10 border border-toro-light/15 px-4 py-2.5 text-sm text-toro-light placeholder:text-toro-light/40 outline-none focus:border-toro-gold transition"
          />
          <button type="submit" disabled={status === 'sending'} className="rounded-xl bg-toro-gold px-4 py-2.5 text-sm font-semibold text-toro-dark hover:brightness-110 disabled:opacity-60 transition">
            {status === 'sending' ? 'Saving…' : 'Notify me'}
          </button>
        </form>
      )}
      {status === 'error' && <p role="alert" className="text-xs text-red-300">Something went wrong. Please try again.</p>}
    </div>
  )
}

export default function Footer() {
  const pathname = usePathname()

  // Focus-heavy pages render their own minimal footer
  if (pathname === '/login' || pathname === '/reset-password') {
    return null
  }

  return (
    <footer className="bg-toro-dark pt-16 pb-8">
      <div className="toro-container flex flex-col gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_2fr] gap-12">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <ToretBull className="w-9 h-9 text-toro-light" />
              <span className="font-logo text-[28px] font-bold text-toro-light leading-none">Toro</span>
            </Link>
            <LaunchUpdates />
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLUMNS.map(column => (
              <div key={column.title} className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-toro-gold">{column.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map(link => (
                    <li key={link.href}>
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-toro-light/75 hover:text-toro-light transition">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-sm text-toro-light/75 hover:text-toro-light transition">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-toro-light/10 flex flex-col sm:flex-row gap-2 justify-between text-xs text-toro-light/60">
          <span suppressHydrationWarning>© {new Date().getFullYear()} Toro. Made in Turin.</span>
          <span>Named after the Toret, Turin&apos;s bull-head drinking fountains.</span>
        </div>
      </div>
    </footer>
  )
}
