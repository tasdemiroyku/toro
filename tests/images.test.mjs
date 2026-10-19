import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
const { canOptimizeImage, isListingImageUrl } = await import('../lib/images.js')

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

const OWNER = '11111111-1111-4111-8111-111111111111'
const LISTING = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const FOLDER = `https://example.supabase.co/storage/v1/object/public/toro-uploads/listings/${OWNER}/${LISTING}/`

test('accepts a photo uploaded to the listing folder', () => {
  assert.equal(isListingImageUrl(`${FOLDER}0f8fad5b-d9cb-469f-a165-70867728950e.webp`, OWNER, LISTING), true)
  assert.equal(isListingImageUrl(`${FOLDER}1760869200000.jpg`, OWNER, LISTING), true)
})

test('rejects listing photos from anywhere else', () => {
  const OTHER = '22222222-2222-4222-8222-222222222222'
  const storage = 'https://example.supabase.co/storage/v1/object/public/toro-uploads/'
  for (const src of [
    'https://evil.example/pixel.gif',
    `${storage}listings/${OTHER}/${LISTING}/x.webp`,
    `${storage}listings/${OWNER}/${OTHER}/x.webp`,
    `${storage}avatars/${OWNER}/avatar.webp`,
    `${FOLDER}../../${OTHER}/x.webp`,
    `${FOLDER}a/b.webp`,
    `${FOLDER}x.webp?track=1`,
    `${FOLDER}x.webp#frag`,
    `${FOLDER}x%2F.webp`,
    `${FOLDER}x.svg`,
    `${FOLDER}x.webp\n`,
    FOLDER,
    `https://example.supabase.co.evil.com/storage/v1/object/public/toro-uploads/listings/${OWNER}/${LISTING}/x.webp`,
    `http://example.supabase.co/storage/v1/object/public/toro-uploads/listings/${OWNER}/${LISTING}/x.webp`,
    null,
    undefined,
  ]) {
    assert.equal(isListingImageUrl(src, OWNER, LISTING), false, String(src))
  }
  assert.equal(isListingImageUrl(`${FOLDER}x.webp`, undefined, LISTING), false)
  assert.equal(isListingImageUrl(`${FOLDER}x.webp`, OWNER, undefined), false)
})
