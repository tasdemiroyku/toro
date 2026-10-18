import Link from 'next/link'
import ToretBull from '@/components/ToretBull'
import CategoryIcon from '@/components/CategoryIcon'

const HIGHLIGHTS = [
  'Students helping students across Turin: tutoring, paperwork, moving and more',
  // U+2011 non-breaking hyphen keeps "e-mail" on one line
  'Verified Student badge confirmed through your university e\u2011mail',
  'Message providers directly. Free to join.',
]

// Illustrative product UI: what a listing looks like on Toro (labelled "Preview")
function PreviewCard() {
  return (
    <div className="toro-float w-[300px] rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 text-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-toro-gold text-toro-dark flex items-center justify-center">
            <CategoryIcon category="tutoring" className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-toro-gold">Tutoring</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Preview</span>
      </div>

      <p className="mt-4 font-semibold leading-snug">Calculus &amp; Linear Algebra for PoliTo first-years</p>
      <p className="mt-1.5 text-sm text-white/70 leading-relaxed">Theory first, then past exam papers step by step.</p>

      <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm">
          <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">M</span>
          Marta R.
        </span>
        <span className="font-bold">
          €18<span className="ml-1 text-xs font-medium text-white/60">/ hour</span>
        </span>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white/85">
        <span className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        Verified Student · studenti.polito.it
      </div>
    </div>
  )
}

/**
 * Split layout shared by login, sign-up and password reset.
 * Desktop: brand panel pinned to the viewport on the left (slow zoom on the photo,
 * a floating product preview, value points), form column on the right.
 * Mobile: form only.
 */
export default function AuthShell({ children }) {
  return (
    <div className="min-h-[calc(100dvh-72px)] grid lg:grid-cols-2 bg-toro-light">
      <aside className="relative hidden lg:flex lg:sticky lg:top-[72px] lg:h-[calc(100dvh-72px)] self-start flex-col justify-between p-12 xl:p-16 overflow-hidden">
        <img
          src="/images/torino-river.jpg"
          alt="The Po river and Monte dei Cappuccini in Turin"
          className="toro-ken-burns absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-toro-dark via-toro-dark/70 to-toro-dark/30" />

        <div className="relative z-10 self-end" aria-hidden="true">
          <PreviewCard />
        </div>

        <div className="relative z-10 flex flex-col gap-6 max-w-md text-toro-light">
          <ToretBull className="w-12 h-12 text-toro-gold" />
          <h2 className="text-4xl xl:text-[2.75rem] font-bold tracking-tight leading-tight">
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
