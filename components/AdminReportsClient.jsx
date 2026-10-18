'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { resolveReport } from '@/app/actions/moderation'
import { REPORT_REASON_LABEL } from '@/lib/reports'
import ToretBull from '@/components/ToretBull'

const STATUS_STYLE = {
  open: 'bg-amber-50 text-amber-800 border-amber-200',
  dismissed: 'bg-toro-dark/5 text-toro-dark/70 border-toro-dark/10',
  actioned: 'bg-green-50 text-green-800 border-green-200',
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
}

function TargetLink({ report, targets }) {
  if (report.target_type === 'listing') {
    const listing = targets.listings[report.target_id]
    if (!listing) return <span className="text-toro-dark/65">Deleted listing</span>
    return (
      <span className="flex flex-wrap items-center gap-2">
        <Link href={`/listings/${listing.id}`} className="font-semibold text-toro-dark hover:text-toro-gold underline-offset-2 hover:underline">
          {listing.title}
        </Link>
        {listing.is_removed && <span className="text-[10px] font-bold uppercase text-red-700">removed</span>}
      </span>
    )
  }
  const person = targets.profiles[report.target_id]
  if (!person) return <span className="text-toro-dark/65">Deleted user</span>
  return person.username ? (
    <Link href={`/u/${person.username}`} className="font-semibold text-toro-dark hover:text-toro-gold hover:underline">
      {person.full_name || `@${person.username}`}
    </Link>
  ) : (
    <span className="font-semibold text-toro-dark">{person.full_name || 'Unnamed user'}</span>
  )
}

function ReportRow({ report, targets }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const reporter = targets.profiles[report.reporter_id]

  const act = (action) => {
    if (action === 'remove_listing' && !window.confirm('Remove this listing? It will be hidden from everyone except its owner.')) return
    setError(null)
    startTransition(async () => {
      const result = await resolveReport({ reportId: report.id, action })
      if (result.error) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <li className="rounded-2xl border border-toro-dark/10 bg-white p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full border px-2.5 py-0.5 font-semibold capitalize ${STATUS_STYLE[report.status]}`}>{report.status}</span>
        <span className="rounded-full bg-toro-dark/5 px-2.5 py-0.5 font-semibold text-toro-dark/80">{report.target_type}</span>
        <span className="text-toro-dark/65">{formatDate(report.created_at)}</span>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <TargetLink report={report} targets={targets} />
        <p className="text-toro-dark/80"><span className="font-semibold">Reason:</span> {REPORT_REASON_LABEL[report.reason] || report.reason}</p>
        {report.details && <p className="text-toro-dark/70 whitespace-pre-wrap">“{report.details}”</p>}
        <p className="text-xs text-toro-dark/65">
          Reported by {reporter ? (reporter.username ? `@${reporter.username}` : reporter.full_name) : 'a deleted user'}
        </p>
      </div>

      {report.status === 'open' && (
        <div className="flex flex-wrap gap-2 pt-1">
          {report.target_type === 'listing' && (
            <button type="button" disabled={isPending} onClick={() => act('remove_listing')} className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition">
              Remove listing
            </button>
          )}
          <button type="button" disabled={isPending} onClick={() => act('resolve')} className="rounded-lg border border-toro-dark/15 px-3.5 py-2 text-xs font-semibold text-toro-dark hover:bg-toro-dark/5 disabled:opacity-50 transition">
            Mark as handled
          </button>
          <button type="button" disabled={isPending} onClick={() => act('dismiss')} className="rounded-lg border border-toro-dark/15 px-3.5 py-2 text-xs font-semibold text-toro-dark/70 hover:bg-toro-dark/5 disabled:opacity-50 transition">
            Dismiss
          </button>
        </div>
      )}
      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
    </li>
  )
}

export default function AdminReportsClient({ open, resolved, targets }) {
  return (
    <div className="toro-container py-12 flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-toro-gold">Moderation</p>
        <h1 className="text-3xl font-bold tracking-tight text-toro-dark">Reports</h1>
        <p className="text-sm text-toro-dark/65">{open.length} open · newest first</p>
      </header>

      {open.length === 0 ? (
        <div className="toro-empty-state">
          <div className="w-16 h-16 text-toro-dark/15"><ToretBull className="w-full h-full" /></div>
          <div className="flex flex-col gap-1.5">
            <p className="text-toro-dark text-lg font-bold">No open reports</p>
            <p className="text-toro-dark/65 text-sm max-w-xs mx-auto">New reports appear here and arrive in the contact inbox.</p>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {open.map(report => <ReportRow key={report.id} report={report} targets={targets} />)}
        </ul>
      )}

      {resolved.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-toro-dark">Recently resolved</h2>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resolved.map(report => <ReportRow key={report.id} report={report} targets={targets} />)}
          </ul>
        </section>
      )}
    </div>
  )
}
