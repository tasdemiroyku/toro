import Link from 'next/link'
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/lib/site'

/**
 * Shared layout and typography for /privacy and /terms (Server Component).
 */
export default function LegalPage({ title, intro, children }) {
  return (
    <div className="bg-toro-light">
      <article className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        <header className="flex flex-col gap-3 pb-10 mb-10 border-b border-toro-dark/10">
          <p className="text-xs font-bold tracking-widest uppercase text-toro-gold">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-toro-dark" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            {title}
          </h1>
          <p className="text-sm text-toro-dark/50">
            Last updated: {LEGAL_LAST_UPDATED} · Pre-launch version
          </p>
          {intro && <p className="text-base text-toro-dark/70 leading-relaxed mt-2">{intro}</p>}
        </header>

        <div className="flex flex-col gap-10">{children}</div>

        <footer className="mt-16 pt-8 border-t border-toro-dark/10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/privacy" className="text-toro-dark/60 hover:text-toro-dark">Privacy Policy</Link>
          <Link href="/terms" className="text-toro-dark/60 hover:text-toro-dark">Terms of Use</Link>
          <Link href="/" className="text-toro-dark/60 hover:text-toro-dark">Back to Toro</Link>
        </footer>
      </article>
    </div>
  )
}

export function LegalSection({ title, children }) {
  return (
    <section className="flex flex-col gap-3 text-[15px] text-toro-dark/75 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_strong]:text-toro-dark [&_a]:text-toro-dark [&_a]:underline">
      <h2 className="text-xl font-bold text-toro-dark">{title}</h2>
      {children}
    </section>
  )
}

export function ContactLine() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  ) : (
    <Link href="/contact">our contact form</Link>
  )
}
