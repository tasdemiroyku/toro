-- Baseline: the production schema as of 2026-10-17, reconstructed from the live
-- database catalog (tables, constraints, functions, triggers, RLS policies).
--
-- Already applied in production — do NOT run it there again. It exists so the
-- schema is versioned and a fresh Supabase project can be recreated. Known issues
-- in this state are fixed by the migrations that follow.

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  avatar_url   text,
  bio          text,
  languages    text[],
  location     text,
  created_at   timestamptz default timezone('utc'::text, now()),
  skills       text,
  phone_number text,
  university   text,
  department   text,
  is_verified  boolean not null default false,
  username     text unique,
  constraint profiles_username_check check (username ~ '^[a-z0-9_]{3,30}$'),
  constraint username_format         check (username ~ '^[a-z0-9_]{3,30}$')
);

create table public.listings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  description text not null,
  category    text not null,
  price       numeric not null,
  price_type  text default 'hour'::text,
  location    text,
  languages   text[],
  is_active   boolean default true,
  created_at  timestamptz default timezone('utc'::text, now()),
  image_url   text,
  constraint title_length       check (char_length(title) <= 100),
  constraint description_length check (char_length(description) <= 1000),
  constraint price_positive     check (price >= 0 and price <= 10000)
);

-- FK names are referenced as PostgREST join hints in app/inbox/page.jsx
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null constraint messages_listing_id_fkey  references public.listings (id) on delete cascade,
  sender_id   uuid not null constraint messages_sender_id_fkey   references public.profiles (id) on delete cascade,
  receiver_id uuid not null constraint messages_receiver_id_fkey references public.profiles (id) on delete cascade,
  content     text not null,
  read        boolean default false,
  created_at  timestamptz default timezone('utc'::text, now()),
  constraint content_length  check (char_length(content) <= 500),
  constraint no_self_message check (sender_id <> receiver_id)
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.messages enable row level security;

-- ─── Functions & triggers ─────────────────────────────────────────────────────

-- Creates the profile row for every new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$function$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.auto_verify_student_email()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  user_email  text;
  user_domain text;
begin
  select lower(email) into user_email
  from auth.users
  where id = new.id;

  user_domain := split_part(user_email, '@', 2);

  if user_domain = any(array[
    'studenti.polito.it',
    'edu.unito.it',
    'studenti.unimi.it',
    'studio.unibo.it',
    'studenti.uniroma1.it',
    'studenti.uniroma2.it',
    'studenti.unipd.it',
    'studenti.unifi.it',
    'studenti.unina.it'
  ]) then
    new.is_verified := true;
  else
    new.is_verified := false;
  end if;

  return new;
end;
$function$;

create or replace function public.check_student_verification()
returns trigger
language plpgsql
security definer
as $function$
declare
  user_email text;
  student_domains text[] := array[
    'studenti.polito.it',
    'edu.unito.it',
    'studenti.unimi.it',
    'studio.unibo.it',
    'studenti.uniroma1.it',
    'student.kuleuven.be',
    'etu.u-paris.fr'
  ];
  domain text;
  is_student boolean := false;
begin
  select email into user_email
  from auth.users
  where id = new.id;

  if user_email is not null then
    domain := split_part(user_email, '@', 2);
    select bool_or(domain like ('%' || sd))
    into is_student
    from unnest(student_domains) as sd;
  end if;

  new.is_verified := coalesce(is_student, false);
  return new;
end;
$function$;

create trigger trigger_auto_verify_student
  before insert or update on public.profiles
  for each row execute function public.auto_verify_student_email();

create trigger trigger_check_student_verification
  before insert or update on public.profiles
  for each row execute function public.check_student_verification();

-- Note: public.rls_auto_enable() and its event trigger (auto-enable RLS on new
-- tables in `public`) are managed by Supabase and not reproduced here.

-- ─── RLS policies ─────────────────────────────────────────────────────────────

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);
create policy profiles_select_public on public.profiles
  for select using (true);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_delete_own on public.profiles
  for delete using (auth.uid() = id);

create policy listings_select_active_or_own on public.listings
  for select using (is_active = true or auth.uid() = user_id);
create policy listings_insert_own on public.listings
  for insert with check (auth.uid() is not null and auth.uid() = user_id);
create policy listings_update_own on public.listings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy listings_delete_own on public.listings
  for delete using (auth.uid() = user_id);

create policy messages_select_participants on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy messages_insert_as_sender on public.messages
  for insert with check (auth.uid() is not null and auth.uid() = sender_id);
create policy messages_update_read_flag on public.messages
  for update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

-- ─── Storage ──────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('toro-uploads', 'toro-uploads', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Current upload paths: avatars/{uid}/… and listings/{uid}/…
create policy "Anyone can view uploads" on storage.objects
  for select using (bucket_id = 'toro-uploads');
create policy "Authenticated users can upload to own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'toro-uploads'
    and (storage.foldername(name))[1] = any (array['avatars', 'listings'])
    and auth.uid()::text = (storage.foldername(name))[2]
  );
create policy "Users can update their own files" on storage.objects
  for update to authenticated using (
    bucket_id = 'toro-uploads' and auth.uid()::text = (storage.foldername(name))[2]
  );
create policy "Users can delete their own files" on storage.objects
  for delete to authenticated using (
    bucket_id = 'toro-uploads' and auth.uid()::text = (storage.foldername(name))[2]
  );

-- Legacy policies for an older {uid}/… path layout
create policy storage_select_public on storage.objects
  for select using (bucket_id = 'toro-uploads');
create policy storage_insert_own on storage.objects
  for insert with check (
    bucket_id = 'toro-uploads' and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy storage_update_own on storage.objects
  for update using (
    bucket_id = 'toro-uploads' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy storage_delete_own on storage.objects
  for delete using (
    bucket_id = 'toro-uploads' and (storage.foldername(name))[1] = auth.uid()::text
  );
