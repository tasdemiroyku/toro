'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ToretBull from '@/components/ToretBull'
import ToroLoader from '@/components/ToroLoader'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" })
      return
    }
    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: "error" })
      return
    }

    setLoading(true)
    setMessage(null)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({ password: password })

    if (error) {
      setMessage({ text: error.message, type: "error" })
      setLoading(false)
    } else {
      setMessage({ text: "Password updated! Redirecting to home...", type: "success" })
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 2000)
    }
  }

  return (
    <div className="relative h-[calc(100vh-68px)] flex items-center justify-center px-4 font-sans overflow-hidden">
      <img src="/images/torino-river.jpg" alt="Torino" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-toro-dark/60 backdrop-blur-sm" />

      <div className={`relative z-10 bg-toro-light rounded-[2rem] p-8 w-full max-w-[440px] shadow-2xl border border-toro-dark/5 ${loading ? 'overflow-hidden' : ''}`}>
        
        {loading && <ToroLoader text="Updating" />}

        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-toro-dark rounded-2xl flex items-center justify-center p-2 shadow-lg">
              <ToretBull className="w-full h-full text-toro-light" />
            </div>
            <h1 className="text-3xl font-bold text-toro-dark">
              New Password.
            </h1>
            <p className="text-sm text-toro-dark/50 text-center font-medium">
              Create a secure password for your Toro account.
            </p>
          </div>

          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="New password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-toro-dark/15 rounded-full px-5 py-3 pr-12 text-sm text-toro-dark focus:outline-none focus:border-toro-gold transition bg-white font-medium" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-toro-dark/40 hover:text-toro-dark transition">
                  {!showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
              
              <input 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                className="border border-toro-dark/15 rounded-full px-5 py-3 text-sm text-toro-dark focus:outline-none focus:border-toro-gold transition bg-white font-medium" 
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-toro-dark text-toro-light rounded-full py-3.5 text-sm font-semibold hover:bg-[#1f3d00] transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
              Update Password
            </button>

            {message && (
              <div className="flex items-center justify-center gap-2 px-2 text-center animate-in fade-in slide-in-from-top-1">
                {message.type === 'error' ? (
                   <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                   </svg>
                ) : (
                   <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                )}
                <p className={`text-xs font-semibold ${message.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {message.text}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}