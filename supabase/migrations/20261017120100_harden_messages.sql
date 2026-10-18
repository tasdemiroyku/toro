-- Messages: receivers may only mark messages as read, and a message can only be
-- sent within a conversation about a listing owned by one of the two parties.

begin;

-- 1. A receiver could previously UPDATE every column (e.g. rewrite `content`).
--    Revoking the table-level privilege also removes column privileges;
--    then grant back only the `read` column.
revoke update on table public.messages from anon, authenticated;
grant update (read) on table public.messages to authenticated;

-- 2. Insert: the listing must belong to the sender or the receiver.
--    Checked through a SECURITY DEFINER helper so that replies still work when
--    the listing is paused (inactive listings are hidden by listings RLS).
create or replace function public.listing_belongs_to_either(
  p_listing_id uuid, p_user_a uuid, p_user_b uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listings
    where id = p_listing_id and user_id in (p_user_a, p_user_b)
  );
$$;

revoke execute on function public.listing_belongs_to_either(uuid, uuid, uuid) from public, anon;
grant execute on function public.listing_belongs_to_either(uuid, uuid, uuid) to authenticated;

drop policy if exists messages_insert_as_sender on public.messages;
create policy messages_insert_as_sender on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.listing_belongs_to_either(listing_id, sender_id, receiver_id)
  );

-- 3. Scope the remaining policies to signed-in users (anon never matches anyway).
drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants on public.messages
  for select to authenticated
  using ((select auth.uid()) in (sender_id, receiver_id));

drop policy if exists messages_update_read_flag on public.messages;
create policy messages_update_read_flag on public.messages
  for update to authenticated
  using (receiver_id = (select auth.uid()))
  with check (receiver_id = (select auth.uid()));

commit;
