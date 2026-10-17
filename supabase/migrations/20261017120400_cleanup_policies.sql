-- Remove duplicate / legacy policies and tighten storage listing.

begin;

-- profiles: two identical "select using (true)" policies; keep one
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;

-- storage: legacy policies for an old {uid}/… layout. The app uploads to
-- avatars/{uid}/… and listings/{uid}/…, covered by the remaining policies.
drop policy if exists storage_select_public on storage.objects;
drop policy if exists storage_insert_own    on storage.objects;
drop policy if exists storage_update_own    on storage.objects;
drop policy if exists storage_delete_own    on storage.objects;

-- storage: the bucket is public, so images are served by public URL without any
-- SELECT policy. A bucket-wide SELECT policy only adds the ability to LIST every
-- file (and therefore every user id). Owners still need SELECT for upserts.
drop policy if exists "Anyone can view uploads" on storage.objects;
create policy "Users can view their own files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'toro-uploads'
    and (select auth.uid())::text = (storage.foldername(name))[2]
  );

commit;
