import Link from 'next/link'
import ToretBull from '@/components/ToretBull'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center px-6 py-16 bg-toro-light">
      <div className="toro-empty-state">
        <div className="w-16 h-16 text-toro-dark/15">
          <ToretBull className="w-full h-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-toro-dark text-lg font-bold">This page does not exist</p>
          <p className="text-toro-dark/40 text-sm max-w-xs mx-auto">
            The link may be broken, or the listing or profile may have been removed.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/listings" className="toro-btn-primary">Browse services</Link>
          <Link href="/" className="toro-btn-outline">Go home</Link>
        </div>
      </div>
    </div>
  )
}
