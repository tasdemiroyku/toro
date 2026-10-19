import Image from 'next/image'
import Link from 'next/link'
import ToretBull from '@/components/ToretBull'

const HIGHLIGHTS = [
  'Students helping students across Turin: tutoring, paperwork, moving and more',
  // U+2011 non-breaking hyphen keeps "e-mail" on one line
  'Verified Student badge confirmed through your university e\u2011mail',
  'Message providers directly. Free to join.',
]

/**
 * Split layout shared by login, sign-up and password reset.
 * Desktop: the page is exactly one viewport tall. Brand panel on the left (slow
 * zoom on the photo; text scales down on short windows), form column on the right
 * that starts at a fixed height (so switching modes never moves the heading) and
 * scrolls on its own when the form is taller than the window.
 * Mobile: form only, normal page flow.
 */
export default function AuthShell({ children }) {
  return (
    <div className="min-h-[calc(100dvh-72px)] lg:h-[calc(100dvh-72px)] lg:min-h-0 grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] bg-toro-light">
      <aside className="relative hidden lg:flex flex-col justify-end p-12 xl:p-16 [@media(max-height:760px)]:p-10 overflow-hidden">
        <Image
          src="/images/torino-river.jpg"
          alt="The Po river and Monte dei Cappuccini in Turin"
          fill
          sizes="50vw"
          fetchPriority="high"
          className="toro-ken-burns object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-toro-dark via-toro-dark/70 to-toro-dark/30" />

        <div className="relative z-10 flex flex-col gap-6 [@media(max-height:760px)]:gap-4 max-w-md text-toro-light">
          <ToretBull className="w-12 h-12 [@media(max-height:760px)]:w-10 [@media(max-height:760px)]:h-10 text-toro-gold" />
          <h2 className="text-4xl xl:text-[2.75rem] [@media(max-height:760px)]:text-3xl font-bold tracking-tight leading-tight">
            The marketplace of Turin&apos;s students.
          </h2>
          <ul className="flex flex-col gap-3 text-sm text-toro-light/80 [@media(max-height:620px)]:hidden">
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

      <section className="relative flex flex-col min-h-0 px-5 sm:px-10 lg:overflow-y-auto lg:overscroll-contain">
        <div className="flex-1 flex justify-center pt-12 pb-12 lg:pt-[clamp(2.5rem,9vh,6rem)]">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <footer className="py-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-toro-dark/65">
          <Link href="/privacy" className="hover:text-toro-dark transition">Privacy</Link>
          <Link href="/terms" className="hover:text-toro-dark transition">Terms</Link>
          <Link href="/contact" className="hover:text-toro-dark transition">Contact</Link>
          <span suppressHydrationWarning>© {new Date().getFullYear()} Toro</span>
        </footer>
      </section>
    </div>
  )
}
