import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { CATEGORIES, PRICE_TYPES, CATEGORY_LABEL, CATEGORY_ICON } from '../lib/categories.js'

// Values are stored in the database, so code and CHECK constraints must agree
const migrations = readdirSync('supabase/migrations')
  .map(f => readFileSync(`supabase/migrations/${f}`, 'utf8'))
  .join('\n')

const valuesInCheck = (name) => {
  const match = migrations.match(new RegExp(`${name} check \\(\\w+ in \\(([^)]*)\\)`, 's'))
  assert.ok(match, `CHECK constraint ${name} not found in migrations`)
  return [...match[1].matchAll(/'([a-z_]+)'/g)].map(m => m[1]).sort()
}

test('category values match the listings_category_check constraint', () => {
  assert.deepEqual(CATEGORIES.map(c => c.value).sort(), valuesInCheck('listings_category_check'))
})

test('price types match the listings_price_type_check constraint', () => {
  assert.deepEqual(PRICE_TYPES.map(p => p.value).sort(), valuesInCheck('listings_price_type_check'))
})

test('every category has a label, an icon and a generated cover', () => {
  for (const c of CATEGORIES) {
    assert.ok(CATEGORY_LABEL[c.value], `${c.value}: label`)
    assert.ok(CATEGORY_ICON[c.value]?.length > 0, `${c.value}: icon paths`)
    assert.ok(existsSync(`public${c.defaultImage}`), `${c.value}: ${c.defaultImage} missing`)
  }
})
