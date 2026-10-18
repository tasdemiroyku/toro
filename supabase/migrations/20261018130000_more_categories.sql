-- Three new listing categories (mirrors lib/categories.js):
-- pet_care, translation, design_media. Existing values are unchanged.

begin;

alter table public.listings drop constraint if exists listings_category_check;

alter table public.listings
  add constraint listings_category_check check (category in (
    'tutoring', 'cleaning', 'consular', 'elderly_care',
    'moving', 'tech_help', 'language_exchange',
    'pet_care', 'translation', 'design_media'
  ));

commit;
