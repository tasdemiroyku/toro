-- One source of truth for the "Verified Student" badge.
--
-- Before: two BEFORE triggers with different domain lists; the second one
-- (alphabetically) silently overwrote the first. It matched with
-- LIKE '%domain' and ignored whether the e-mail was confirmed.
-- After: one domain list, exact-or-subdomain match, confirmed e-mails only,
-- re-evaluated when the auth e-mail changes or gets confirmed.

begin;

-- Extend this list when adding institutions
create or replace function public.is_student_email(p_email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select exists (
    select 1
    from unnest(array[
      'studenti.polito.it',
      'edu.unito.it',
      'studenti.unimi.it',
      'studio.unibo.it',
      'studenti.uniroma1.it',
      'studenti.uniroma2.it',
      'studenti.unipd.it',
      'studenti.unifi.it',
      'studenti.unina.it',
      'student.kuleuven.be',
      'etu.u-paris.fr'
    ]) as allowed(domain)
    where lower(split_part(p_email, '@', 2)) = allowed.domain
       or lower(split_part(p_email, '@', 2)) like '%.' || allowed.domain
  );
$$;

-- profiles: computed on every insert/update, so clients can never set it
create or replace function public.set_profile_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_email   text;
  confirmed_at timestamptz;
begin
  select email, email_confirmed_at into user_email, confirmed_at
  from auth.users
  where id = new.id;

  new.is_verified := coalesce(
    confirmed_at is not null and public.is_student_email(user_email),
    false
  );
  return new;
end;
$$;

-- auth.users: re-check when the e-mail is confirmed or changed
create or replace function public.sync_profile_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set is_verified = (new.email_confirmed_at is not null and public.is_student_email(new.email))
  where id = new.id;
  return null;
end;
$$;

-- Internal helpers: not callable through the API
revoke execute on function public.is_student_email(text) from public, anon, authenticated;
revoke execute on function public.set_profile_verification() from public, anon, authenticated;
revoke execute on function public.sync_profile_verification() from public, anon, authenticated;

drop trigger if exists trigger_auto_verify_student on public.profiles;
drop trigger if exists trigger_check_student_verification on public.profiles;
drop function if exists public.auto_verify_student_email();
drop function if exists public.check_student_verification();

create trigger set_profile_verification
  before insert or update on public.profiles
  for each row execute function public.set_profile_verification();

create trigger on_auth_user_email_change
  after update of email, email_confirmed_at on auth.users
  for each row execute function public.sync_profile_verification();

-- Re-evaluate every existing profile with the new rules
update public.profiles set is_verified = is_verified;

commit;
