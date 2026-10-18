-- Sample listings for the categories added in 20261018130000_more_categories.sql.
-- Run after that migration and after demo_listings.sql (needs the same demo users).

begin;

insert into public.listings
  (user_id, title, description, category, price, price_type, location, languages, is_active, is_sample, created_at)
select p.id, l.title, l.description, l.category, l.price, l.price_type, l.location, l.languages, true, true,
       now() - make_interval(hours => l.hours_ago)
from (values
  ('selin_torino', 'Dog walking and pet sitting near Parco della Colletta',
   'Grew up with two dogs and a cat. Daily walks, feeding and cuddles while you are at lectures or away for the weekend. I send photos after every visit.',
   'pet_care', 10, 'session', 'Vanchiglia / Regio Parco', array['Turkish', 'English', 'Italian'], 8),

  ('luca_tutor', 'Proofreading and translation: Italian ↔ English',
   'CVs, cover letters, Erasmus applications and thesis chapters. I correct grammar and tone and keep your meaning. Official sworn translations are not included.',
   'translation', 20, 'hour', 'Online', array['Italian', 'English', 'Spanish'], 26),

  ('marta_polito', 'Posters, slides and simple logos for student projects',
   'Clean designs in Figma or Canva for associations, events and group presentations. Two rounds of changes included; files delivered ready to print or share.',
   'design_media', 40, 'fixed', 'Crocetta / Online', array['Italian', 'English'], 48)
) as l(username, title, description, category, price, price_type, location, languages, hours_ago)
join public.profiles p on p.username = l.username;

commit;
