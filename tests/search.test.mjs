import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeSearchQuery, ilikeContains, ilikeAnyColumn, MAX_SEARCH_LENGTH } from '../lib/search.js'

test('normalizes the raw query', () => {
  assert.equal(normalizeSearchQuery('  linear   algebra \n'), 'linear algebra')
  assert.equal(normalizeSearchQuery('x'.repeat(500)).length, MAX_SEARCH_LENGTH)
  assert.equal(normalizeSearchQuery(undefined), '')
  assert.equal(normalizeSearchQuery(['math']), '')
})

test('wraps plain text in a quoted contains pattern', () => {
  assert.equal(ilikeContains('math'), '"%math%"')
})

test('keeps filter syntax inside the quoted value', () => {
  // Without quoting, this would close the or() group and add a new filter
  const payload = 'x),is_active.eq.false,(title.ilike.*'
  assert.equal(ilikeContains(payload), '"%x),is\\\\_active.eq.false,(title.ilike.%"')
  assert.equal(ilikeContains('Italian, English (A1.B2)'), '"%Italian, English (A1.B2)%"')
})

test('makes LIKE wildcards match literally', () => {
  assert.equal(ilikeContains('100%'), '"%100\\\\%%"')
  assert.equal(ilikeContains('tech_help'), '"%tech\\\\_help%"')
  assert.equal(ilikeContains('a*b'), '"%ab%"')
})

test('escapes quotes and backslashes for PostgREST', () => {
  assert.equal(ilikeContains('say "hi"'), '"%say \\"hi\\"%"')
  assert.equal(ilikeContains('a\\b'), '"%a\\\\\\\\b%"')
})

test('builds one ilike filter per column', () => {
  assert.equal(
    ilikeAnyColumn(['title', 'description'], 'math'),
    'title.ilike."%math%",description.ilike."%math%"'
  )
})
