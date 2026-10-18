-- Student status via a one-time code sent to a university e-mail.
--
-- Anyone can sign up with any e-mail. The "Verified Student" badge is no longer
-- derived from the sign-up e-mail (20261017120300); instead the user proves
-- ownership of an allow-listed university address by entering a 6-digit code
-- (app/actions/verification.js). Only the service role may grant the badge.
--
-- Safe to run before the app deploy: the legacy profiles.phone_number column
-- keeps its client grants until 20261017120700 drops it.

begin;

-- ─── 1. Retire the sign-up-e-mail triggers ────────────────────────────────────

drop trigger if exists set_profile_verification on public.profiles;
drop trigger if exists on_auth_user_email_change on auth.users;
drop function if exists public.set_profile_verification();
drop function if exists public.sync_profile_verification();

-- The domain allowlist stays; the Server Action calls it with the service role
grant execute on function public.is_student_email(text) to service_role;

-- Badges are re-earned through the new flow
update public.profiles set is_verified = false where is_verified;

-- ─── 2. Clients can no longer write is_verified ──────────────────────────────
-- Replace table-wide INSERT/UPDATE with an explicit list of editable columns.

revoke insert, update on table public.profiles from anon, authenticated;

grant insert (id, username, full_name, avatar_url, bio, languages, location,
              skills, university, department)
  on table public.profiles to authenticated;
grant update (id, username, full_name, avatar_url, bio, languages, location,
              skills, university, department)
  on table public.profiles to authenticated;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'phone_number'
  ) then
    grant insert (phone_number), update (phone_number) on table public.profiles to authenticated;
  end if;
end;
$$;

-- ─── 3. Verified university e-mail (private, one account per address) ────────

alter table public.private_profiles
  add column if not exists student_email       text,
  add column if not exists student_verified_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'student_email_lowercase') then
    alter table public.private_profiles
      add constraint student_email_lowercase check (student_email = lower(student_email));
  end if;
end;
$$;

create unique index if not exists private_profiles_student_email_key
  on public.private_profiles (student_email);

-- Owners may edit their phone number but not the verified e-mail
revoke insert, update on table public.private_profiles from authenticated;
grant insert (id, phone_number, updated_at) on table public.private_profiles to authenticated;
grant update (id, phone_number, updated_at) on table public.private_profiles to authenticated;

-- ─── 4. Pending codes (service role only) ────────────────────────────────────

create table if not exists public.student_verifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  email       text not null,
  code_hash   text not null,             -- HMAC-SHA256, never the code itself
  attempts    smallint not null default 0,
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  created_at  timestamptz not null default now(),
  constraint attempts_range check (attempts between 0 and 10)
);

create index if not exists student_verifications_user_created_idx
  on public.student_verifications (user_id, created_at desc);

-- RLS on with no policies + no grants: invisible to anon and authenticated
alter table public.student_verifications enable row level security;
revoke all on table public.student_verifications from anon, authenticated;

commit;
