-- Step 2 of 2 (contract): remove the world-readable phone column.
-- Run ONLY after the app version that reads `private_profiles` is deployed;
-- older code still writes `profiles.phone_number` and would fail.

begin;

-- Catch numbers saved by the old code between step 1 and the deploy
insert into public.private_profiles (id, phone_number)
select id, phone_number
from public.profiles
where phone_number is not null
on conflict (id) do update set phone_number = excluded.phone_number;

alter table public.profiles drop column if exists phone_number;

commit;
