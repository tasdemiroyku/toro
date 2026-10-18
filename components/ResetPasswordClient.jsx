'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import AuthShell from '@/components/AuthShell'
import PasswordStrength from '@/components/PasswordStrength'
import { isStrongPassword } from '@/lib/password'

export default function ResetPasswordClient() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleReset = async (e) => {
    e.preventDefault()

    if (!isStrongPassword(password)) {
      setMessage({ text: 'Your password does not meet all the requirements yet.', type: 'error' })
      return
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' })
      return
    }

    setLoading(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
      setLoading(false)
      return
    }

    setMessage({ text: 'Password updated. Redirecting…', type: 'success' })
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 1500)
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-toro-dark">
            Choose a new password
          </h1>
          <p className="text-sm text-toro-dark/50">Pick something you have not used on other sites.</p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="px-1 text-xs font-semibold text-toro-dark/70">New password</label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="toro-input pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-toro-dark/40 hover:text-toro-dark transition"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="px-1 pt-1"><PasswordStrength password={password} /></div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className="px-1 text-xs font-semibold text-toro-dark/70">Confirm password</label>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat the new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="toro-input"
            />
          </div>

          {message && (
            <div
              role={message.type === 'error' ? 'alert' : 'status'}
              className={`rounded-2xl px-4 py-3 text-xs font-semibold border ${
                message.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full toro-btn-primary">
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
