'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ListingCard from '@/components/ListingCard'
import { sendMessage } from '@/app/actions/messages'
import ToretBull from '@/components/ToretBull'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

function memberSince(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-semibold">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
      Verified Student
    </span>
  )
}

// ── Contact modal ─────────────────────────────────────────────────────────────
function ContactModal({ profile, listings, onClose }) {
  const router = useRouter()
  const [message, setMessage]       = useState('')
  const [sending, setSending]       = useState(false)
  const [sent, setSent]             = useState(false)
  const [error, setError]           = useState(null)
  const [selectedId, setSelectedId] = useState(listings[0]?.id ?? null)

  const handleSend = async () => {
    if (!message.trim() || !selectedId || sending) return
    setSending(true)
    setError(null)

    try {
      await sendMessage({
        listingId:  selectedId,
        receiverId: profile.id,
        content:    message,
      })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-toro-dark/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-toro-light rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-toro-dark/5 flex flex-col gap-5"
      >
        {sent ? (
          <>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-toro-dark">Message sent!</h2>
              <p className="text-sm text-toro-dark/65">
                {profile.full_name?.split(' ')[0] || 'They'} will reply in your inbox.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 toro-btn-outline">Close</button>
              <button onClick={() => router.push('/inbox')} className="flex-1 toro-btn-primary">Go to inbox</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-toro-dark">
                Contact {profile.full_name?.split(' ')[0] || 'this member'}
              </h2>
              <p className="text-xs text-toro-dark/65">Choose which service your message is about.</p>
            </div>

            {listings.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">Regarding</label>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="toro-input appearance-none cursor-pointer"
                >
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            )}

            {listings.length === 1 && (
              <div className="text-sm font-semibold text-toro-dark bg-toro-dark/5 rounded-2xl px-4 py-2.5 truncate">
                {listings[0].title}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">Message</label>
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Introduce yourself and describe what you need..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="toro-input !rounded-2xl resize-none"
              />
              <p className="text-xs text-toro-dark/25 text-right">{message.length}/500</p>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-semibold">{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 toro-btn-outline">Cancel</button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="flex-1 toro-btn-primary disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileClient({ profile, listings, isOwnProfile, currentUserId }) {
  const router = useRouter()
  const [showContact, setShowContact] = useState(false)

  const initials =
    profile.full_name?.[0]?.toUpperCase() ||
    profile.username?.[0]?.toUpperCase() ||
    '?'

  const canContact = !isOwnProfile && !!currentUserId && listings.length > 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* ── Profile header ── */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col sm:flex-row items-start gap-6 mb-12">

        <motion.div variants={fadeUp} className="shrink-0">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-toro-dark shadow-lg">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-toro-light text-3xl font-bold">{initials}</span>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-toro-dark">{profile.full_name || 'Toro Member'}</h1>
            {profile.is_verified && <VerifiedBadge />}
          </div>

          {profile.username && (
            <p className="text-sm font-mono text-toro-dark/65">@{profile.username}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-1">
            {profile.university && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-toro-dark/60 bg-toro-dark/5 px-3 py-1 rounded-full">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                {profile.university}
              </span>
            )}
            {profile.department && (
              <span className="text-xs font-semibold text-toro-dark/65 bg-toro-dark/5 px-3 py-1 rounded-full">{profile.department}</span>
            )}
            {profile.created_at && (
              <span className="text-xs text-toro-dark/30 px-1 py-1 self-center">Member since {memberSince(profile.created_at)}</span>
            )}
          </div>

          <div className="flex gap-3 mt-2 flex-wrap">
            {isOwnProfile ? (
              <button onClick={() => router.push('/profile/edit')} className="toro-btn-outline !py-2 !px-5 !text-xs">
                Edit profile
              </button>
            ) : (
              canContact && (
                <button onClick={() => setShowContact(true)} className="toro-btn-primary !py-2 !px-5 !text-xs">
                  Send message
                </button>
              )
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — About */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:col-span-1 flex flex-col gap-5">
          {profile.bio && (
            <motion.div variants={fadeUp} className="bg-white border border-toro-dark/10 rounded-2xl p-5">
              <p className="text-xs font-semibold text-toro-dark/65 uppercase tracking-widest mb-3">About</p>
              <p className="text-sm text-toro-dark/70 leading-relaxed">{profile.bio}</p>
            </motion.div>
          )}

          {profile.languages?.length > 0 && (
            <motion.div variants={fadeUp} className="bg-white border border-toro-dark/10 rounded-2xl p-5">
              <p className="text-xs font-semibold text-toro-dark/65 uppercase tracking-widest mb-3">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map(lang => (
                  <span key={lang} className="text-xs font-semibold bg-toro-dark text-toro-light px-3 py-1 rounded-full">{lang}</span>
                ))}
              </div>
            </motion.div>
          )}

          {profile.skills && (
            <motion.div variants={fadeUp} className="bg-white border border-toro-dark/10 rounded-2xl p-5">
              <p className="text-xs font-semibold text-toro-dark/65 uppercase tracking-widest mb-3">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                  <span key={skill} className="text-xs font-semibold text-toro-gold bg-toro-gold/10 px-3 py-1 rounded-full">{skill}</span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Right — Listings */}
        <div className="lg:col-span-2">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-5">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-toro-dark">
                {isOwnProfile ? 'Your active services' : 'Active services'}
              </h2>
              <span className="text-xs text-toro-dark/30 font-medium">
                {listings.length} listing{listings.length !== 1 ? 's' : ''}
              </span>
            </motion.div>

            {listings.length === 0 ? (
              <motion.div variants={fadeUp} className="toro-empty-state">
                <div className="w-16 h-16 text-toro-dark/15">
                  <ToretBull className="w-full h-full" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-toro-dark text-lg font-bold">
                    {isOwnProfile ? 'No services yet' : 'No services offered'}
                  </p>
                  <p className="text-toro-dark/65 text-sm max-w-xs mx-auto font-medium text-center">
                    {isOwnProfile
                      ? 'Post your first service to start helping the community and earning.'
                      : "This member hasn't posted any active services yet."}
                  </p>
                </div>
                {isOwnProfile && (
                  <button onClick={() => router.push('/listings/create')} className="toro-btn-primary !py-2.5 !px-6 mt-2">
                    Post your service
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map(listing => (
                  <motion.div key={listing.id} variants={fadeUp}>
                    <ListingCard listing={listing} showProvider={false} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Contact modal */}
      <AnimatePresence>
        {showContact && (
          <ContactModal
            profile={profile}
            listings={listings}
            onClose={() => setShowContact(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}