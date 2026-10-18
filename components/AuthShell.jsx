import ToretBull from '@/components/ToretBull'

const HIGHLIGHTS = [
  'Students helping students across Turin: tutoring, paperwork, moving and more',
  'Verified Student badge confirmed through your university e-mail',
  'Message providers directly. Free to join.',
]

/**
 * Split layout shared by login, sign-up and password reset.
 * Desktop: brand panel (photo + value points) on the left, form on the right.
 * Mobile: form only.
 */
export default function AuthShell({ children }) {
  return (
    <div className="min-h-[calc(100dvh-72px)] grid lg:grid-cols-2 bg-toro-light">
      <aside className="relative hidden lg:flex flex-col justify-end p-12 xl:p-16 overflow-hidden">
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

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </div>
  )
}
