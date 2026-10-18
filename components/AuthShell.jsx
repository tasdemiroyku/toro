import Link from 'next/link'
import ToretBull from '@/components/ToretBull'

const HIGHLIGHTS = [
  'Students helping students across Turin: tutoring, paperwork, moving and more',
  'Verified Student badge confirmed through your university e-mail',
  'Message providers directly. Free to join.',
]

/**
 * Split layout shared by login, sign-up and password reset.
 * Desktop: brand panel pinned to the viewport on the left (it does not grow or
 * shift when the form gets longer), form column on the right.
 * Mobile: form only.
 */
export default function AuthShell({ children }) {
  return (
    <div className="min-h-[calc(100dvh-72px)] grid lg:grid-cols-2 bg-toro-light">
      <aside className="relative hidden lg:flex lg:sticky lg:top-[72px] lg:h-[calc(100dvh-72px)] self-start flex-col justify-end p-12 xl:p-16 overflow-hidden">
        <img
          src="/images/torino-river.jpg"
          alt="The Po river and Monte dei Cappuccini in Turin"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-toro-dark via-toro-dark/75 to-toro-dark/20" />

        <div className="relative z-10 flex flex-col gap-6 max-w-md text-toro-light">
          <ToretBull className="w-12 h-12 text-toro-gold" />
          <h2
            className="text-4xl xl:text-5xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            The marketplace of Turin&apos;s students.
          </h2>
          <ul className="flex flex-col gap-3 text-sm text-toro-light/80">
            {HIGHLIGHTS.map(text => (
              <li key={text} className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-toro-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="flex flex-col px-5 sm:px-10">
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <footer className="py-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-toro-dark/40">
          <Link href="/privacy" className="hover:text-toro-dark transition">Privacy</Link>
          <Link href="/terms" className="hover:text-toro-dark transition">Terms</Link>
          <Link href="/contact" className="hover:text-toro-dark transition">Contact</Link>
          <span suppressHydrationWarning>© {new Date().getFullYear()} Toro</span>
        </footer>
      </section>
    </div>
  )
}
