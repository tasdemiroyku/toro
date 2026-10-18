import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeRedirectPath } from '../lib/redirect.js'

test('keeps same-origin paths, including query strings', () => {
  assert.equal(safeRedirectPath('/inbox'), '/inbox')
  assert.equal(safeRedirectPath('/listings?q=math&page=2'), '/listings?q=math&page=2')
})

test('rejects open-redirect payloads', () => {
  for (const payload of ['//evil.com', '/\\evil.com', 'https://evil.com', '@evil.com', 'javascript:alert(1)', '']) {
    assert.equal(safeRedirectPath(payload), '/', payload)
  }
})

test('falls back for non-strings and honours a custom fallback', () => {
  assert.equal(safeRedirectPath(undefined), '/')
  assert.equal(safeRedirectPath(['/inbox']), '/')
  assert.equal(safeRedirectPath('//evil.com', '/login'), '/login')
})
