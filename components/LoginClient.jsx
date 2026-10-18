'use client'

import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import AuthShell from '@/components/AuthShell'
import PasswordStrength from '@/components/PasswordStrength'
import { safeRedirectPath } from '@/lib/redirect'
import { isStrongPassword } from '@/lib/password'

// "Remember me" e-mail lives in localStorage. Reading it through
// useSyncExternalStore keeps server and client renders consistent
// (the server snapshot is always empty) without a setState-in-effect.
const SAVED_EMAIL_KEY = 'toro_saved_email'
const subscribeToNothing = () => () => {}
const readSavedEmail = () => localStorage.getItem(SAVED_EMAIL_KEY) ?? ''
const readSavedEmailOnServer = () => ''

const COPY = {
  login:  { title: 'Welcome back',        subtitle: 'Log in to message providers and manage your listings.', submit: 'Log in',         busy: 'Logging in…' },
  signup: { title: 'Create your account', subtitle: 'Join with any e-mail. Students can add a Verified badge later.', submit: 'Create account', busy: 'Creating account…' },
  forgot: { title: 'Reset your password', subtitle: 'Enter your e-mail and we will send you a reset link.', submit: 'Send reset link', busy: 'Sending…' },
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

const MODES = ['login', 'signup', 'forgot']

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// Shown after sign-up instead of a small banner
function CheckInbox({ email, onBack, onChangeEmail }) {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <span className="w-16 h-16 rounded-2xl bg-toro-gold/15 text-toro-dark flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-toro-dark">Check your inbox</h1>
        <p className="text-sm text-toro-dark/65 leading-relaxed">
          We sent a confirmation link to <span className="font-semibold text-toro-dark">{email}</span>.
          Open it to activate your account, then log in.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <button type="button" onClick={onBack} className="toro-btn-primary w-full">Back to log in</button>
        <button type="button" onClick={onChangeEmail} className="text-sm font-semibold text-toro-dark/65 hover:text-toro-dark transition">
          Use a different e-mail
        </button>
      </div>
      <p className="text-xs text-toro-dark/65">No e-mail after a few minutes? Check your spam folder.</p>
    </div>
  )
}

function FieldLabel({ htmlFor, children, aside }) {
  return (
    <div className="flex items-center justify-between px-1">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-toro-dark/70">{children}</label>
      {aside}
    </div>
  )
}

export default function LoginClient({ redirectTarget = '/', initialMode = 'login' }) {
  const router = useRouter()
  const safeRedirectTarget = safeRedirectPath(redirectTarget)
  const [mode, setMode] = useState(MODES.includes(initialMode) ? initialMode : 'login')
  const savedEmail = useSyncExternalStore(subscribeToNothing, readSavedEmail, readSavedEmailOnServer)
  const [typedEmail, setEmail] = useState(null)
  const email = typedEmail ?? savedEmail
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberChoice, setRememberMe] = useState(null)
  const rememberMe = rememberChoice ?? !!savedEmail
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [sentTo, setSentTo] = useState(null) // e-mail a sign-up confirmation went to

  const emailRef = useRef(null)
  const nameRef = useRef(null)

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setMessage(null)
    setSentTo(null)
  }

  // Focus the first relevant field (on load, and after each mode transition)
  const focusFirstField = () => {
    if (mode === 'signup') nameRef.current?.focus()
    else emailRef.current?.focus()
  }

  useEffect(() => {
    focusFirstField()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleOAuth = async (provider) => {
    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', safeRedirectTarget)

    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() }
    })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email) return
    if (mode !== 'forgot' && !password) return
    if (mode === 'forgot' && cooldown > 0) return
    if (mode === 'signup' && !isStrongPassword(password)) {
      setMessage({ text: 'Your password does not meet all the requirements below the field yet.', type: 'error' })
      return
    }

    setLoading(true)
    setMessage(null)
    const supabase = createClient()

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
        setSentTo(email)
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setMessage({ text: 'Reset link sent to your email.', type: 'success' })
        setCooldown(60)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (rememberMe) localStorage.setItem(SAVED_EMAIL_KEY, email)
        else localStorage.removeItem(SAVED_EMAIL_KEY)
        router.replace(safeRedirectTarget)
        router.refresh()
      }
    } catch (error) {
      let errorText = error.message
      if (errorText === 'Invalid login credentials') {
        errorText = 'Incorrect email or password.'
      } else if (errorText.includes('rate_limit') || errorText.includes('over_email_send_rate_limit')) {
        errorText = 'Too many requests. Please try again later.'
      }
      setMessage({ text: errorText, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const copy = COPY[mode]

  return (
    <AuthShell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sentTo ? 'inbox' : mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onAnimationComplete={definition => definition?.opacity === 1 && !sentTo && focusFirstField()}
        >
          {sentTo ? (
            <CheckInbox
              email={sentTo}
              onBack={() => switchMode('login')}
              onChangeEmail={() => { setSentTo(null); setEmail(''); setPassword('') }}
            />
          ) : (
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-toro-dark">
                  {copy.title}
                </h1>
                <p className="text-sm text-toro-dark/65">{copy.subtitle}</p>
              </div>

              {mode !== 'forgot' && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleOAuth('google')} type="button" className="toro-btn-outline w-full !px-3" aria-label="Continue with Google">
                      <GoogleIcon />
                      Google
                    </button>
                    <button onClick={() => handleOAuth('linkedin_oidc')} type="button" className="toro-btn-outline w-full !px-3" aria-label="Continue with LinkedIn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      LinkedIn
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-toro-dark/10" />
                    <span className="text-xs font-medium text-toro-dark/65">or continue with e-mail</span>
                    <div className="flex-1 h-px bg-toro-dark/10" />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate={false}>
                {mode === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="name">Full name</FieldLabel>
                    <input
                      ref={nameRef}
                      id="name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="Name and surname"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      className="toro-input"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <input
                    ref={emailRef}
                    type="email"
                    name="email"
                    id="email"
                    autoComplete={mode === 'login' ? 'username' : 'email'}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="toro-input"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel
                      htmlFor="password"
                      aside={mode === 'login' && (
                        <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-toro-gold font-semibold hover:underline">
                          Forgot password?
                        </button>
                      )}
                    >
                      Password
                    </FieldLabel>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="password"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        placeholder={mode === 'signup' ? 'Create a strong password' : '••••••••'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="toro-input pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-toro-dark/65 hover:text-toro-dark transition"
                      >
                        {!showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {mode === 'signup' && <div className="px-1 pt-1"><PasswordStrength password={password} /></div>}
                  </div>
                )}

                {mode === 'login' && (
                  <label className="flex items-center gap-2 px-1 cursor-pointer group w-fit">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-toro-dark/20 accent-toro-gold cursor-pointer"
                    />
                    <span className="text-xs text-toro-dark/65 group-hover:text-toro-dark transition">Remember my e-mail</span>
                  </label>
                )}

                {message && (
                  <div
                    role={message.type === 'error' ? 'alert' : 'status'}
                    className={`rounded-2xl px-4 py-3 text-xs font-semibold leading-relaxed border ${
                      message.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {mode === 'forgot' && cooldown > 0 && (
                  <p className="text-xs font-medium text-toro-dark/65 text-center">
                    You can resend in <span className="font-bold font-mono text-toro-dark/70 bg-toro-dark/5 px-1.5 py-0.5 rounded">{formatTime(cooldown)}</span>
                  </p>
                )}

                <button type="submit" disabled={loading || (mode === 'forgot' && cooldown > 0)} className="w-full toro-btn-primary inline-flex items-center justify-center gap-2">
                  {loading && <Spinner />}
                  {loading ? copy.busy : copy.submit}
                </button>

                {mode === 'signup' && (
                  <p className="text-xs text-center text-toro-dark/65 leading-relaxed">
                    By creating an account you agree to our{' '}
                    <Link href="/terms" className="text-toro-dark/70 underline hover:text-toro-dark">Terms of Use</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-toro-dark/70 underline hover:text-toro-dark">Privacy Policy</Link>.
                  </p>
                )}
              </form>

              <p className="text-sm text-center text-toro-dark/65 pt-2 border-t border-toro-dark/10">
                <span className="inline-block pt-5">
                  {mode === 'login' && (
                    <>New to Toro?{' '}<button type="button" onClick={() => switchMode('signup')} className="text-toro-dark font-semibold hover:text-toro-gold transition">Create an account</button></>
                  )}
                  {mode === 'signup' && (
                    <>Already have an account?{' '}<button type="button" onClick={() => switchMode('login')} className="text-toro-dark font-semibold hover:text-toro-gold transition">Log in</button></>
                  )}
                  {mode === 'forgot' && (
                    <button type="button" onClick={() => switchMode('login')} className="text-toro-dark font-semibold hover:text-toro-gold transition">← Back to log in</button>
                  )}
                </span>
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  )
}
