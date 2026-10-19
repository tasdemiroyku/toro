import Image from 'next/image'
import { canOptimizeImage } from '@/lib/images'

// Profile photo, or initials on a colour picked from the person's id, so the
// same person always gets the same colour everywhere on the site.
const PALETTE = [
  'bg-emerald-100 text-emerald-900',
  'bg-amber-100 text-amber-900',
  'bg-sky-100 text-sky-900',
  'bg-rose-100 text-rose-900',
  'bg-violet-100 text-violet-900',
  'bg-teal-100 text-teal-900',
  'bg-orange-100 text-orange-900',
  'bg-lime-100 text-lime-900',
]

function colorFor(seed) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

/**
 * @param profile   { id, full_name, username, avatar_url }
 * @param className size and text size, e.g. "w-10 h-10 text-sm"
 */
export default function Avatar({ profile, className = 'w-8 h-8 text-xs' }) {
  const name = profile?.full_name || profile?.username || '?'

  if (profile?.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt=""
        width={128}
        height={128}
        unoptimized={!canOptimizeImage(profile.avatar_url)}
        className={`${className} rounded-full object-cover border border-toro-dark/10 shrink-0`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={`${className} ${colorFor(profile?.id || name)} rounded-full font-bold flex items-center justify-center shrink-0 select-none`}
    >
      {name[0].toUpperCase()}
    </span>
  )
}
