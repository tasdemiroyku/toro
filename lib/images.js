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
