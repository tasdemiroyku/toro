-- Restrict listings.image_url to the listing's own folder in our Storage bucket.
--
-- Owners may update image_url through the API (column grant), so without this
-- check a listing could point at any external URL, e.g. a tracking pixel that
-- logs the IP address of everyone who opens the listing page.
--
-- Allowed: null, or exactly the public URL that utils/upload.js produces:
--   https://eaaofckoqbpbquxwxavt.supabase.co/storage/v1/object/public/toro-uploads/listings/<user_id>/<id>/<file>.<ext>
-- The CHECK reads user_id and id from the same row, so the file must sit in the
-- owner's folder for this very listing. The regex is anchored at both ends, so
-- other hosts, look-alike hosts, "..", query strings and encoded characters fail.
--
-- The project URL is written out here because Postgres has no way to know it.
-- It is not a secret (NEXT_PUBLIC_SUPABASE_URL, shipped in every page bundle),
-- but it must match the value set on Vercel. If the project or its domain ever
-- changes, drop and re-add this constraint in a new migration. lib/images.js
-- (isListingImageUrl) mirrors the rule for rendering.
--
-- Before running, confirm no existing row breaks the rule (expected: 0 rows).
-- If one does, `add constraint` fails and the whole transaction rolls back.
--   select id, user_id, image_url from public.listings where image_url is not null;

begin;

alter table public.listings
  add constraint listings_image_url_own_upload check (
    image_url is null
    or image_url ~ (
      '^https://eaaofckoqbpbquxwxavt\.supabase\.co/storage/v1/object/public/toro-uploads/listings/'
      || user_id::text || '/' || id::text || '/[A-Za-z0-9_-]+\.(webp|jpe?g|png|gif)$'
    )
  );

commit;
