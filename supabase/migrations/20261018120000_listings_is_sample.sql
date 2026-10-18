-- Mark demo content so the UI can label it ("Sample listing") and so it can be
-- removed in one statement before the public launch:
--   delete from public.listings where is_sample;

alter table public.listings
  add column if not exists is_sample boolean not null default false;
