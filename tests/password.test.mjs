import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isStrongPassword, PASSWORD_RULES } from '../lib/password.js'

test('accepts a password that meets every rule', () => {
  assert.equal(isStrongPassword('Torino#2026'), true)
})

test('reports each missing requirement', () => {
  const cases = {
    length: 'To#1a',
    lower:  'TORINO#2026',
    upper:  'torino#2026',
    digit:  'Torino#Turin',
    symbol: 'Torino2026',
  }
  for (const [ruleId, password] of Object.entries(cases)) {
    const rule = PASSWORD_RULES.find(r => r.id === ruleId)
    assert.equal(rule.test(password), false, `${ruleId} should fail for "${password}"`)
    assert.equal(isStrongPassword(password), false)
  }
})

test('rejects non-string input', () => {
  assert.equal(isStrongPassword(undefined), false)
  assert.equal(isStrongPassword(12345678), false)
})
