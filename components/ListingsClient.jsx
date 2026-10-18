'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ToretBull from './ToretBull'
import { CATEGORIES as BASE_CATEGORIES } from '@/lib/categories'
import ListingCard from '@/components/ListingCard'

const CATEGORIES = [{ value: '', label: 'All' }, ...BASE_CATEGORIES]

export default function ListingsClient({
  user,
  initialListings = [],
  initialProfiles = [],
  searchQuery = '',
  activeCategory = '',
  currentPage = 1,
  totalPages = 1,
  totalCount,
}) {
  const router = useRouter()

  // ── Navigation helpers ────────────────────────────────────────────────────

  function buildUrl({ q, category, page }) {
    const params = new URLSearchParams()
    const qVal   = q        !== undefined ? q        : searchQuery
    const catVal = category !== undefined ? category : activeCategory
    const pgVal  = page     !== undefined ? page     : currentPage

    if (qVal)   params.set('q',        qVal)
    if (catVal) params.set('category', catVal)
    if (pgVal > 1) params.set('page',  String(pgVal))
    const qs = params.toString()
    return `/listings${qs ? `?${qs}` : ''}`
  }

  const setCategory = cat =>
    router.push(buildUrl({ category: cat, page: 1 }))

  const clearSearch = () =>
    router.push(buildUrl({ q: '', page: 1 }))

  const goToPage = pg =>
    router.push(buildUrl({ page: pg }))

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-toro-dark">
            {searchQuery ? 'Search Results' : 'Services in Torino'}
          </h1>
          <p className="text-sm text-toro-dark/40 mt-1 font-medium">
            {searchQuery
              ? `Found ${totalCount} services${initialProfiles.length > 0 ? ` and ${initialProfiles.length} students` : ''} for "${searchQuery}"`
              : `${totalCount} service${totalCount !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <button
          onClick={() => router.push(user ? '/listings/create' : '/login')}
          className="toro-btn-gold shrink-0 !py-2.5 !px-5"
        >
          Post your service
        </button>
      </div>

      {/* Active search chip */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 pl-4 pr-2 py-1.5 bg-toro-dark text-toro-light rounded-full text-sm font-medium">
            &ldquo;{searchQuery}&rdquo;
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </span>
        </div>
      )}

      {/* --- UNIFIED SEARCH: MATCHED STUDENTS SECTION --- */}
      {searchQuery && initialProfiles.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-black text-toro-gold uppercase tracking-widest">
            Matched Students
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-0 sm:px-0 scrollbar-hide">
            {initialProfiles.map((profile) => (
              <motion.div
                key={profile.id}
                whileHover={{ y: -4 }}
                onClick={() => router.push(`/u/${profile.username}`)}
                className="flex items-start gap-4 bg-white/60 backdrop-blur-sm border border-toro-dark/10 p-4 rounded-3xl min-w-[280px] max-w-[320px] shadow-sm hover:shadow-md hover:border-toro-gold hover:bg-white transition-all cursor-pointer shrink-0 group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-toro-dark/5 shrink-0 border border-toro-dark/10 flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-toro-dark/40 font-bold text-lg">
                      {profile.full_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-toro-dark truncate group-hover:text-toro-gold transition-colors">
                      {profile.full_name}
                    </span>
                    {profile.is_verified && (
                      <span title="Verified Student" className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-toro-dark/40 font-mono truncate">@{profile.username}</span>
                  
                  {profile.university && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-toro-dark/30 shrink-0">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                      <span className="text-[10px] text-toro-dark/50 truncate italic">
                        {profile.university}
                      </span>
                    </div>
                  )}
                  
                  {profile.skills && (
                    <p className="text-[10px] text-toro-gold font-bold truncate mt-1">
                      {profile.skills}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Category filter chips — server-driven via URL */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-5 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
              activeCategory === cat.value
                ? 'bg-toro-dark text-toro-light border-toro-dark shadow-md'
                : 'bg-white text-toro-dark border-toro-dark/10 hover:border-toro-gold hover:bg-toro-gold/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings grid or empty state */}
      {initialListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="toro-empty-state"
        >
          <div className="w-16 h-16 text-toro-dark/15">
            <ToretBull className="w-full h-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-toro-dark text-lg font-bold">
              {searchQuery ? `No service results for "${searchQuery}"` : 'No services here yet'}
            </p>
            <p className="text-toro-dark/40 text-sm max-w-xs mx-auto font-medium">
              {searchQuery
                ? 'Try a different keyword or browse all services.'
                : 'Be the first to offer help in this category.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {searchQuery && (
              <button onClick={clearSearch} className="toro-btn-outline !py-2.5">
                Browse all services
              </button>
            )}
            <button
              onClick={() => router.push(user ? '/listings/create' : '/login')}
              className="toro-btn-primary !py-2.5"
            >
              Post your service
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {initialListings.map(listing => (
                <motion.div
                  layout
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="toro-btn-outline !py-2 !px-4 !text-xs disabled:opacity-30"
                aria-label="Previous page"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(pg =>
                    pg === 1 ||
                    pg === totalPages ||
                    Math.abs(pg - currentPage) <= 1
                  )
                  .reduce((acc, pg, idx, arr) => {
                    if (idx > 0 && pg - arr[idx - 1] > 1) {
                      acc.push('…')
                    }
                    acc.push(pg)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === '…' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-toro-dark/30 text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => goToPage(item)}
                        className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                          item === currentPage
                            ? 'bg-toro-dark text-toro-light shadow-sm'
                            : 'text-toro-dark/60 hover:bg-toro-dark/8'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="toro-btn-outline !py-2 !px-4 !text-xs disabled:opacity-30"
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}