-- Private profile data, readable and writable only by its owner.
-- `profiles` is world-readable (public profile pages), so the phone number moves
-- here. Step 1 of 2 (expand): create and copy. The old column is dropped in a
-- later migration, after the app code reading this table is deployed.

begin;

create table if not exists public.private_profiles (
  id           uuid primary key references public.profiles (id) on delete cascade,
  phone_number text,
  updated_at   timestamptz not null default now(),
  constraint phone_number_format check (
    phone_number is null or phone_number ~ '^\+?[0-9 ()-]{6,20}$'
  )
);

alter table public.private_profiles enable row level security;

-- Only the signed-in owner; no anon access at all.
revoke all on table public.private_profiles from anon;

create policy private_profiles_select_own on public.private_profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy private_profiles_insert_own on public.private_profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy private_profiles_update_own on public.private_profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Copy existing numbers (none at the time of writing)
insert into public.private_profiles (id, phone_number)
select id, phone_number
from public.profiles
where phone_number is not null
on conflict (id) do update set phone_number = excluded.phone_number;

commit;
