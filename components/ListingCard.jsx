import Link from 'next/link'
import { CATEGORY_LABEL } from '@/lib/categories'
import CategoryIcon from '@/components/CategoryIcon'
import SampleBadge from '@/components/SampleBadge'
import Avatar from '@/components/Avatar'

const PRICE_UNIT = { hour: '/ hour', session: '/ session', day: '/ day', fixed: 'fixed' }

function Price({ price, priceType }) {
  if (Number(price) === 0 || priceType === 'free') {
    return <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full uppercase tracking-wide">Free</span>
  }
  return (
    <span className="text-base font-bold text-toro-dark whitespace-nowrap">
      €{Number(price)}
      {PRICE_UNIT[priceType] && <span className="ml-1 text-xs font-medium text-toro-dark/65">{PRICE_UNIT[priceType]}</span>}
    </span>
  )
}

function Provider({ profile }) {
  const name = profile?.full_name || (profile?.username ? `@${profile.username}` : 'Toro member')
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar profile={profile} className="w-7 h-7 text-[11px]" />
      <span className="text-xs font-semibold text-toro-dark/70 truncate">{name}</span>
      {profile?.is_verified && (
        <span title="Verified Student" className="w-3.5 h-3.5 rounded-full bg-green-600 flex items-center justify-center shrink-0">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
    </div>
  )
}

/**
 * Text-first listing card used everywhere a listing is shown in a grid.
 * No cover photo: the category icon identifies the service, the provider row
 * builds trust. Uploaded photos are shown on the listing page only.
 */
export default function ListingCard({ listing, showProvider = true }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group h-full bg-white border border-toro-dark/10 rounded-[1.75rem] p-5 flex flex-col gap-4 hover:border-toro-gold/60 hover:shadow-[0_18px_40px_-20px_rgba(19,38,0,0.25)] transition-all"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-2xl bg-toro-dark text-toro-gold flex items-center justify-center shrink-0">
            <CategoryIcon category={listing.category} className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-toro-gold truncate">
            {CATEGORY_LABEL[listing.category] || listing.category}
          </span>
        </div>
        {listing.is_sample && <SampleBadge />}
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <h3 className="text-[17px] font-bold text-toro-dark leading-snug line-clamp-2 group-hover:text-toro-gold transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-toro-dark/65 leading-relaxed line-clamp-3">{listing.description}</p>
      </div>

      {listing.location && (
        <p className="flex items-center gap-1.5 text-xs text-toro-dark/65 min-w-0">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          <span className="truncate">{listing.location}</span>
        </p>
      )}

      <div className={`flex items-center gap-3 pt-4 border-t border-toro-dark/8 ${showProvider ? 'justify-between' : 'justify-end'}`}>
        {showProvider && <Provider profile={listing.profiles} />}
        <Price price={listing.price} priceType={listing.price_type} />
      </div>
    </Link>
  )
}
