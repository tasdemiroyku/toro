'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIES, PRICE_TYPES } from '@/lib/categories'

export default function CreateListingClient({ userId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title:      '',
    description:'',
    category:   '',
    price:      '',
    price_type: 'hour',
    location:   '',
    languages:  '',
  })

  const update = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category || !form.price) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error: insertError } = await supabase.from('listings').insert({
      user_id:    userId,
      title:      form.title.trim(),
      description:form.description.trim(),
      category:   form.category,
      price:      parseFloat(form.price),
      price_type: form.price_type,
      location:   form.location.trim(),
      languages:  form.languages
        ? form.languages.split(',').map(l => l.trim()).filter(Boolean)
        : [],
    })

    if (insertError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    router.push('/listings')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-toro-light font-sans">
      <div className="max-w-2xl mx-auto px-8 py-16 flex flex-col gap-8">

        <div>
          <h1 className="text-3xl font-bold text-toro-dark">Post a service</h1>
          <p className="text-sm text-toro-dark/65 mt-1 font-medium">
            Tell people what you offer and how to reach you.
          </p>
        </div>

        <div className="flex flex-col gap-5">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Math tutoring for university students"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              maxLength={100}
              className="toro-input !rounded-2xl"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => update('category', cat.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                    form.category === cat.value
                      ? 'bg-toro-dark text-toro-light border-toro-dark'
                      : 'bg-white text-toro-dark border-toro-dark/15 hover:border-toro-gold'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
              Description ({form.description.length}/1000){' '}
              <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe your service, your experience, and what people can expect..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              maxLength={1000}
              className="toro-input !rounded-2xl resize-none"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
              Price <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-toro-dark/65 font-medium">
                  €
                </span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  placeholder="0"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                  className="toro-input !rounded-2xl !pl-8"
                />
              </div>
              <div className="relative w-[150px] shrink-0">
                <select
                  value={form.price_type}
                  onChange={e => update('price_type', e.target.value)}
                  className="toro-input !rounded-2xl appearance-none cursor-pointer !pr-10"
                >
                  {PRICE_TYPES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-toro-dark/65">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Torino, Crocetta"
              value={form.location}
              onChange={e => update('location', e.target.value)}
              className="toro-input !rounded-2xl"
            />
          </div>

          {/* Languages */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-toro-dark/65 uppercase tracking-wide">
              Languages
            </label>
            <input
              type="text"
              placeholder="e.g. Italian, English, Turkish"
              value={form.languages}
              onChange={e => update('languages', e.target.value)}
              className="toro-input !rounded-2xl"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-500">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/listings')}
            className="flex-1 toro-btn-outline !py-3"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 toro-btn-primary !py-3"
          >
            {loading ? 'Publishing...' : 'Publish listing'}
          </button>
        </div>
      </div>
    </div>
  )
}