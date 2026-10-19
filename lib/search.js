// Free-text search helpers for PostgREST `.or()` filters.
// The user's text always ends up inside one quoted value, so characters such as
// commas, dots and parentheses cannot start a new filter, and LIKE wildcards
// match literally.

export const MAX_SEARCH_LENGTH = 100

/** Trims, collapses whitespace and limits a raw `?q=` value. Non-strings give ''. */
export function normalizeSearchQuery(raw) {
  if (typeof raw !== 'string') return ''
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_SEARCH_LENGTH)
}

/**
 * A quoted `"%text%"` pattern for an ilike filter:
 * - `%`, `_` and `\` are escaped for LIKE, so they match themselves
 * - `*` is removed (PostgREST treats it as an alias for `%`)
 * - `"` and `\` are escaped for PostgREST's quoted values
 */
export function ilikeContains(text) {
  const like = text.replace(/\*/g, '').replace(/[\\%_]/g, ch => `\\${ch}`)
  return `"%${like.replace(/["\\]/g, ch => `\\${ch}`)}%"`
}

/** `col.ilike."%text%"` for every column, joined for supabase-js `.or()`. */
export function ilikeAnyColumn(columns, text) {
  const pattern = ilikeContains(text)
  return columns.map(column => `${column}.ilike.${pattern}`).join(',')
}
