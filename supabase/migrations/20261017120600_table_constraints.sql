-- Database-level validation and indexes. The UI already enforces these, but
-- the API is public, so the database must reject bad data on its own.
-- Allowed values mirror lib/categories.js (CATEGORIES, PRICE_TYPES).

begin;

-- ─── listings ─────────────────────────────────────────────────────────────────

alter table public.listings
  add constraint listings_category_check check (category in (
    'tutoring', 'cleaning', 'consular', 'elderly_care',
    'moving', 'tech_help', 'language_exchange'
  )),
  add constraint listings_price_type_check check (price_type in (
    'hour', 'session', 'day', 'fixed', 'free'
  )),
  add constraint listings_title_not_blank check (char_length(trim(title)) > 0),
  add constraint listings_location_length check (char_length(location) <= 100),
  add constraint listings_languages_count check (cardinality(languages) <= 15);

update public.listings set price_type = 'hour' where price_type is null;
update public.listings set is_active = true where is_active is null;
alter table public.listings
  alter column price_type set not null,
  alter column is_active set not null;

-- ─── messages ─────────────────────────────────────────────────────────────────

alter table public.messages
  add constraint messages_content_not_blank check (char_length(trim(content)) > 0);

update public.messages set read = false where read is null;
alter table public.messages alter column read set not null;

-- ─── profiles ─────────────────────────────────────────────────────────────────

-- Two identical username checks existed; keep one
alter table public.profiles drop constraint if exists profiles_username_check;

alter table public.profiles
  add constraint profiles_full_name_length  check (char_length(full_name) <= 100),
  add constraint profiles_bio_length        check (char_length(bio) <= 300),
  add constraint profiles_skills_length     check (char_length(skills) <= 300),
  add constraint profiles_location_length   check (char_length(location) <= 100),
  add constraint profiles_university_length check (char_length(university) <= 150),
  add constraint profiles_department_length check (char_length(department) <= 150),
  add constraint profiles_languages_count   check (cardinality(languages) <= 15);

-- ─── Indexes for foreign keys and common filters ─────────────────────────────

create index if not exists listings_user_id_idx           on public.listings (user_id);
create index if not exists listings_active_created_at_idx on public.listings (created_at desc) where is_active;
create index if not exists messages_listing_id_idx        on public.messages (listing_id);
create index if not exists messages_sender_id_idx         on public.messages (sender_id);
create index if not exists messages_receiver_id_idx       on public.messages (receiver_id);

commit;
