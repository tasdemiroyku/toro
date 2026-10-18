'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ToretBull from './ToretBull'
import { CATEGORIES, CATEGORY_LABEL } from '@/lib/categories'
import ListingCard from '@/components/ListingCard'
import CategoryIcon from '@/components/CategoryIcon'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}
const stagger = { visible: { transition: { staggerChildren: 0.15 } } }

const HOW_IT_WORKS = [
  { title: 'Find', text: 'Search by keyword or category and compare people, prices and the languages they speak.' },
  { title: 'Message', text: 'Ask questions in the built-in inbox before you agree on anything.' },
  { title: 'Meet', text: 'Agree on the time and price directly. Toro takes no commission.' },
]

// Our own video stills (public/images/toret)
const TORET_PHOTOS = [
  { src: '/images/toret/bull.jpg', alt: 'Close-up of a Toret bull-head fountain' },
  { src: '/images/toret/street.jpg', alt: 'Two Toret fountains on a cobbled street' },
  { src: '/images/toret/corner.jpg', alt: 'A Toret fountain with people walking past' },
  { src: '/images/toret/gate.jpg', alt: 'Someone drinking from a Toret by a gate' },
]

// Shortcuts under the hero search
const QUICK_CATEGORIES = ['tutoring', 'consular', 'moving', 'pet_care']

// ── Hero background video ─────────────────────────────────────────────────────
// The poster image is the first paint (and the LCP element). The 0.8 MB video is
// only fetched on wide screens, when the user allows motion and has no data saver.
const VIDEO_QUERY = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'

function subscribeToVideoQuery(onChange) {
  const media = window.matchMedia(VIDEO_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
const shouldPlayVideo = () =>
  window.matchMedia(VIDEO_QUERY).matches && navigator.connection?.saveData !== true
const shouldPlayVideoOnServer = () => false

function HeroBackground() {
  const playVideo = useSyncExternalStore(subscribeToVideoQuery, shouldPlayVideo, shouldPlayVideoOnServer)
  const [videoReady, setVideoReady] = useState(false)

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <img src="/images/hero-poster.jpg" alt="" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
      {playVideo && (
        <video
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          autoPlay muted loop playsInline preload="auto"
          onCanPlay={() => setVideoReady(true)}
        >
          <source src="/images/hero.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  )
}

// ── Home page ─────────────────────────────────────────────────────────────────
export default function HomeClient({ user, listings, categoryCounts = {} }) {
  const router = useRouter()
  const [heroSearch, setHeroSearch] = useState('')
  const totalServices = Object.values(categoryCounts).reduce((sum, n) => sum + n, 0)

  // ── Latest services: native horizontal scroll (touchpad, touch, keyboard) ──
  // with scroll-snap; the arrow buttons scroll by one visible page.
  const trackRef = useRef(null)
  const [edges, setEdges] = useState({ atStart: true, atEnd: false })

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setEdges({
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(updateEdges)
    window.addEventListener('resize', updateEdges)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges])

  const scrollPage = (direction) => {
    const el = trackRef.current
    el?.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }

  const handleSearch = () => {
    const q = heroSearch.trim()
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : '/listings')
  }

  return (
    <div className="bg-toro-light font-sans">

      {/* ── Hero ── */}
      <section className="relative min-h-[680px] h-[88svh] max-h-[860px] flex items-center overflow-hidden">
        <HeroBackground />
        {/* Cinematic overlay: dark at the top (header) and bottom, lighter in the middle */}
        <div className="absolute inset-0 bg-linear-to-b from-toro-dark/85 via-toro-dark/45 to-toro-dark/90" />

        <motion.div className="relative z-10 toro-container flex flex-col items-center text-center pt-16" initial="hidden" animate="visible" variants={stagger}>
          <motion.h1 variants={fadeUp} className="max-w-2xl text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-white text-balance">
            Help from students, around{' '}
            <span className="relative inline-block">
              the corner.
              {/* Hand-drawn gold underline, drawn in after the headline appears */}
              <svg aria-hidden="true" viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute left-0 -bottom-1.5 md:-bottom-2.5 w-full h-2.5 md:h-3.5 text-toro-gold">
                <motion.path
                  d="M3 10 C 45 4, 120 2, 197 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
                />
              </svg>
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-lg text-base md:text-lg text-white/80 text-balance">
            Tutoring, Italian paperwork, moving and more, from people who study in Turin.
          </motion.p>

          <motion.form
            variants={fadeUp}
            onSubmit={e => { e.preventDefault(); handleSearch() }}
            className="mt-9 w-full max-w-xl flex items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-xl p-1 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] focus-within:border-white/50 focus-within:bg-white/15 transition"
          >
            <label htmlFor="hero-search" className="sr-only">Search services</label>
            <input
              id="hero-search"
              type="text"
              placeholder="What do you need help with?"
              value={heroSearch}
              onChange={e => setHeroSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder:text-white/60 text-[15px] py-2.5 px-5"
            />
            <button type="submit" className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-toro-gold text-toro-dark text-sm font-semibold px-4 py-2.5 hover:brightness-110 active:scale-[0.98] transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>
          </motion.form>

          <motion.div variants={fadeUp} className="mt-5 flex flex-wrap justify-center gap-2">
            {QUICK_CATEGORIES.map(value => (
              <Link
                key={value}
                href={`/listings?category=${value}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3.5 py-1.5 text-sm text-white/85 hover:bg-white/15 hover:text-white transition"
              >
                <CategoryIcon category={value} className="w-3.5 h-3.5" strokeWidth={2} />
                {CATEGORY_LABEL[value]}
              </Link>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} className="mt-8 text-sm text-white/65">
            {totalServices} services · {CATEGORIES.length} categories · Free to join
          </motion.p>
        </motion.div>
      </section>

      {/* ── Browse by category ── */}
      <motion.section className="toro-container pt-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
        <motion.div variants={fadeUp} className="flex items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-toro-dark">Browse by category</h2>
            <p className="text-sm text-toro-dark/65">Everyday help from people who study in Turin.</p>
          </div>
          <Link href="/listings" className="text-sm font-semibold text-toro-dark/60 hover:text-toro-gold transition whitespace-nowrap">
            All services →
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => {
            const count = categoryCounts[cat.value] ?? 0
            return (
              <motion.div key={cat.value} variants={fadeUp}>
                <Link
                  href={`/listings?category=${cat.value}`}
                  className="group h-full flex flex-col gap-3 rounded-2xl border border-toro-dark/10 bg-white p-4 hover:border-toro-gold/60 hover:shadow-[0_12px_30px_-18px_rgba(19,38,0,0.3)] transition-all"
                >
                  <span className="w-9 h-9 rounded-xl bg-toro-dark/5 text-toro-dark flex items-center justify-center group-hover:bg-toro-dark group-hover:text-toro-gold transition-colors">
                    <CategoryIcon category={cat.value} className="w-[18px] h-[18px]" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-toro-dark leading-snug">{cat.label}</span>
                    <span className="text-xs text-toro-dark/65 leading-snug">{cat.examples}</span>
                  </span>
                  <span className="mt-auto text-[11px] font-medium text-toro-dark/65">
                    {count > 0 ? `${count} service${count === 1 ? '' : 's'}` : 'Be the first'}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* ── Latest services ── */}
      <motion.section className="toro-container py-24" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>

        {/* Header row: title on the left, carousel controls and "view all" on the right */}
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <h2 className="text-3xl font-bold tracking-tight text-toro-dark">Latest services</h2>
          <div className="flex items-center gap-3">
            {listings.length > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => scrollPage(-1)} disabled={edges.atStart} aria-label="Previous" className="w-10 h-10 rounded-full border border-toro-dark/15 text-toro-dark/60 flex items-center justify-center hover:border-toro-gold hover:text-toro-gold transition disabled:opacity-30 disabled:pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button onClick={() => scrollPage(1)} disabled={edges.atEnd} aria-label="Next" className="w-10 h-10 rounded-full border border-toro-dark/15 text-toro-dark/60 flex items-center justify-center hover:border-toro-gold hover:text-toro-gold transition disabled:opacity-30 disabled:pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            )}
            <Link href="/listings" className="text-sm font-semibold text-toro-dark/60 hover:text-toro-gold transition whitespace-nowrap">
              View all →
            </Link>
          </div>
        </motion.div>

        {listings.length > 0 ? (
          <div
            ref={trackRef}
            onScroll={updateEdges}
            role="region"
            aria-label="Latest services"
            tabIndex={0}
            className="flex gap-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-px-6 -mx-6 px-6 py-6 -my-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {listings.map(item => (
              <div
                key={item.id}
                className="snap-start shrink-0 w-[85%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]"
              >
                <ListingCard listing={item} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="toro-empty-state">
            <div className="w-16 h-16 text-toro-dark/15"><ToretBull className="w-full h-full" /></div>
            <div className="flex flex-col gap-1.5">
              <p className="text-toro-dark text-lg font-bold">No services here yet</p>
              <p className="text-toro-dark/65 text-sm max-w-xs mx-auto font-medium">Be the first to offer help to the student community in Torino.</p>
            </div>
            <button onClick={() => router.push(user ? '/listings/create' : '/login')} className="toro-btn-primary px-8">Post a service</button>
          </motion.div>
        )}
      </motion.section>

      {/* ── How it works ── */}
      <motion.section className="bg-toro-cream py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
        <div className="toro-container">
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-toro-dark mb-10">How it works</motion.h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.li key={step.title} variants={fadeUp} className="flex flex-col gap-3 rounded-2xl border border-toro-dark/10 bg-white p-6">
                <span className="w-9 h-9 rounded-full bg-toro-gold/15 text-toro-dark text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <h3 className="text-lg font-bold text-toro-dark">{step.title}</h3>
                <p className="text-sm text-toro-dark/70 leading-relaxed">{step.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </motion.section>

      {/* ── Made in Turin ── */}
      <motion.section className="toro-container py-24" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={stagger}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 items-center">
          <motion.div variants={fadeUp} className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-toro-gold">Made in Turin</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-toro-dark text-balance">
              Named after the green bulls on every corner.
            </h2>
            <p className="text-toro-dark/70 leading-relaxed">
              The <em>Toret</em> are Turin&apos;s cast-iron drinking fountains. There are hundreds of them,
              free for anyone who walks by. We want help between students to feel the same: close,
              simple and part of the city.
            </p>
            <p className="text-xs text-toro-dark/55">Photos: our own footage of Toret around Turin.</p>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 md:gap-4">
            {TORET_PHOTOS.map((photo, i) => (
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className={`w-full aspect-[4/3] object-cover rounded-2xl ${i % 2 === 1 ? 'translate-y-6 md:translate-y-10' : ''}`}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Why Toro ── */}
      <motion.section className="bg-toro-dark py-24" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
        <div className="toro-container">
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-toro-light mb-12">Why Toro is different</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Student verified', desc: 'Sign up with your university email to earn a Verified Student badge, so you always know who you are dealing with.' },
              { title: 'Built for newcomers', desc: 'Every provider lists the languages they speak, so you can get help in Italian, English, Turkish and more.' },
              { title: 'Your first step', desc: 'Never worked before? No problem. Toro is designed to help students take their first professional step with confidence.' },
            ].map(item => (
              <motion.div key={item.title} variants={fadeUp} className="flex flex-col gap-3">
                <div className="w-8 h-1 bg-toro-gold rounded-full" />
                <h3 className="text-lg font-bold text-toro-light">{item.title}</h3>
                <p className="text-sm text-toro-light/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Call to action ── */}
      <motion.section className="toro-container py-24" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] bg-toro-dark px-8 py-14 md:px-14 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <ToretBull className="absolute -right-10 -bottom-12 w-64 h-64 text-toro-gold/10 pointer-events-none" />
          <div className="relative flex flex-col gap-3 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-toro-light text-balance">Have a skill other students need?</h2>
            <p className="text-toro-light/75">Post a service in a couple of minutes. It is free, and you set the price.</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <Link href={user ? '/listings/create' : '/login?mode=signup'} className="toro-btn-gold">Post a service</Link>
            <Link href="/listings" className="inline-flex items-center justify-center rounded-xl border border-toro-light/30 px-6 py-3.5 text-sm font-semibold text-toro-light hover:bg-toro-light/10 transition">
              Browse services
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}