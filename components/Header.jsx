'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import ToretBull from './ToretBull'

function useDropdown(delay = 150) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, delay)
  }

  return { open, setOpen, ref, handleMouseEnter, handleMouseLeave }
}
function UserDropdown({ user, profile, setUser, hasUnread }) {
  const router = useRouter()
  const { open, setOpen, ref, handleMouseEnter, handleMouseLeave } = useDropdown()

  const handleProfileClick = () => {
    setOpen(false)
    if (profile?.username) {
      router.push(`/u/${profile.username}`)
    } else {
      router.push('/onboarding')
    }
  }

  const handleLogout = async () => {
    setUser(null)
    setOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {open && <div className="absolute top-full right-0 w-full h-3 bg-transparent z-40" />}

      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full bg-toro-dark border-2 border-toro-light/20 hover:border-toro-gold transition flex items-center justify-center shrink-0"
        aria-label="User menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAFAF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {/* Unread dot on the avatar icon */}
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-toro-gold border-2 border-toro-dark rounded-full z-10" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 bg-toro-light rounded-2xl shadow-xl border border-toro-dark/10 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-toro-dark/8">
              <p className="text-xs font-semibold text-toro-dark truncate">
                {user?.user_metadata?.full_name || 'My Account'}
              </p>
              <p className="text-xs text-toro-dark/40 truncate mt-0.5">
                {user?.email}
              </p>
            </div>

            <div className="py-1">
              <button
                onClick={() => { setOpen(false); router.push('/inbox') }}
                className="w-full text-left px-4 py-2.5 text-sm text-toro-dark hover:bg-toro-dark/5 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Inbox
                </span>
                {/* Unread indicator text inside the dropdown */}
                {hasUnread && (
                  <span className="w-2 h-2 rounded-full bg-toro-gold animate-pulse" />
                )}
              </button>

              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2.5 text-sm text-toro-dark hover:bg-toro-dark/5 transition flex items-center gap-2.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                My Profile
              </button>

              <button
                onClick={() => { setOpen(false); router.push('/listings/my') }}
                className="w-full text-left px-4 py-2.5 text-sm text-toro-dark hover:bg-toro-dark/5 transition flex items-center gap-2.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <line x1="9" y1="12" x2="15" y2="12"/>
                  <line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
                My Listings
              </button>

              <button
                onClick={() => { setOpen(false); router.push('/listings/create') }}
                className="w-full text-left px-4 py-2.5 text-sm text-toro-dark hover:bg-toro-dark/5 transition flex items-center gap-2.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Post a Service
              </button>
            </div>

            <div className="border-t border-toro-dark/8 py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition flex items-center gap-2.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Header({ user: initialUser = null, profile: initialProfile = null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState(initialProfile)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const [hasUnread, setHasUnread] = useState(false) // 🚨 Unread State Added
  
  const isHome = pathname === '/'
  const isAuthPage = pathname === '/login'
  const { scrollY } = useScroll()

  // Home page: a large transparent header over the hero that switches to the
  // compact 72 px bar once you scroll. It is position: fixed there, so the size
  // change never moves the page (the old in-flow, scroll-linked resize bounced),
  // and it switches with hysteresis: compact after 80 px, large again under 20 px.
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    if (!isHome) return
    const onScroll = () => {
      const y = window.scrollY
      setCompact(prev => (prev ? y > 20 : y > 80))
    }
    const frame = requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [isHome])
  const large = isHome && !compact
  const headerHeight = large ? 104 : 72

  const clampedScroll = useTransform(scrollY, (value) => Math.max(0, value))

  const searchOpacity = useTransform(clampedScroll, [250, 350], [0, 1])
  const searchY = useTransform(clampedScroll, [250, 350], [10, 0])
  const searchPointerEvents = useTransform(clampedScroll, [0, 349, 350], ["none", "none", "auto"])

  const handleHeaderSearch = (e) => {
    e?.preventDefault()
    if (mobileOpen) setMobileOpen(false)
    const q = headerSearch.trim()
    if (!q) {
      router.push('/listings')
      return
    }
    router.push(`/listings?q=${encodeURIComponent(q)}`)
    setHeaderSearch('')
  }

  // Auth State Listener
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close mobile menu on route change (adjusting state during render,
  // instead of in an effect, avoids an extra render pass)
  const [menuPathname, setMenuPathname] = useState(pathname)
  if (menuPathname !== pathname) {
    setMenuPathname(pathname)
    setMobileOpen(false)
  }

  // 🚨 Real-time Inbox Listener
  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const checkUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)
      
      setHasUnread(count > 0)
    }

    checkUnread()

    const channel = supabase.channel('header_unread_check')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
         setHasUnread(true)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
         checkUnread()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  return (
    <>
      <header
        style={{ height: headerHeight }}
        className={`${isHome ? 'fixed' : 'sticky'} top-0 inset-x-0 z-50 w-full transition-[height,background-color,box-shadow] duration-300 ease-out ${
          large
            ? 'bg-linear-to-b from-toro-dark/70 to-transparent'
            : 'bg-toro-dark shadow-[0_14px_22px_-10px_rgba(0,0,0,0.5)]'
        }`}
      >
        <div className="toro-container h-full flex items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-3 shrink-0">
            <ToretBull className={`text-toro-light transition-all duration-300 ease-out ${large ? 'w-14 h-14' : 'w-9 h-9'}`} />
            <span className={`font-logo font-bold text-toro-light leading-none transition-all duration-300 ease-out ${large ? 'text-[40px]' : 'text-[28px]'}`}>
              Toro
            </span>
          </Link>

          {/* Sticky search — visible on every page, but hidden on the home hero until scroll */}
          {isHome ? (
            <motion.form
              onSubmit={handleHeaderSearch}
              style={{ opacity: searchOpacity, y: searchY, pointerEvents: searchPointerEvents }}
              className="flex-1 max-w-sm hidden md:flex items-center bg-toro-light/10 backdrop-blur-md border border-toro-light/20 rounded-full p-1 transition-all hover:bg-toro-light/20 mx-auto"
            >
              <input
                type="text"
                placeholder="What are you looking for?"
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-toro-light placeholder:text-toro-light/60 text-sm py-1.5 px-4 font-medium"
              />
              <button
                type="submit"
                aria-label="Search"
                className="bg-toro-dark hover:bg-[#1f3d00] text-toro-gold rounded-full p-2 transition-all shadow-md active:scale-95 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </motion.form>
          ) : !isAuthPage ? (
            <motion.form
              onSubmit={handleHeaderSearch}
              className="flex-1 max-w-sm hidden md:flex items-center bg-toro-light/10 backdrop-blur-md border border-toro-light/20 rounded-full p-1 transition-all hover:bg-toro-light/20 mx-auto"
            >
              <input
                type="text"
                placeholder="What are you looking for?"
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-toro-light placeholder:text-toro-light/60 text-sm py-1.5 px-4 font-medium"
              />
              <button
                type="submit"
                aria-label="Search"
                className="bg-toro-dark hover:bg-[#1f3d00] text-toro-gold rounded-full p-2 transition-all shadow-md active:scale-95 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </motion.form>
          ) : null}

          <div className="hidden md:flex items-center gap-5 shrink-0">
            <Link href="/listings" className="text-sm text-toro-light/70 hover:text-toro-light transition font-medium whitespace-nowrap">
              Find Services
            </Link>
            <button
              onClick={() => router.push(user ? '/listings/create' : '/login')}
              className="text-sm text-toro-light/70 hover:text-toro-light transition font-medium whitespace-nowrap"
            >
              Offer Skills
            </button>

            <div className="w-px h-4 bg-toro-light/15 mx-0.5" />

            {user ? (
              <UserDropdown user={user} profile={profile} setUser={setUser} hasUnread={hasUnread} />
            ) : (
              <div className="flex items-center gap-5">
                <button
                  onClick={() => router.push('/login')}
                  className="text-sm text-toro-light/70 hover:text-toro-light transition font-medium"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push('/login?mode=signup')}
                  className="bg-toro-gold text-toro-light text-sm px-5 py-2 rounded-full font-semibold hover:bg-[#b8852d] transition whitespace-nowrap shadow-sm"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            {/* Mobile User Icon Also Shows Unread Dot! */}
            {user && <UserDropdown user={user} profile={profile} setUser={setUser} hasUnread={hasUnread} />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <motion.span animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="block w-6 h-0.5 bg-toro-light origin-center"/>
              <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-0.5 bg-toro-light"/>
              <motion.span animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="block w-6 h-0.5 bg-toro-light origin-center"/>
            </button>
          </div>

        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            style={{ top: headerHeight }}
            className="fixed left-0 right-0 z-40 bg-toro-dark border-t border-toro-light/10 px-6 py-6 flex flex-col gap-4 md:hidden"
          >
            <form
              onSubmit={handleHeaderSearch}
              className="w-full flex items-center bg-toro-light/10 backdrop-blur-md border border-toro-light/20 rounded-full p-1.5 transition-all hover:bg-toro-light/20 mb-2 mt-2"
            >
              <input
                type="text"
                placeholder="What are you looking for?"
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-toro-light placeholder:text-toro-light/60 text-base py-2 px-4 font-medium"
              />
              <button
                type="submit"
                aria-label="Search"
                className="bg-toro-dark hover:bg-[#1f3d00] text-toro-gold rounded-full p-2.5 transition-all shadow-md active:scale-95 shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>

            <Link href="/listings" onClick={() => setMobileOpen(false)} className="text-base text-toro-light/70 hover:text-toro-light transition font-medium py-2">
              Find Services
            </Link>
            <button
              onClick={() => { setMobileOpen(false); router.push(user ? '/listings/create' : '/login') }}
              className="text-left text-base text-toro-light/70 hover:text-toro-light transition font-medium py-2"
            >
              Offer Skills
            </button>
            {!user && (
              <div className="pt-4 border-t border-toro-light/10 mt-2 flex flex-col gap-3">
                <button
                  onClick={() => { setMobileOpen(false); router.push('/login?mode=signup') }}
                  className="w-full bg-toro-gold text-toro-light py-3.5 rounded-full font-semibold hover:bg-[#b8852d] transition"
                >
                  Join Toro
                </button>
                <button
                  onClick={() => { setMobileOpen(false); router.push('/login') }}
                  className="w-full text-center text-sm text-toro-light/50 py-2 group"
                >
                  Already have an account? <span className="text-toro-gold group-hover:underline">Log in</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}