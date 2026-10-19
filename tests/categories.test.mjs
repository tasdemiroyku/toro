import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { CATEGORIES, PRICE_TYPES, CATEGORY_LABEL, CATEGORY_ICON } from '../lib/categories.js'

// Values are stored in the database, so code and CHECK constraints must agree
const migrations = readdirSync('supabase/migrations')
  .map(f => readFileSync(`supabase/migrations/${f}`, 'utf8'))
  .join('\n')

// Migrations run in filename order, so the last definition of a constraint wins
const valuesInCheck = (name) => {
  const matches = [...migrations.matchAll(new RegExp(`${name} check \\(\\w+ in \\(([^)]*)\\)`, 'gs'))]
  assert.ok(matches.length > 0, `CHECK constraint ${name} not found in migrations`)
  return [...matches.at(-1)[1].matchAll(/'([a-z_]+)'/g)].map(m => m[1]).sort()
}

test('category values match the listings_category_check constraint', () => {
  assert.deepEqual(CATEGORIES.map(c => c.value).sort(), valuesInCheck('listings_category_check'))
})

test('price types match the listings_price_type_check constraint', () => {
  assert.deepEqual(PRICE_TYPES.map(p => p.value).sort(), valuesInCheck('listings_price_type_check'))
})

test('every category has a label, examples and an icon', () => {
  for (const c of CATEGORIES) {
    assert.ok(CATEGORY_LABEL[c.value], `${c.value}: label`)
    assert.ok(c.examples, `${c.value}: examples`)
    assert.ok(CATEGORY_ICON[c.value]?.length > 0, `${c.value}: icon paths`)
  }
})

test('report reasons match the reports_reason_check constraint', async () => {
  const { REPORT_REASONS } = await import('../lib/reports.js')
  const matches = [...migrations.matchAll(/reports_reason_check check \(reason in \(([^)]*)\)/gs)]
  assert.ok(matches.length > 0, 'reports_reason_check not found')
  const dbValues = [...matches.at(-1)[1].matchAll(/'([a-z_]+)'/g)].map(m => m[1]).sort()
  assert.deepEqual(REPORT_REASONS.map(r => r.value).sort(), dbValues)
})
