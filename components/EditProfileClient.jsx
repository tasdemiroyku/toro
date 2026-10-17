'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { uploadAvatar } from '@/utils/upload'
import ToretBull from '@/components/ToretBull'
import { useTransition } from 'react'
import { deleteUserAccount } from '@/app/actions/account'
import { savePersonalInfo } from '@/app/actions/profile'

// ─── Constants ───────────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  'Italian', 'English', 'Turkish', 'French', 'Spanish',
  'German', 'Arabic', 'Chinese', 'Portuguese', 'Russian',
  'Japanese', 'Korean', 'Hindi', 'Dutch', 'Polish',
]

const UNIVERSITIES = [
  { group: 'Turin', options: ['Politecnico di Torino', 'Università di Torino'] },
  { group: 'Northern Italy', options: ['Università di Milano', 'Politecnico di Milano', 'Università di Bologna', 'Università di Padova', 'Università di Pavia', 'Università di Genova', 'Università di Trieste'] },
  { group: 'Central Italy', options: ['Sapienza – Università di Roma', 'Università di Roma Tre', 'Università di Firenze', 'Università di Pisa', 'Università di Perugia'] },
  { group: 'Southern Italy', options: ['Università di Napoli Federico II', 'Università di Bari', 'Università di Palermo', 'Università di Catania'] },
  { group: 'Other', options: ['Other university', 'Not a student'] },
]

const NAV_ITEMS = [
  {
    id: 'personal',
    label: 'Personal Info',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'academic',
    label: 'Academic Info',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USERNAME_RE = /^[a-z0-9_]{3,30}$/

function memberSince(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
      Verified Student
    </span>
  )
}

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-toro-dark/50 tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-toro-dark/30">{hint}</p>}
    </div>
  )
}

function Toast({ message, type = 'success' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-sm shadow-lg border ${
        type === 'error'
          ? 'bg-red-100 text-red-600 border-red-300'
          : 'bg-green-100 text-green-700 border-green-300'
      }`}
    >
      {message}
    </motion.div>
  )
}

function LanguageTagSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = lang =>
    onChange(
      selected.includes(lang)
        ? selected.filter(l => l !== lang)
        : [...selected, lang]
    )

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <div className="flex flex-wrap gap-1.5 min-h-[2.5rem]">
        <AnimatePresence>
          {selected.map(lang => (
            <motion.span
              key={lang}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-toro-dark text-toro-light"
            >
              {lang}
              <button
                onClick={() => toggle(lang)}
                className="opacity-60 hover:opacity-100 transition ml-0.5"
                aria-label={`Remove ${lang}`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <button
          onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-toro-dark/20 text-toro-dark/40 hover:border-toro-gold/60 hover:text-toro-gold transition"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-toro-dark/10 rounded-2xl p-3 shadow-xl flex flex-wrap gap-1.5 z-20"
          >
            {LANGUAGE_OPTIONS.map(lang => (
              <button
                key={lang}
                onClick={() => toggle(lang)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  selected.includes(lang)
                    ? 'bg-toro-dark text-toro-light'
                    : 'text-toro-dark/60 hover:text-toro-dark border border-toro-dark/10 hover:border-toro-dark/30'
                }`}
              >
                {lang}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section: Personal Info ──────────────────────────────────────────────────

function PersonalSection({ user, profile, setProfile }) {
  const update = (field, value) => setProfile(prev => ({ ...prev, [field]: value }))
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // State for the copy link animation
  const [copied, setCopied] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCopyLink = () => {
    // Dynamically gets the current domain (localhost or production)
    const url = `${window.location.origin}/u/${profile.username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setSaving(true)

    // Server Action: validates input and keeps the phone number in private_profiles
    const { error } = await savePersonalInfo({
      fullName:    profile.full_name,
      bio:         profile.bio,
      languages:   profile.languages,
      skills:      profile.skills,
      phoneNumber: profile.phone_number,
    })

    showToast(error ?? 'Profile saved.', error ? 'error' : 'success')
    setSaving(false)
  }

  const handleDeleteAccount = () => {
    startTransition(async () => {
      try {
        await deleteUserAccount()
      } catch (error) {
        setShowDeleteModal(false)
        setGlobalToast({ message: error.message, type: 'error' })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Full name and phone number fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Full name">
          <input
            type="text"
            value={profile?.full_name || ''}
            onChange={e => update('full_name', e.target.value)}
            placeholder="Name and surname"
            className="toro-input"
          />
        </Field>
        <Field label="Phone number">
          <input
            type="tel"
            value={profile?.phone_number || ''}
            onChange={e => update('phone_number', e.target.value)}
            placeholder="+39 XXX XXX XXXX"
            className="toro-input"
          />
        </Field>
      </div>

      {/* STATIC USERNAME LOGIC: Immutable Public Link */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-toro-dark/50 tracking-wide">Public Profile Link</label>
        <div className="flex items-center bg-toro-dark/5 border border-toro-dark/10 rounded-2xl p-1.5 pl-4">
          <span className="flex-1 text-sm font-mono text-toro-dark/70 truncate mr-2 select-all">
            toro.com/u/{profile.username}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 bg-white border border-toro-dark/10 hover:border-toro-dark/30 text-toro-dark px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Link
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-toro-dark/30">This is your permanent handle. It cannot be changed.</p>
      </div>

      <Field label="Bio" hint="Shown on your public profile and listings.">
        <textarea
          value={profile?.bio || ''}
          onChange={e => update('bio', e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Tell other students what you can offer or what you're looking for..."
          className="toro-input !rounded-2xl resize-none"
        />
        <p className="text-xs text-toro-dark/25 text-right -mt-1">
          {(profile?.bio || '').length}/300
        </p>
      </Field>

      <Field label="Languages">
        <LanguageTagSelector
          selected={profile?.languages || []}
          onChange={langs => update('languages', langs)}
        />
      </Field>

      <Field
        label="Skills & specialities"
        hint='Comma-separated — e.g. "MATLAB, Figma, French cooking"'
      >
        <input
          type="text"
          value={profile?.skills || ''}
          onChange={e => update('skills', e.target.value)}
          placeholder="Python, Academic writing, Music theory..."
          className="toro-input"
        />
      </Field>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="toro-btn-primary sm:min-w-[160px]"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-xs text-red-400 hover:text-red-600 transition px-4"
        >
          Delete account
        </button>
      </div>

      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-toro-dark/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-toro-light rounded-3xl p-8 max-w-sm w-full flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex flex-col gap-2 text-center">
                <h2 className="text-xl text-toro-dark">Delete account?</h2>
                <p className="text-sm text-toro-dark/50 leading-relaxed">
                  This is permanent. All your listings and messages will be removed.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-500 text-white rounded-full py-3 text-sm hover:bg-red-600 transition"
                >
                  Yes, delete everything
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="toro-btn-outline w-full"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section: Academic Info ──────────────────────────────────────────────────

function AcademicSection({ user, profile, setProfile }) {
  const update = (field, value) => setProfile(prev => ({ ...prev, [field]: value }))
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ university: profile.university, department: profile.department })
      .eq('id', user.id)
    showToast(
      error ? 'Something went wrong.' : 'Academic info saved.',
      error ? 'error' : 'success'
    )
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="University">
          <select
            value={profile?.university || ''}
            onChange={e => update('university', e.target.value)}
            className="toro-input appearance-none cursor-pointer"
          >
            <option value="">Select university</option>
            {UNIVERSITIES.map(({ group, options }) => (
              <optgroup key={group} label={group}>
                {options.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Department / Faculty">
          <input
            type="text"
            value={profile?.department || ''}
            onChange={e => update('department', e.target.value)}
            placeholder="e.g. Computer Engineering"
            className="toro-input"
          />
        </Field>
      </div>

      {/* Verification status banner — is_verified is computed by a DB trigger */}
      <div className={`rounded-2xl p-4 text-sm border ${
        profile?.is_verified
          ? 'bg-green-50 border-green-200'
          : 'bg-transparent border-toro-dark/10'
      }`}>
        {profile?.is_verified ? (
          <div className="flex items-center gap-2 text-green-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Your email <span className="font-medium">{user?.email}</span> is automatically verified as a student address.
          </div>
        ) : (
          <div className="flex items-start gap-2 text-toro-dark/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>
              Sign up with your university email (e.g. <em>@studenti.polito.it</em>) to receive a
              Verified Student badge and build trust with other users.
            </span>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="toro-btn-primary min-w-[160px]"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
    </div>
  )
}

// ─── Section: Security ───────────────────────────────────────────────────────

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full"
            animate={{ background: i < score ? colors[score - 1] : 'rgba(19, 38, 0, 0.08)' }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: score > 0 ? colors[score - 1] : 'rgba(19, 38, 0, 0.4)' }}>
        {score > 0 ? labels[score - 1] : ''}
      </span>
    </div>
  )
}

function SecuritySection({ user }) {
  const supabase = createClient()
  const [emailForm, setEmailForm] = useState({ email: '', confirm: '' })
  const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '' })
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleEmailUpdate = async () => {
    if (!emailForm.email) return showToast('Enter a new email.', 'error')
    if (emailForm.email !== emailForm.confirm) return showToast("Emails don't match.", 'error')
    setEmailLoading(true)
    const { error } = await supabase.auth.updateUser({ email: emailForm.email })
    showToast(
      error ? error.message : 'Confirmation sent — check both inboxes.',
      error ? 'error' : 'success'
    )
    if (!error) setEmailForm({ email: '', confirm: '' })
    setEmailLoading(false)
  }

  const handlePasswordUpdate = async () => {
    if (passwordForm.password.length < 8)
      return showToast('Password must be at least 8 characters.', 'error')
    if (passwordForm.password !== passwordForm.confirm)
      return showToast("Passwords don't match.", 'error')
    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password })
    showToast(
      error ? error.message : 'Password updated successfully.',
      error ? 'error' : 'success'
    )
    if (!error) setPasswordForm({ password: '', confirm: '' })
    setPasswordLoading(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl p-4 text-sm flex items-center gap-3 bg-toro-dark/5 border border-toro-dark/10">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-toro-dark/40 shrink-0">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span className="text-toro-dark/50">
          Current email: <span className="text-toro-dark">{user?.email}</span>
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-sm text-toro-dark mb-0.5">Update email</h3>
          <p className="text-xs text-toro-dark/40">
            You&apos;ll receive a confirmation at both your old and new address.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New email">
            <input type="email" value={emailForm.email} onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))} placeholder="new@email.com" className="toro-input" />
          </Field>
          <Field label="Confirm new email">
            <input type="email" value={emailForm.confirm} onChange={e => setEmailForm(f => ({ ...f, confirm: e.target.value }))} placeholder="new@email.com" className="toro-input" />
          </Field>
        </div>
        <button onClick={handleEmailUpdate} disabled={emailLoading} className="toro-btn-primary self-start min-w-[160px]">
          {emailLoading ? 'Sending…' : 'Update email'}
        </button>
      </div>

      <div className="border-t border-toro-dark/10" />

      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-sm text-toro-dark mb-0.5">Update password</h3>
          <p className="text-xs text-toro-dark/40">Min 8 characters. Use uppercase, lowercase, a number and a symbol.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New password">
            <input type="password" value={passwordForm.password} onChange={e => setPasswordForm(f => ({ ...f, password: e.target.value }))} placeholder="New password" className="toro-input" />
          </Field>
          <Field label="Confirm password">
            <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Confirm password" className="toro-input" />
          </Field>
        </div>
        {passwordForm.password && <PasswordStrength password={passwordForm.password} />}
        <button onClick={handlePasswordUpdate} disabled={passwordLoading} className="toro-btn-primary self-start min-w-[160px]">
          {passwordLoading ? 'Updating…' : 'Update password'}
        </button>
      </div>

      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditProfileClient({ user, initialProfile }) {
  const [profile, setProfile] = useState(initialProfile)
  const [activeTab, setActiveTab] = useState('personal')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [globalToast, setGlobalToast] = useState(null)

  const fileInputRef = useRef(null)
  const supabase = createClient()
  const verified = !!profile?.is_verified

  const initials =
    profile?.full_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?'

  const sectionMap = {
    personal: <PersonalSection user={user} profile={profile} setProfile={setProfile} />,
    academic: <AcademicSection user={user} profile={profile} setProfile={setProfile} />,
    security: <SecuritySection user={user} />,
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file, user.id)
      if (url) {
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
        setProfile(prev => ({ ...prev, avatar_url: url }))
        setGlobalToast({ message: 'Profile picture updated.', type: 'success' })
      }
    } catch {
      setGlobalToast({ message: 'Failed to upload image.', type: 'error' })
    } finally {
      setUploadingAvatar(false)
      setTimeout(() => setGlobalToast(null), 3000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 relative"
    >
      <AnimatePresence>{globalToast && <Toast {...globalToast} />}</AnimatePresence>

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center gap-5 mb-10">

        {/* Avatar upload */}
        <div className="relative shrink-0 group">
          <button
            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative w-20 h-20 rounded-full flex items-center justify-center text-toro-light text-2xl shadow-lg bg-toro-dark overflow-hidden focus:outline-none focus:ring-2 focus:ring-toro-gold transition-transform active:scale-95"
            aria-label="Upload profile picture"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                <svg className="animate-spin w-7 h-7 text-toro-dark" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow bg-toro-gold pointer-events-none z-10">
            <ToretBull className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-start gap-1.5">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <h1 className="text-2xl text-toro-dark">{profile?.full_name || 'My Profile'}</h1>
            {verified && <VerifiedBadge />}
          </div>
          {profile?.username && (
            <p className="text-sm font-mono text-toro-dark/40">@{profile.username}</p>
          )}
          <p className="text-sm text-toro-dark/40">{user?.email}</p>
          {user?.created_at && (
            <p className="text-xs text-toro-dark/30">Member since {memberSince(user.created_at)}</p>
          )}
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">

        {/* Sidebar — desktop */}
        <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0 pt-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all text-left ${
                activeTab === item.id
                  ? 'bg-toro-dark text-toro-light'
                  : 'bg-transparent text-toro-dark/50 hover:text-toro-dark'
              }`}
            >
              <span className={activeTab === item.id ? 'opacity-100' : 'opacity-60'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Tab bar — mobile */}
        <div className="flex md:hidden gap-1 overflow-x-auto pb-1 -mx-4 px-4">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs whitespace-nowrap shrink-0 transition-all ${
                activeTab === item.id
                  ? 'bg-toro-dark text-toro-light'
                  : 'bg-toro-dark/5 text-toro-dark/60 hover:text-toro-dark'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          <div
            className="rounded-3xl p-6 sm:p-8 border border-toro-dark/10"
            style={{
              background: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <h2 className="text-xs text-toro-gold uppercase tracking-[0.18em] mb-6">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {sectionMap[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}