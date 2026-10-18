'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ToretBull from './ToretBull'
import { CATEGORIES } from '@/lib/categories'
import ListingCard from '@/components/ListingCard'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}
const stagger = { visible: { transition: { staggerChildren: 0.15 } } }

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

// ── How many cards fit at this viewport width ─────────────────────────────────
function useVisibleCount() {
  const [count, setCount] = useState(4)
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setCount(1)
      else if (window.innerWidth < 1024) setCount(2)
      else setCount(4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return count
}

// ── Home page ─────────────────────────────────────────────────────────────────
export default function HomeClient({ user, listings }) {
  const router = useRouter()
  const [email, setEmail]         = useState('')
  const [status, setStatus]       = useState('idle')
  const [heroSearch, setHeroSearch] = useState('')

  // ── Carousel state ──
  const visibleCount = useVisibleCount()
  const [page, setPage] = useState(0)
  const [dir, setDir]   = useState(1)

  const totalPages = listings.length > 0 ? Math.ceil(listings.length / visibleCount) : 0

  // Reset to the first page when the number of visible cards changes
  const [pageSize, setPageSize] = useState(visibleCount)
  if (pageSize !== visibleCount) {
    setPageSize(visibleCount)
    setPage(0)
  }

  const goNext = () => { setDir(1);  setPage(p => (p + 1) % totalPages) }
  const goPrev = () => { setDir(-1); setPage(p => (p - 1 + totalPages) % totalPages) }
  const goTo   = (i) => { setDir(i > page ? 1 : -1); setPage(i) }

  const displayedListings = listings.length > 0
    ? Array.from({ length: visibleCount }, (_, i) =>
        listings[(page * visibleCount + i) % listings.length]
      ).filter(Boolean)
    : []

  const gridClass =
    visibleCount === 1 ? 'grid-cols-1' :
    visibleCount === 2 ? 'grid-cols-2' :
    'grid-cols-4'

  const handleSearch = () => {
    const q = heroSearch.trim()
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : '/listings')
  }

  const handleSignup = async () => {
    if (!email || !email.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setEmail('')
    } catch { setStatus('error') }
  }

  return (
    <div className="bg-toro-light font-sans">

      {/* ── Hero ── */}
      <section className="relative h-[650px] flex items-center overflow-hidden">
        <HeroBackground />
        <div className="absolute inset-0 bg-toro-dark/65 backdrop-blur-[2px]" />

        <motion.div className="relative z-10 w-full max-w-3xl mx-auto px-8 flex flex-col items-center mt-12" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-10 flex flex-col gap-4">
            <h1 className="text-4xl md:text-6xl font-bold text-toro-light tracking-tight leading-tight">
              Torino&apos;s Student Marketplace
            </h1>
            <p className="text-lg text-white/80 font-medium max-w-xl mx-auto">
              Find trusted peers for tutoring, cleaning, or bureaucratic help.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="w-full flex items-center bg-white/30 backdrop-blur-md rounded-full shadow-2xl p-2 border border-white/30 hover:bg-white/40 transition-all">
            <input
              type="text" autoFocus placeholder="What are you looking for?"
              value={heroSearch} onChange={e => setHeroSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/80 text-lg py-4 px-8 font-medium"
            />
            <button onClick={handleSearch} aria-label="Search" className="bg-toro-dark hover:bg-[#1f3d00] text-toro-gold rounded-full p-4 transition-all shadow-xl active:scale-95">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Browse by category ── */}
      <motion.section className="px-8 pt-20 max-w-[80rem] mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
        <motion.div variants={fadeUp} className="flex items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold text-toro-dark">Browse by category</h2>
            <p className="text-sm text-toro-dark/50">Everyday help, from people who study in Turin.</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <motion.div key={cat.value} variants={fadeUp}>
              <Link
                href={`/listings?category=${cat.value}`}
                className="group relative block aspect-[4/3] rounded-[1.5rem] overflow-hidden border border-toro-dark/10"
              >
                <img src={cat.defaultImage} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-toro-dark/90 to-transparent">
                  <span className="text-sm font-semibold text-toro-light">{cat.label}</span>
                </div>
              </Link>
            </motion.div>
          ))}
          <motion.div variants={fadeUp}>
            <Link
              href="/listings"
              className="group h-full aspect-[4/3] rounded-[1.5rem] border border-toro-dark/10 bg-white flex flex-col items-center justify-center gap-3 hover:border-toro-gold transition"
            >
              <ToretBull className="w-10 h-10 text-toro-dark/30 group-hover:text-toro-gold transition" />
              <span className="text-sm font-semibold text-toro-dark">All services →</span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Carousel section ── */}
      <motion.section className="px-8 py-24 max-w-[80rem] mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>

        {/* Header row — title left, "view all" right */}
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-10 gap-4 flex-wrap max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-toro-dark">Latest Services</h2>
          <button onClick={() => router.push('/listings')} className="text-toro-gold font-bold hover:underline text-sm uppercase tracking-widest ml-1">
            View All →
          </button>
        </motion.div>

        {/* Cards & Arrows Container */}
        {listings.length > 0 ? (
          <div className="relative group">
            
            {/* Left Minimalist Arrow */}
            {totalPages > 1 && (
              <button onClick={goPrev} aria-label="Previous" className="absolute -left-6 md:-left-12 top-1/2 -translate-y-1/2 z-20 p-2 text-toro-dark/20 hover:text-toro-gold transition-colors duration-200">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}

            {/* Overflow wrapper with padding trick to prevent shadow clipping */}
            <div className="overflow-hidden px-4 -mx-4 py-8 -my-8 max-w-6xl mx-auto">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={`${page}-${visibleCount}`}
                  custom={dir}
                  initial={d => ({ opacity: 0, x: d * 52 })}
                  animate={{ opacity: 1, x: 0 }}
                  exit={d => ({ opacity: 0, x: d * -52 })}
                  transition={{ duration: 0.26, ease: 'easeInOut' }}
                  className={`grid ${gridClass} gap-6`}
                >
                  {displayedListings.map((item, index) => (
                    <ListingCard key={`${item.id}-${index}`} listing={item} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Minimalist Arrow */}
            {totalPages > 1 && (
              <button onClick={goNext} aria-label="Next" className="absolute -right-6 md:-right-12 top-1/2 -translate-y-1/2 z-20 p-2 text-toro-dark/20 hover:text-toro-gold transition-colors duration-200">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            )}

            {/* Dot indicators */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i} onClick={() => goTo(i)}
                    aria-label={`Go to page ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === page ? 'w-6 bg-toro-gold' : 'w-2 bg-toro-dark/15 hover:bg-toro-dark/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="toro-empty-state max-w-6xl mx-auto">
            <div className="w-16 h-16 text-toro-dark/15"><ToretBull className="w-full h-full" /></div>
            <div className="flex flex-col gap-1.5">
              <p className="text-toro-dark text-lg font-bold">No services here yet</p>
              <p className="text-toro-dark/40 text-sm max-w-xs mx-auto font-medium">Be the first to offer help to the student community in Torino.</p>
            </div>
            <button onClick={() => router.push(user ? '/listings/create' : '/login')} className="toro-btn-primary px-8">Post a service</button>
          </motion.div>
        )}
      </motion.section>

      {/* ── Why Toro ── */}
      <motion.section className="bg-toro-dark py-24 px-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
        <div className="max-w-6xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-toro-light mb-12">Why Toro is different</motion.h2>
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

      {/* ── Email Signup ── */}
      <motion.section className="px-8 py-24 max-w-6xl mx-auto flex flex-col items-center text-center gap-6" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
        <motion.h2 variants={fadeUp} className="text-3xl font-bold text-toro-dark">Be the first in Torino</motion.h2>
        <motion.p variants={fadeUp} className="text-toro-dark/60 max-w-md">
          We are launching soon. Sign up to get early access and be notified the moment Toro goes live.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-col gap-3 w-full max-w-md">
          <div className="flex gap-3">
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} className="toro-input flex-1" />
            <button onClick={handleSignup} disabled={status === 'loading'} className="toro-btn-gold whitespace-nowrap disabled:opacity-60">
              {status === 'loading' ? 'Saving...' : 'Notify me'}
            </button>
          </div>
          {status === 'success' && <p className="text-sm text-toro-dark font-medium">You&apos;re on the list. We&apos;ll let you know when Toro goes live.</p>}
          {status === 'error'   && <p className="text-sm text-red-500">Something went wrong. Try again.</p>}
        </motion.div>
      </motion.section>
    </div>
  )
}