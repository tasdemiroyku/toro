-- Read-only: columns, constraints, indexes and realtime publication of `public`.
select * from (
  select '1 column'::text as section, (table_name || '.' || lpad(ordinal_position::text, 2, '0') || ' ' || column_name)::text as object,
         ((case when data_type = 'ARRAY' then udt_name else data_type end)
          || case when is_nullable = 'NO' then ' not null' else '' end
          || coalesce(' default ' || column_default, ''))::text as detail
  from information_schema.columns where table_schema = 'public'
  union all
  select '2 constraint', (conrelid::regclass || ' -> ' || conname)::text, pg_get_constraintdef(oid)
  from pg_constraint where connamespace = 'public'::regnamespace
  union all
  select '3 index', (tablename || ' -> ' || indexname)::text, indexdef
  from pg_indexes where schemaname = 'public'
  union all
  select '4 realtime', (schemaname || '.' || tablename)::text, pubname::text
  from pg_publication_tables where pubname = 'supabase_realtime'
) s
order by section, object;
