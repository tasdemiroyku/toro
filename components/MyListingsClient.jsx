'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { CATEGORY_LABEL } from '@/lib/categories'
import ToretBull from '@/components/ToretBull'

export default function MyListingsClient({ listings: initial }) {
  const supabase = createClient()
  const router = useRouter()
  const [listings, setListings] = useState(initial)
  const [deletingId, setDeletingId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)

  /* ── Toggle active/paused ── */
  async function handleToggle(listing) {
    setLoadingId(listing.id)
    const { error } = await supabase
      .from('listings')
      .update({ is_active: !listing.is_active })
      .eq('id', listing.id)

    if (!error) {
      setListings(prev =>
        prev.map(l => l.id === listing.id ? { ...l, is_active: !l.is_active } : l)
      )
      router.refresh()
    }
    setLoadingId(null)
  }

  /* ── Delete ── */
  async function handleDelete(id) {
    setLoadingId(id)
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (!error) {
      setListings(prev => prev.filter(l => l.id !== id))
      router.refresh()
    }
    setDeletingId(null)
    setLoadingId(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">

      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-toro-dark">My Listings</h1>
          <p className="text-sm mt-1 text-toro-dark/65 font-medium">
            {listings.length} listing{listings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/listings/create" className="toro-btn-gold !py-2.5 !px-5 text-sm">
          + New listing
        </Link>
      </div>

      {/* Empty state */}
      {listings.length === 0 && (
        <div className="toro-empty-state mt-8">
          <div className="w-16 h-16 text-toro-dark/15">
            <ToretBull className="w-full h-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-toro-dark text-lg font-bold">No listings yet</p>
            <p className="text-toro-dark/65 text-sm max-w-xs mx-auto font-medium">
              Offer a service to the Turin community.
            </p>
          </div>
          <Link href="/listings/create" className="toro-btn-primary px-8">
            Create your first listing
          </Link>
        </div>
      )}

      {/* Listing cards */}
      <motion.div layout className="flex flex-col gap-4">
        <AnimatePresence initial={false} mode="popLayout">
          {listings.map(listing => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[2rem] border p-5 transition-opacity ${
                listing.is_active
                  ? 'border-toro-dark/10 bg-white'
                  : 'border-toro-dark/5 bg-toro-dark/5 opacity-70'
              }`}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="font-bold text-base text-toro-dark truncate hover:text-toro-gold transition"
                  >
                    {listing.title}
                  </Link>
                  <StatusBadge active={listing.is_active} />
                </div>
                <p className="text-xs text-toro-dark/65 font-medium">
                  {CATEGORY_LABEL[listing.category] ?? listing.category}
                  {listing.price != null && (
                    <> · €{listing.price}{listing.price_type ? `/${listing.price_type}` : ''}</>
                  )}
                  {listing.location && <> · {listing.location}</>}
                </p>
                <p className="text-xs text-toro-dark/30 mt-0.5">
                  Created {new Date(listing.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/listings/${listing.id}/edit`}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-toro-dark/15 text-toro-dark hover:bg-toro-dark/5 transition"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleToggle(listing)}
                  disabled={loadingId === listing.id}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-toro-dark/15 text-toro-dark hover:bg-toro-dark/5 transition disabled:opacity-50"
                >
                  {loadingId === listing.id
                    ? '…'
                    : listing.is_active ? 'Pause' : 'Resume'}
                </button>

                <button
                  onClick={() => setDeletingId(listing.id)}
                  disabled={loadingId === listing.id}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-toro-dark/40 backdrop-blur-sm"
            onClick={() => setDeletingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-toro-light rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-toro-dark/5"
            >
              <h2 className="text-lg font-bold text-toro-dark mb-2">
                Delete listing?
              </h2>
              <p className="text-sm text-toro-dark/65 leading-relaxed mb-6">
                This can&apos;t be undone. All messages linked to this listing will also be removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 toro-btn-outline !py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  disabled={loadingId === deletingId}
                  className="flex-1 bg-red-600 text-white rounded-full py-2.5 text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loadingId === deletingId ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      active
        ? 'bg-green-100 text-green-700'
        : 'bg-toro-dark/8 text-toro-dark/65'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-600' : 'bg-toro-dark/30'}`} />
      {active ? 'Active' : 'Paused'}
    </span>
  )
}