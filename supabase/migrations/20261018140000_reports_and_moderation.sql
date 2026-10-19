-- Reports and moderation.
--
-- * Signed-in users can report a listing or a user (one report per target).
--   Nobody can read reports through the API; admins see them on /admin/reports,
--   which reads them with the service role.
-- * Admins are marked in private_profiles.is_admin (owner-readable, never
--   client-writable). Grant it once in the SQL Editor, e.g.:
--     insert into public.private_profiles (id, is_admin)
--     select id, true from public.profiles where username = 'tasdemiroyku'
--     on conflict (id) do update set is_admin = true;
-- * Moderators can remove a listing (listings.is_removed). Removed listings are
--   hidden from everyone except the owner, and owners cannot undo it.

begin;

-- ─── Admin flag ───────────────────────────────────────────────────────────────

alter table public.private_profiles
  add column if not exists is_admin boolean not null default false;
-- Client grants on private_profiles stay limited to (id, phone_number, updated_at).

-- ─── Listing removal ─────────────────────────────────────────────────────────

alter table public.listings
  add column if not exists is_removed     boolean not null default false,
  add column if not exists removed_reason text,
  add column if not exists removed_at     timestamptz;

drop policy if exists listings_select_active_or_own on public.listings;
drop policy if exists listings_select_visible_or_own on public.listings;
create policy listings_select_visible_or_own on public.listings
  for select using ((is_active and not is_removed) or (select auth.uid()) = user_id);

-- Owners keep editing their listings, but not the moderation columns
revoke insert, update on table public.listings from anon, authenticated;
grant insert (user_id, title, description, category, price, price_type, location, languages)
  on table public.listings to authenticated;
grant update (title, description, category, price, price_type, location, languages, image_url, is_active)
  on table public.listings to authenticated;

-- ─── Reports ─────────────────────────────────────────────────────────────────

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null,
  target_id   uuid not null,
  reason      text not null,
  details     text,
  status      text not null default 'open',
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null,
  constraint reports_target_type_check check (target_type in ('listing', 'user')),
  constraint reports_reason_check check (reason in (
    'spam', 'scam', 'fake', 'inappropriate', 'harassment', 'other'
  )),
  constraint reports_status_check check (status in ('open', 'dismissed', 'actioned')),
  constraint reports_details_length check (char_length(details) <= 1000),
  constraint reports_one_per_target unique (reporter_id, target_type, target_id)
);

create index if not exists reports_status_created_idx on public.reports (status, created_at desc);
create index if not exists reports_reporter_created_idx on public.reports (reporter_id, created_at desc);

alter table public.reports enable row level security;
revoke all on table public.reports from anon, authenticated;

-- Insert only, as yourself. No SELECT/UPDATE/DELETE for clients.
grant insert (reporter_id, target_type, target_id, reason, details)
  on table public.reports to authenticated;

create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

commit;
