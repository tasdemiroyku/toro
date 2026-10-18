-- Demo content for the pre-launch site. Run in the Supabase SQL Editor AFTER:
--   1. migration 20261018120000_listings_is_sample.sql
--   2. signing up and finishing onboarding with these usernames:
--        marta_polito, luca_tutor, selin_torino
--      (your own account, tasdemiroyku, is used too)
--
-- Every row is marked is_sample = true and shown with a "Sample listing" label.
-- Remove all of it before the public launch with:
--   delete from public.listings where is_sample;

begin;

-- Fail early (and change nothing) if a demo account is missing
do $$
declare
  missing text;
begin
  select string_agg(u, ', ') into missing
  from unnest(array['marta_polito', 'luca_tutor', 'selin_torino', 'tasdemiroyku']) as u
  where not exists (select 1 from public.profiles p where p.username = u);

  if missing is not null then
    raise exception 'Create these accounts first (finish onboarding with this username): %', missing;
  end if;
end;
$$;

-- 1. Remove the early test listings ("f", "j", "e", "e", "4")
delete from public.listings where id in (
  'e5d7617e-e497-4b56-84a0-67eb6327d720',
  'b9113a62-1e18-435b-871a-49c07c6aab5b',
  '8a478abe-fd0f-4aae-9883-f9e81b24a051',
  'b46358ef-1740-436e-9731-acc177e85418',
  '5681fa39-dbb6-4b07-89da-8ecfc3683ea1'
);

-- 2. Fill in the demo profiles
update public.profiles as p set
  bio        = d.bio,
  languages  = d.languages,
  university = d.university,
  department = d.department,
  location   = d.location
from (values
  ('marta_polito', 'Second-year Mechanical Engineering student at PoliTo. I love explaining maths until it clicks.',
     array['Italian', 'English'], 'Politecnico di Torino', 'Mechanical Engineering', 'Crocetta'),
  ('luca_tutor',   'Turin native studying Modern Languages. Happy to help newcomers with Italian and with the city''s bureaucracy.',
     array['Italian', 'English', 'Spanish'], 'Università di Torino', 'Modern Languages', 'San Salvario'),
  ('selin_torino', 'Erasmus student from Istanbul, doing a Master''s in Architecture. Weekend helper for moves, cleaning and IKEA runs.',
     array['Turkish', 'English', 'Italian'], 'Politecnico di Torino', 'Architecture', 'Vanchiglia')
) as d(username, bio, languages, university, department, location)
where p.username = d.username;

-- 3. Sample listings
insert into public.listings
  (user_id, title, description, category, price, price_type, location, languages, is_active, is_sample, created_at)
select p.id, l.title, l.description, l.category, l.price, l.price_type, l.location, l.languages, true, true,
       now() - make_interval(hours => l.hours_ago)
from (values
  ('marta_polito', 'Calculus & Linear Algebra for PoliTo first-years',
   'Struggling with Analisi 1 or Geometria? I passed both with 30 and tutor first-year students every semester. We go through the theory, then past exam papers step by step. In person near Politecnico or online.',
   'tutoring', 18, 'hour', 'Crocetta / Online', array['Italian', 'English'], 3),

  ('marta_polito', 'Physics I exam preparation (mechanics & thermodynamics)',
   'Two-hour sessions focused on solving written exam problems under time pressure. I bring a set of exercises from previous years and we review your weak spots.',
   'tutoring', 20, 'session', 'Crocetta', array['Italian', 'English'], 40),

  ('luca_tutor', 'Italian for exchange students: grammar & conversation',
   'From your first "piacere" to ordering at the market like a local. Lessons adapted to your level (A1–B2), with real-life situations: the doctor, the landlord, the post office.',
   'tutoring', 15, 'hour', 'San Salvario', array['Italian', 'English', 'Spanish'], 6),

  ('luca_tutor', 'Permesso di soggiorno: kit, Poste and Questura appointment',
   'I help you fill in the residence permit kit correctly, check your documents and book the appointment. I have done it with many friends. Not legal advice, just practical help to avoid mistakes.',
   'consular', 25, 'fixed', 'Centro / Online', array['Italian', 'English'], 20),

  ('luca_tutor', 'Codice fiscale, residenza and tessera sanitaria walkthrough',
   'A one-hour session where we go through the documents, the offices and the online bookings you need in your first weeks in Turin, in the right order.',
   'consular', 15, 'session', 'Centro', array['Italian', 'English'], 70),

  ('selin_torino', 'Help moving between flats (two people, no van)',
   'My flatmate and I can carry boxes and furniture, pack and load. If you need a van, we help you book one from a rental near Porta Nuova. Weekends preferred.',
   'moving', 15, 'hour', 'Vanchiglia', array['Turkish', 'English', 'Italian'], 10),

  ('selin_torino', 'IKEA pick-up and furniture assembly',
   'I go to IKEA Collegno with you (or for you), and assemble beds, desks and wardrobes. I bring my own tools. Price for a standard room setup.',
   'moving', 35, 'fixed', 'All Turin', array['Turkish', 'English'], 52),

  ('selin_torino', 'End-of-lease deep clean for student flats',
   'Getting your deposit back starts here: kitchen degreasing, bathroom limescale, windows and floors. Cleaning products included. Price for a two-room flat.',
   'cleaning', 70, 'fixed', 'Vanchiglia / Aurora', array['Turkish', 'English', 'Italian'], 28),

  ('marta_polito', 'Weekly cleaning for shared apartments',
   'Common areas (kitchen, bathroom, living room) cleaned every week at a fixed time, so nobody in the flat has to argue about it again.',
   'cleaning', 12, 'hour', 'Crocetta / Santa Rita', array['Italian', 'English'], 90),

  ('tasdemiroyku', 'Laptop setup, Wi-Fi and printer troubleshooting',
   'Computer engineering student at PoliTo. I set up new laptops, fix slow ones, configure eduroam and the university VPN, and get printers talking to your computer.',
   'tech_help', 15, 'session', 'Crocetta / Online', array['Turkish', 'English', 'Italian'], 4),

  ('tasdemiroyku', 'Turkish ↔ English conversation exchange',
   'Let''s meet for a coffee once a week: half the time in Turkish, half in English. Great if you are learning Turkish or preparing for an English exam.',
   'language_exchange', 0, 'free', 'Vanchiglia', array['Turkish', 'English'], 15),

  ('luca_tutor', 'Italian ↔ Spanish tandem over aperitivo',
   'Looking for a Spanish speaker who wants to practise Italian. We alternate languages every 30 minutes. Usually Thursday evenings around Piazza Vittorio.',
   'language_exchange', 0, 'free', 'Borgo Po / Vanchiglia', array['Italian', 'Spanish'], 33),

  ('marta_polito', 'Companionship and grocery runs for elderly neighbours',
   'I visit, keep company, help with the weekly shopping and short walks. References from two families in Crocetta available on request.',
   'elderly_care', 12, 'hour', 'Crocetta / Santa Rita', array['Italian'], 60),

  ('selin_torino', 'Afternoon help for older people: reading, errands, a walk',
   'Patient and reliable. I can read the newspaper together, pick up prescriptions or accompany someone to an appointment. Weekday afternoons.',
   'elderly_care', 13, 'hour', 'Aurora / Vanchiglia', array['English', 'Italian'], 110)
) as l(username, title, description, category, price, price_type, location, languages, hours_ago)
join public.profiles p on p.username = l.username;

commit;
