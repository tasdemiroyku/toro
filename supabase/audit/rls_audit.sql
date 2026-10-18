-- Read-only: RLS status, policies, triggers, functions, profile column grants,
-- storage buckets. Run in the Supabase SQL Editor after every migration.
select * from (
  select '1 table'::text as section, c.relname::text as object,
         ('rls=' || c.relrowsecurity || ', force=' || c.relforcerowsecurity)::text as detail
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'

  union all
  select '2 policy', (schemaname || '.' || tablename || ' -> ' || policyname)::text,
         (cmd || ' to ' || array_to_string(roles, ',') ||
          ' | using: ' || coalesce(qual, '-') || ' | check: ' || coalesce(with_check, '-'))::text
  from pg_policies where schemaname in ('public', 'storage')

  union all
  select '3 trigger', (event_object_schema || '.' || event_object_table || ' -> ' || trigger_name)::text,
         (action_timing || ' ' || event_manipulation || ': ' || action_statement)::text
  from information_schema.triggers where event_object_schema in ('public', 'auth')

  union all
  select '4 function', p.proname::text, pg_get_functiondef(p.oid)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'

  union all
  select '5 profiles column access', column_name::text,
         (grantee || ': ' || string_agg(privilege_type, ','))::text
  from information_schema.column_privileges
  where table_schema = 'public' and table_name = 'profiles' and grantee in ('anon', 'authenticated')
  group by column_name, grantee

  union all
  select '6 bucket', id::text,
         ('public=' || public || ', size_limit=' || coalesce(file_size_limit::text, 'none') ||
          ', mime=' || coalesce(array_to_string(allowed_mime_types, ','), 'any'))::text
  from storage.buckets
) audit
order by section, object;
