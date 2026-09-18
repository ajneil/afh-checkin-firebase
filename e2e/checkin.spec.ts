import { test, expect } from '@playwright/test'

const FAKE_TOKEN = 'test-token-abc123'

import type { Page } from '@playwright/test'

/** Click the "Next" button in the check-in flow (not the Next.js Dev Tools button). */
async function clickNext(page: Page) {
  await page.locator('main').getByRole('button', { name: 'Next', exact: true }).click()
}

test.describe('Check-in page — invalid token', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/checkin/${FAKE_TOKEN}`, (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'not_found' }),
      })
    })
  })

  test("navigating to an invalid token shows the \"link isn't valid\" message", async ({ page }) => {
    await page.goto(`/checkin/${FAKE_TOKEN}`)
    await expect(page.getByText(/this link isn't valid/i)).toBeVisible()
  })
})

test.describe('Check-in page — already completed', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/checkin/${FAKE_TOKEN}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'completed' }),
      })
    })
  })

  test("navigating to an already-completed token shows the \"already completed\" message", async ({ page }) => {
    await page.goto(`/checkin/${FAKE_TOKEN}`)
    await expect(page.getByText(/you've already completed today's check-in/i)).toBeVisible()
  })
})

test.describe('Check-in flow — valid token', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/checkin/${FAKE_TOKEN}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'pending' }),
      })
    })
    await page.route('**/api/checkin/complete', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })
  })

  test('navigating to a valid token shows the Breathe step', async ({ page }) => {
    await page.goto(`/checkin/${FAKE_TOKEN}`)
    await expect(page.getByRole('heading', { name: /breath/i })).toBeVisible()
  })

  test('user can progress through all 4 steps', async ({ page }) => {
    await page.goto(`/checkin/${FAKE_TOKEN}`)
    // Step 1: Breathe
    await expect(page.getByRole('heading', { name: /breath/i })).toBeVisible()
    await page.getByRole('button', { name: "I'm ready" }).click()
    // Step 2: Reflect
    await expect(page.getByRole('heading', { name: /how are you feeling/i })).toBeVisible()
    await clickNext(page)
    // Step 3: Gratitude
    await expect(page.getByRole('heading', { name: /grateful/i })).toBeVisible()
    await clickNext(page)
    // Step 4: Intention
    await expect(page.getByRole('heading', { name: /one thing/i })).toBeVisible()
  })

  test('user can submit responses and sees the completion state', async ({ page }) => {
    await page.goto(`/checkin/${FAKE_TOKEN}`)
    await page.getByRole('button', { name: "I'm ready" }).click()
    await clickNext(page)
    await clickNext(page)
    await page.locator('main').getByRole('button', { name: 'Submit', exact: true }).click()
    await expect(page.getByText(/well done/i)).toBeVisible()
  })
})
