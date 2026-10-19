import { test, expect } from '@playwright/test'
import { CATEGORIES } from '../lib/categories.js'

// Smoke tests for a logged-out visitor. They read live public data, so they
// assert structure and behaviour, never exact counts or titles.

test('home shows the hero, every category and how it works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Help from students')
  await expect(page.locator('a[href^="/listings?category="]')).toHaveCount(CATEGORIES.length + 4) // tiles + hero chips
  await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible()
  await expect(page.getByText('Get launch updates')).toBeVisible()
})

test('hero search opens the results page with the query', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Search services').fill('tutoring')
  await page.getByLabel('Search services').press('Enter')
  await expect(page).toHaveURL(/\/listings\?q=tutoring/)
  await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible()
})

test('a category chip filters the listings', async ({ page }) => {
  await page.goto('/listings')
  await page.getByRole('button', { name: 'Tutoring', exact: true }).click()
  await expect(page).toHaveURL(/category=tutoring/)
})

test('a listing card opens its detail page', async ({ page }) => {
  await page.goto('/listings')
  const card = page.locator('a[href^="/listings/"]').filter({ has: page.getByRole('heading') }).first()
  await card.click()
  await expect(page).toHaveURL(/\/listings\/[0-9a-f-]{36}$/)
  await expect(page.getByRole('button', { name: 'Log in to contact' })).toBeVisible()
})

test('search text cannot change the filter', async ({ page }) => {
  const payload = 'x),is_active.eq.false,(title.ilike.*'
  const response = await page.goto(`/listings?q=${encodeURIComponent(payload)}`)
  expect(response.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible()
})

for (const path of ['/inbox', '/listings/create', '/admin/reports']) {
  test(`${path} sends logged-out visitors to log in`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`/login\\?redirectTo=${encodeURIComponent(path)}`))
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })
}

test('the login page switches to sign up', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
})

test('an unknown listing shows the 404 page', async ({ page }) => {
  const response = await page.goto('/listings/00000000-0000-4000-8000-000000000000')
  expect(response.status()).toBe(404)
  await expect(page.getByText('This page does not exist')).toBeVisible()
})
