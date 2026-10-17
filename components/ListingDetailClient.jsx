'use client'

import { deleteListing, toggleListingActive } from '@/app/actions/listings'
import { useTransition } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABEL, CATEGORY_DEFAULT_IMAGE } from '@/lib/categories'
import { sendMessage } from '@/app/actions/messages'
import { createClient } from '@/utils/supabase/client'

export default function ListingDetailClient({ listing: initialListing, profile, user, isOwner }) {
  const router = useRouter()
  const [listing, setListing]         = useState(initialListing)
  const [message, setMessage]         = useState('')
  const [messageSent, setMessageSent] = useState(false)
  const [sending, setSending]         = useState(false)
  const [sendError, setSendError]     = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const cover = listing.image_url || CATEGORY_DEFAULT_IMAGE[listing.category] || null

  const handleContact = async () => {
    if (!user) { router.push('/login'); return }
    setSending(true)
    setSendError(null)

    try {
      await sendMessage({
        listingId:  listing.id,
        receiverId: listing.user_id,
        content:    message,
      })
      setMessageSent(true)
      setMessage('')
    } catch (err) {
      setSendError(err.message)
    } finally {
      setSending(false)
    }
  }

  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
  startTransition(async () => {
    try {
      await deleteListing(listing.id)
      router.push('/listings')
    } catch (error) {
      setShowDeleteModal(false)
    }
  })
}

const handleToggleActive = () => {
  startTransition(async () => {
    try {
      const data = await toggleListingActive(listing.id, listing.is_active)
      setListing(data)
    } catch (error) {
       console.error("Toggle failed:", error)
    }
  })
}

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          <button
            onClick={() => router.push('/listings')}
            className="text-sm text-toro-dark/40 hover:text-toro-dark transition flex items-center gap-1 w-fit"
          >
            ← Back to listings
          </button>

          {cover && (
            <div className="w-full h-64 rounded-2xl overflow-hidden">
              <img src={cover} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-toro-gold uppercase tracking-wide">
              {CATEGORY_LABEL[listing.category] || listing.category}
            </span>
            <h1 className="text-3xl font-bold text-toro-dark leading-tight">{listing.title}</h1>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-toro-dark/50">
            {listing.location && <span>📍 {listing.location}</span>}
            {listing.languages?.length > 0 && <span>🗣 {listing.languages.join(', ')}</span>}
            <span>
              Posted {new Date(listing.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>

          <div className="bg-white border border-toro-dark/10 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-toro-dark/50 uppercase tracking-wide mb-3">
              About this service
            </h2>
            <p className="text-sm text-toro-dark/80 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {isOwner && (
            <div className="bg-toro-dark/5 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-toro-dark/50 uppercase tracking-wide">Your listing</p>
              <div className="flex gap-3">
                <button onClick={handleToggleActive} className="flex-1 toro-btn-outline !py-2 text-sm">
                  {listing.is_active ? 'Pause listing' : 'Activate listing'}
                </button>
                <button
                  onClick={() => router.push(`/listings/${listing.id}/edit`)}
                  className="flex-1 toro-btn-outline !py-2 text-sm"
                >
                  Edit listing
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 border border-red-200 text-red-400 rounded-full py-2 text-sm font-semibold hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Sidebar */}
        <div className="flex flex-col gap-4">

          {/* Price card */}
          <div className="bg-white border border-toro-dark/10 rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <span className="text-3xl font-bold text-toro-dark">
                {listing.price === 0 || listing.price_type === 'free' ? 'Free' : `€${listing.price}`}
              </span>
              {listing.price_type && listing.price_type !== 'free' && (
                <span className="text-sm text-toro-dark/40 ml-1">/ {listing.price_type}</span>
              )}
            </div>

            {!isOwner && (
              <>
                {messageSent ? (
                  <div className="bg-toro-dark/5 rounded-xl p-4 text-sm text-toro-dark text-center">
                    Message sent. The provider will get back to you.
                  </div>
                ) : (
                  <>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder={user ? 'Introduce yourself and describe what you need...' : 'Log in to contact this provider'}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      disabled={!user}
                      className="toro-input !rounded-xl resize-none disabled:opacity-50"
                    />
                    {sendError && (
                      <p className="text-xs text-red-500 font-semibold">{sendError}</p>
                    )}
                    <button
                      onClick={() => !user ? router.push('/login') : handleContact()}
                      disabled={sending}
                      className="toro-btn-primary w-full disabled:opacity-60"
                    >
                      {!user ? 'Log in to contact' : sending ? 'Sending...' : 'Send message'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Provider card */}
          <div className="bg-white border border-toro-dark/10 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-toro-dark/50 uppercase tracking-wide">Provider</p>

            <div
              className={`flex items-center gap-3 ${profile?.username ? 'cursor-pointer group' : ''}`}
              onClick={() => profile?.username && router.push(`/u/${profile.username}`)}
              role={profile?.username ? 'link' : undefined}
              tabIndex={profile?.username ? 0 : undefined}
              onKeyDown={e => {
                if (profile?.username && (e.key === 'Enter' || e.key === ' '))
                  router.push(`/u/${profile.username}`)
              }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-toro-dark flex items-center justify-center text-toro-light font-bold shrink-0">
                  {profile?.full_name?.[0] || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold text-toro-dark truncate ${profile?.username ? 'group-hover:text-toro-gold transition-colors' : ''}`}>
                  {profile?.full_name || 'Anonymous'}
                </p>
                {profile?.username ? (
                  <p className="text-xs font-mono text-toro-dark/40">@{profile.username}</p>
                ) : profile?.location ? (
                  <p className="text-xs text-toro-dark/40">{profile.location}</p>
                ) : null}
              </div>
              {profile?.username && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-toro-dark/20 group-hover:text-toro-gold transition-colors">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              )}
            </div>

            {profile?.username && (
              <button
                onClick={() => router.push(`/u/${profile.username}`)}
                className="toro-btn-outline !py-2 !text-xs w-full"
              >
                View full profile
              </button>
            )}

            {profile?.bio && (
              <p className="text-xs text-toro-dark/60 leading-relaxed">{profile.bio}</p>
            )}
            {profile?.languages?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.languages.map(lang => (
                  <span key={lang} className="text-xs bg-toro-dark/5 text-toro-dark/60 px-2 py-1 rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-toro-light rounded-3xl p-8 max-w-sm w-full flex flex-col gap-5 shadow-xl">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold text-toro-dark">Delete this listing?</h2>
              <p className="text-sm text-toro-dark/60 leading-relaxed">
                This will permanently remove your listing.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 toro-btn-outline !py-2.5">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 bg-red-500 text-white rounded-full py-2.5 text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60"
              >
                {isPending ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}