-- The inbox and the header unread dot subscribe to INSERTs on `messages`
-- (postgres_changes), which only fire for tables in the realtime publication.
-- Realtime still applies RLS: users only receive messages they can SELECT.

alter publication supabase_realtime add table public.messages;
