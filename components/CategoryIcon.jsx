import { CATEGORY_ICON } from '@/lib/categories'

// Line icon for a listing category (same drawing as the category cover SVGs)
export default function CategoryIcon({ category, className = 'w-5 h-5', strokeWidth = 1.6 }) {
  const paths = CATEGORY_ICON[category]
  if (!paths) return null

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map(d => <path key={d} d={d} />)}
    </svg>
  )
}
