'use client'

import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ToretBull from '@/components/ToretBull'
import ToroLoader from '@/components/ToroLoader'

const isSafeInternalPath = (value) => typeof value === 'string' && value.startsWith('/')

// "Remember me" e-mail lives in localStorage. Reading it through
// useSyncExternalStore keeps server and client renders consistent
// (the server snapshot is always empty) without a setState-in-effect.
const SAVED_EMAIL_KEY = 'toro_saved_email'
const subscribeToNothing = () => () => {}
const readSavedEmail = () => localStorage.getItem(SAVED_EMAIL_KEY) ?? ''
const readSavedEmailOnServer = () => ''

export default function LoginClient({ redirectTarget = '/' }) {
  const router = useRouter()
  const safeRedirectTarget = isSafeInternalPath(redirectTarget) ? redirectTarget : '/'
  const [mode, setMode] = useState('login')
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

  const emailRef = useRef(null)
  const nameRef = useRef(null)

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setMessage(null)
  }

  // Focus the first relevant field whenever the form mode changes
  useEffect(() => {
    if ((mode === 'login' || mode === 'forgot') && emailRef.current) {
      emailRef.current.focus()
    } else if (mode === 'signup' && nameRef.current) {
      nameRef.current.focus()
    }
  }, [mode])

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
        setMessage({ text: 'Check your email to confirm your account.', type: 'success' })
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

  return (
    <div className="relative h-[calc(100dvh-72px)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <img src="/torino.jpeg" alt="Torino" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-toro-dark/60 backdrop-blur-sm" />

      <div className="relative z-10 bg-toro-light rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-[380px] max-h-full shadow-2xl border border-toro-dark/5 flex flex-col overflow-hidden">
        {loading && <ToroLoader text={mode === 'forgot' ? 'Sending' : 'Processing'} />}

        <div className="p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 overflow-y-auto">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-toro-dark rounded-2xl flex items-center justify-center p-2 shadow-lg">
              <ToretBull className="w-full h-full text-toro-light" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-toro-dark">
              {mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Join Toro.' : 'Reset Password.'}
            </h1>
            {mode === 'forgot' && (
              <p className="text-sm text-toro-dark/50 text-center font-medium">
                Enter your email to receive a reset link.
              </p>
            )}
          </div>

          {mode !== 'forgot' && (
            <div className="flex flex-col gap-5 shrink-0">
              <div className="flex flex-col gap-3">
                <button onClick={() => handleOAuth('google')} type="button" className="toro-btn-outline w-full">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Continue with Google
                </button>
                <button onClick={() => handleOAuth('linkedin_oidc')} type="button" className="toro-btn-outline w-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  Continue with LinkedIn
                </button>
              </div>

              <div className="flex items-center gap-4 px-2 my-0">
                <div className="flex-1 h-px bg-toro-dark/10"></div>
                <span className="text-[13px] font-medium text-toro-dark/40 lowercase">or</span>
                <div className="flex-1 h-px bg-toro-dark/10"></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 shrink-0">
            <div className="flex flex-col gap-3">
              {mode === 'signup' && (
                <input
                  ref={nameRef}
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="toro-input"
                />
              )}
              <input
                ref={emailRef}
                type="email"
                name="email"
                id="email"
                autoComplete={mode === 'login' ? 'username' : 'email'}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="toro-input"
              />
              {mode !== 'forgot' && (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="toro-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-toro-dark/40 hover:text-toro-dark transition"
                  >
                    {!showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-toro-dark/20 text-toro-gold focus:ring-toro-gold accent-toro-gold cursor-pointer"
                  />
                  <span className="text-xs text-toro-dark/50 group-hover:text-toro-dark transition">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-toro-gold font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {message && (
                <div className="flex items-center justify-center gap-2 px-2 text-center animate-in fade-in slide-in-from-top-1">
                  {message.type === 'error' ? (
                    <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                  <p className={`text-xs font-semibold leading-relaxed ${message.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                    {message.text}
                  </p>
                </div>
              )}

              {mode === 'forgot' && cooldown > 0 && (
                <div className="flex justify-center px-2 -mb-1">
                  <p className="text-xs font-medium text-toro-dark/50">
                    You can resend in <span className="font-bold font-mono text-toro-dark/70 bg-toro-dark/5 px-1.5 py-0.5 rounded ml-0.5">{formatTime(cooldown)}</span>
                  </p>
                </div>
              )}

              <button type="submit" disabled={loading || (mode === 'forgot' && cooldown > 0)} className="w-full toro-btn-primary">
                {mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          <p className="text-xs text-center text-toro-dark/40 font-medium shrink-0">
            {mode === 'forgot' ? (
              <button onClick={() => switchMode('login')} className="text-toro-gold font-bold hover:underline">Back to Login</button>
            ) : mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-toro-gold font-bold hover:underline">Sign up</button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-toro-gold font-bold hover:underline">Log in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
