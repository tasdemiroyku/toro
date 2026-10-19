import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
const { canOptimizeImage } = await import('../lib/images.js')

test('optimizes our own files and public Storage files', () => {
  assert.equal(canOptimizeImage('/images/toret/bull.jpg'), true)
  assert.equal(canOptimizeImage('https://example.supabase.co/storage/v1/object/public/toro-uploads/avatars/a.webp'), true)
})

test('shows other sources as they are', () => {
  for (const src of [
    'https://lh3.googleusercontent.com/a/photo',
    'https://example.supabase.co/storage/v1/object/sign/private.webp',
    'https://example.supabase.co.evil.com/storage/v1/object/public/x.webp',
    '//evil.com/x.png',
    'blob:http://localhost:3000/1234',
    undefined,
  ]) {
    assert.equal(canOptimizeImage(src), false, String(src))
  }
})
