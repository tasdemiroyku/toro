// Which image URLs next/image may optimize: our own files in /public and public
// files in our Supabase Storage bucket (allowed in next.config.mjs). Anything
// else, such as Google or LinkedIn avatars and blob: previews of a file being
// uploaded, is shown as-is with `unoptimized`.

const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`

export function canOptimizeImage(src) {
  if (typeof src !== 'string') return false
  if (src.startsWith('/')) return !src.startsWith('//')
  return src.startsWith(STORAGE_PREFIX)
}

// A listing photo must be a file the owner uploaded into this listing's folder
// (utils/upload.js). Mirrors the listings_image_url_own_upload CHECK constraint
// in supabase/migrations/20261019120000_listings_image_url_check.sql.
const LISTING_FILE_NAME = /^[A-Za-z0-9_-]+\.(webp|jpe?g|png|gif)$/

export function isListingImageUrl(src, userId, listingId) {
  if (typeof src !== 'string' || !userId || !listingId) return false
  const folder = `${STORAGE_PREFIX}toro-uploads/listings/${userId}/${listingId}/`
  return src.startsWith(folder) && LISTING_FILE_NAME.test(src.slice(folder.length))
}
