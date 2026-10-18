'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { reportContent } from '@/app/actions/reports'
import { REPORT_REASONS, REPORT_DETAILS_MAX } from '@/lib/reports'

function FlagIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 22V4" /><path d="M4 4h12l-2 4 2 4H4" />
    </svg>
  )
}

/**
 * "Report this listing / user" link + dialog. Logged-out visitors are sent to
 * log in first.
 */
export default function ReportButton({ targetType, targetId, isLoggedIn, className = '' }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done
  const [error, setError] = useState(null)
  const firstRadioRef = useRef(null)

  const noun = targetType === 'listing' ? 'listing' : 'user'

  // Close on Escape; focus the first option when the dialog opens
  useEffect(() => {
    if (!open) return
    firstRadioRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) return setError('Please choose a reason.')
    setStatus('sending')
    setError(null)
    const result = await reportContent({ targetType, targetId, reason, details })
    if (result.error) {
      setError(result.error)
      setStatus('idle')
      return
    }
    setStatus('done')
  }

  const trigger = 'inline-flex items-center gap-1.5 text-xs font-medium text-toro-dark/65 hover:text-red-600 transition'

  if (!isLoggedIn) {
    return (
      <Link href={`/login?redirectTo=${encodeURIComponent(pathname)}`} className={`${trigger} ${className}`}>
        <FlagIcon /> Report this {noun}
      </Link>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${trigger} ${className}`}>
        <FlagIcon /> Report this {noun}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-toro-dark/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              {status === 'done' ? (
                <div className="flex flex-col gap-4 text-center">
                  <h2 id="report-title" className="text-xl font-bold text-toro-dark">Thanks for letting us know</h2>
                  <p className="text-sm text-toro-dark/65">
                    Our team will review this {noun}. Reports are confidential: the other person is not told who sent it.
                  </p>
                  <button type="button" onClick={() => setOpen(false)} className="toro-btn-primary">Close</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <h2 id="report-title" className="text-xl font-bold text-toro-dark">Report this {noun}</h2>
                    <p className="text-sm text-toro-dark/65">What is wrong? Reports are confidential.</p>
                  </div>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="sr-only">Reason</legend>
                    {REPORT_REASONS.map((r, i) => (
                      <label
                        key={r.value}
                        className={`flex items-center gap-3 rounded-full border px-4 py-3 text-sm cursor-pointer transition ${
                          reason === r.value ? 'border-toro-gold bg-toro-gold/5 text-toro-dark' : 'border-toro-dark/10 text-toro-dark/80 hover:border-toro-dark/25'
                        }`}
                      >
                        <input
                          ref={i === 0 ? firstRadioRef : undefined}
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                          className="accent-toro-gold"
                        />
                        {r.label}
                      </label>
                    ))}
                  </fieldset>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-toro-dark/70">Details (optional)</span>
                    <textarea
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      maxLength={REPORT_DETAILS_MAX}
                      rows={3}
                      placeholder="Anything that helps us understand the problem"
                      className="toro-input resize-y"
                    />
                  </label>

                  {error && (
                    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">{error}</p>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setOpen(false)} className="toro-btn-outline flex-1">Cancel</button>
                    <button type="submit" disabled={status === 'sending'} className="toro-btn-primary flex-1">
                      {status === 'sending' ? 'Sending…' : 'Send report'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
