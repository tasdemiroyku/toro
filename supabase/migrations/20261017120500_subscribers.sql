-- Waitlist for the home page "Notify me" form (/api/subscribe).
-- The table was referenced by the app but never created.
-- Anyone may add an address; nobody but the service role can read the list.

begin;

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  created_at timestamptz not null default now(),
  constraint email_format check (
    char_length(email) <= 254
    and email = lower(email)
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

create unique index if not exists subscribers_email_key on public.subscribers (email);

alter table public.subscribers enable row level security;

-- INSERT only. No SELECT/UPDATE/DELETE policies: the list stays private.
revoke all on table public.subscribers from anon, authenticated;
grant insert (email) on table public.subscribers to anon, authenticated;

create policy subscribers_insert_anyone on public.subscribers
  for insert to anon, authenticated
  with check (true);

commit;
