'use client'

import { useState } from 'react'
import { sendContactMessage } from '@/app/actions/contact'

const MAX_MESSAGE = 2000

export default function ContactClient({ defaultName = '', defaultEmail = '' }) {
  const [form, setForm] = useState({ name: defaultName, email: defaultEmail, message: '', website: '' })
  // Set on first interaction; the server rejects forms submitted implausibly fast
  const [startedAt, setStartedAt] = useState(null)
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [error, setError] = useState(null)

  const update = (field) => (e) => {
    if (!startedAt) setStartedAt(Date.now())
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    const { error } = await sendContactMessage({ ...form, startedAt })
    if (error) {
      setError(error)
      setStatus('idle')
      return
    }
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="rounded-[2rem] border border-toro-dark/10 bg-white p-8 flex flex-col gap-2 text-center">
        <p className="text-lg font-bold text-toro-dark">Thanks, your message is on its way.</p>
        <p className="text-sm text-toro-dark/65">We usually reply within a couple of days, at the address you gave us.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-toro-dark/10 bg-white p-6 sm:p-8 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-toro-dark/65 tracking-wide">Your name</span>
          <input value={form.name} onChange={update('name')} required maxLength={100} autoComplete="name" className="toro-input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-toro-dark/65 tracking-wide">Your e-mail</span>
          <input type="email" value={form.email} onChange={update('email')} required maxLength={254} autoComplete="email" className="toro-input" />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-toro-dark/65 tracking-wide">Message</span>
        <textarea
          value={form.message}
          onChange={update('message')}
          required
          minLength={10}
          maxLength={MAX_MESSAGE}
          rows={6}
          placeholder="A question, feedback, a problem with a listing or a privacy request…"
          className="toro-input !rounded-2xl resize-y"
        />
        <span className="text-[10px] text-toro-dark/30 text-right">{form.message.length}/{MAX_MESSAGE}</span>
      </label>

      {/* Honeypot: hidden from people, often filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
        </label>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl px-4 py-3 text-xs font-semibold border bg-red-50 border-red-200 text-red-600">
          {error}
        </div>
      )}

      <button type="submit" disabled={status === 'sending'} className="toro-btn-primary self-start min-w-[160px]">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
