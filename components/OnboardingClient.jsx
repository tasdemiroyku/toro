'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { uploadAvatar } from '@/utils/upload'
import ToretBull from '@/components/ToretBull'
import { SITE_HOST } from '@/lib/site'
import PasswordStrength from '@/components/PasswordStrength'
import { isStrongPassword } from '@/lib/password'

// ─── Constants ────────────────────────────────────────────────────────────────

const USERNAME_RE = /^[a-z0-9_]{3,30}$/

const LANGUAGE_OPTIONS = [
  'Italian', 'English', 'Turkish', 'French', 'Spanish',
  'German', 'Arabic', 'Chinese', 'Portuguese', 'Russian',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOAuthUser(user) {
  // Google / LinkedIn users don't need a password — skip that step entirely
  const provider = user?.app_metadata?.provider
  return provider && provider !== 'email'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            backgroundColor: i === current ? '#C9963E' : i < current ? '#132600' : 'rgba(19,38,0,0.15)',
          }}
          transition={{ duration: 0.25 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  )
}

function UsernameField({ value, onChange, onStatusChange }) {
  const [status, setStatus] = useState(value ? 'available' : 'idle')
  const debounceRef = useRef(null)
  const supabase = createClient()

  const check = useCallback(async (val) => {
    // 1. Empty check
    if (!val) { 
      const s = 'idle'; 
      setStatus(s); 
      onStatusChange(s); 
      return 
    }
    
    // 2. Format validation against our Regex
    // If it fails, mark as invalid and DO NOT hit the database
    if (!USERNAME_RE.test(val)) { 
      const s = 'invalid'; 
      setStatus(s); 
      onStatusChange(s); 
      return 
    }

    // 3. If format is correct, check database availability
    const s = 'checking'; 
    setStatus(s); 
    onStatusChange(s)
    
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', val)
      .maybeSingle()

    const next = data ? 'taken' : 'available'
    setStatus(next)
    onStatusChange(next)
  }, [onStatusChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    // We let the user type whatever they want, but we enforce lowercase visually.
    // We REMOVED the regex replacement so they can see what they are typing.
    const raw = e.target.value.toLowerCase()
    onChange(raw)
    setStatus('typing')
    onStatusChange('typing')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => check(raw), 550)
  }

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const statusIcon = {
    checking: (
      <svg className="animate-spin w-4 h-4 text-toro-dark/30" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
        <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    available: (
      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
    taken: (
      <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    invalid: (
       <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  }

  const hintText = {
    idle: 'Your public handle: @oyku becomes /u/oyku',
    typing: '',
    checking: 'Checking availability…',
    available: `✓ @${value} is available`,
    taken: `@${value} is already taken. Try another one.`,
    invalid: 'Letters, numbers and underscores only · 3–30 chars',
  }[status] ?? ''

  const hintColor = { 
    available: 'text-green-600', 
    taken: 'text-red-400', 
    invalid: 'text-amber-500' 
  }[status] ?? 'text-toro-dark/35'

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
        Username <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-toro-dark/65 font-medium pointer-events-none">@</span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="your_handle"
          maxLength={30}
          className={`toro-input !pl-8 !pr-10 ${status === 'invalid' || status === 'taken' ? 'border-red-300 focus:border-red-400 bg-red-50/50' : ''}`}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {statusIcon[status] && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">{statusIcon[status]}</span>
        )}
      </div>
      {hintText && <p className={`text-xs transition-colors ${hintColor}`}>{hintText}</p>}
    </div>
  )
}

function AvatarUpload({ preview, uploading, onPick }) {
  const fileRef = useRef(null)
  const initial = preview?.initials || '?'

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="relative w-24 h-24 rounded-full bg-toro-dark flex items-center justify-center overflow-hidden group focus:outline-none focus:ring-2 focus:ring-toro-gold shadow-lg"
        aria-label="Upload photo"
      >
        {preview?.url ? (
          <img src={preview.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-toro-light text-3xl font-bold">{initial}</span>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
              <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          )}
        </div>
      </button>
      <p className="text-xs text-toro-dark/65 font-medium">
        {preview?.url ? 'Click to change photo' : 'Add a profile photo (optional)'}
      </p>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPick} />
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

// Step 0: Choose your username
function StepUsername({ form, setForm }) {
  const [usernameStatus, setUsernameStatus] = useState('idle')

  return {
    canProceed: usernameStatus === 'available' && USERNAME_RE.test(form.username),
    content: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-toro-dark">Choose your username</h2>
          <p className="text-sm text-toro-dark/65 font-medium">
            This is your permanent public handle on Toro. It cannot be changed later.
          </p>
        </div>
        <UsernameField
          value={form.username}
          onChange={val => setForm(f => ({ ...f, username: val }))}
          onStatusChange={setUsernameStatus}
        />
        <div className="text-xs text-toro-dark/30 bg-toro-dark/3 rounded-2xl p-4 leading-relaxed">
          Your public profile will live at{' '}
          <span className="font-mono text-toro-dark/65">
            {SITE_HOST}/u/{form.username || 'your_handle'}
          </span>
        </div>
      </div>
    ),
  }
}

// Step 1: Tell us about yourself
function StepPersonal({ user, form, setForm, avatarPreview, setAvatarPreview, setAvatarFile, saving }) {
  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (avatarPreview?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview.url)
    }

    setAvatarFile(file)
    setAvatarPreview({ url: URL.createObjectURL(file), initials: form.fullName?.[0]?.toUpperCase() || '?' })
    e.target.value = ''
  }

  const toggleLang = (lang) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang],
    }))
  }

  return {
    canProceed: form.fullName.trim().length >= 2,
    content: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-toro-dark">About you</h2>
          <p className="text-sm text-toro-dark/65 font-medium">
            Help the Turin community get to know you.
          </p>
        </div>

        <AvatarUpload
          preview={avatarPreview}
          uploading={saving}
          onPick={handleAvatarPick}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
            Full name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            placeholder="Name and surname"
            className="toro-input"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
            Bio <span className="text-toro-dark/25 normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={3}
            maxLength={300}
            placeholder="What can you offer? What are you looking for?"
            className="toro-input resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
            Languages
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGE_OPTIONS.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLang(lang)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  form.languages.includes(lang)
                    ? 'bg-toro-dark text-toro-light border-toro-dark'
                    : 'bg-white text-toro-dark border-toro-dark/15 hover:border-toro-gold'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
  }
}

// Step 2 (email users only): Set a password
function StepPassword({ form, setForm }) {
  const [show, setShow] = useState(false)

  return {
    canProceed: isStrongPassword(form.password) && form.password === form.confirmPassword,
    content: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-toro-dark">Secure your account</h2>
          <p className="text-sm text-toro-dark/65 font-medium">
            Set a strong password for your Toro account.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Create a strong password"
              className="toro-input !pr-12"
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-toro-dark/65 hover:text-toro-dark transition"
            >
              {show ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
          </div>

          <div className="px-1"><PasswordStrength password={form.password} /></div>

          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="Confirm password"
            className={`toro-input ${
              form.confirmPassword && form.password !== form.confirmPassword
                ? 'border-red-300 focus:border-red-400'
                : ''
            }`}
          />
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p className="text-xs text-red-400 font-medium">Passwords don&apos;t match.</p>
          )}
        </div>
      </div>
    ),
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingClient({ user, profile, redirectAfter }) {
  const router = useRouter()
  const supabase = createClient()

  const oauth = isOAuthUser(user)
  const TOTAL_STEPS = oauth ? 2 : 3  // OAuth: username + personal. Email: + password

  const [step, setStep]         = useState(0)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)

  // Avatar
  const [avatarFile, setAvatarFile]       = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(() => {
    const oauthAvatar = user?.user_metadata?.avatar_url
    const initial = (profile?.full_name?.[0] || user?.user_metadata?.full_name?.[0] || '?').toUpperCase()
    return oauthAvatar ? { url: oauthAvatar, initials: initial } : { url: null, initials: initial }
  })

  useEffect(() => {
      return () => {
        if (avatarPreview?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview.url)
        }
      }
    }, [avatarPreview?.url])

  const [form, setForm] = useState({
    username:        '',
    fullName:        profile?.full_name || user?.user_metadata?.full_name || '',
    bio:             profile?.bio || '',
    languages:       profile?.languages || [],
    password:        '',
    confirmPassword: '',
  })

  // Build steps dynamically
  const usernameStep = StepUsername({ form, setForm })
  const personalStep = StepPersonal({ user, form, setForm, avatarPreview, setAvatarPreview, setAvatarFile, saving })
  const passwordStep = StepPassword({ form, setForm })

  const steps = oauth
    ? [usernameStep, personalStep]
    : [usernameStep, personalStep, passwordStep]

  const currentStep = steps[step]

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const handleFinish = async () => {
    setSaving(true)
    setError(null)

    try {
      // 1. Upload avatar if the user picked one
      let avatarUrl = avatarPreview?.url || null
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(avatarFile, user.id)
        } catch {
          // Non-fatal — proceed without avatar
        }
      }

      // 2. Set password for email users
      if (!oauth && form.password) {
        const { error: pwError } = await supabase.auth.updateUser({ password: form.password })
        if (pwError) throw pwError
      }

      // 3. Update the profiles row (upsert-safe)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id:         user.id,
          username:   form.username,
          full_name:  form.fullName.trim(),
          bio:        form.bio.trim() || null,
          languages:  form.languages,
          avatar_url: avatarUrl,
        })

      if (profileError) throw profileError

      // 4. Sync username (and name) into JWT metadata so proxy.js reads it
      //    for free on every subsequent request without a DB round-trip.
      await supabase.auth.updateUser({
        data: {
          username:  form.username,
          full_name: form.fullName.trim(),
          avatar_url: avatarUrl,
        },
      })

      // 5. Hard-navigate so the new metadata propagates through the session
      router.push(redirectAfter)
      router.refresh()

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 bg-toro-light font-sans">
      <div className="w-full max-w-[480px]">

        {/* Logo + heading */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 mb-8"
        >
          <div className="w-14 h-14 bg-toro-dark rounded-2xl flex items-center justify-center p-2.5 shadow-lg">
            <ToretBull className="w-full h-full text-toro-light" />
          </div>
          <p className="text-sm font-semibold text-toro-dark/65 tracking-widest uppercase">
            Welcome to Toro
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[2rem] border border-toro-dark/10 shadow-xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-1 bg-toro-dark/5">
            <motion.div
              className="h-full bg-toro-gold rounded-full"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>

          <div className="p-8 flex flex-col gap-8">
            {/* Step dots */}
            <div className="flex items-center justify-between">
              <StepDots total={TOTAL_STEPS} current={step} />
              <span className="text-xs font-semibold text-toro-dark/30">
                {step + 1} / {TOTAL_STEPS}
              </span>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {currentStep.content}
              </motion.div>
            </AnimatePresence>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-semibold bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="toro-btn-outline !py-3 flex-shrink-0 !px-5"
                >
                  ← Back
                </button>
              )}

              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={!currentStep.canProceed || saving}
                  className="toro-btn-primary flex-1"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Setting up…
                    </span>
                  ) : 'Enter Toro →'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!currentStep.canProceed}
                  className="toro-btn-primary flex-1"
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}