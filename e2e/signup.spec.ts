import { test, expect } from '@playwright/test'

test.describe('Sign-up flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/signup', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })
  })

  test('user can fill in name and email and submit the form', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/your name/i).fill('Alex')
    await page.getByLabel(/email address/i).fill('alex@example.com')
    await page.getByRole('button', { name: /start your daily check-in/i }).click()
    await expect(page.getByText(/check your inbox/i)).toBeVisible()
  })

  test('success message appears after submission', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/your name/i).fill('Jordan')
    await page.getByLabel(/email address/i).fill('jordan@example.com')
    await page.getByRole('button', { name: /start your daily check-in/i }).click()
    await expect(page.getByText(/check your inbox/i)).toBeVisible()
    await expect(page.getByText(/first check-in email is on its way/i)).toBeVisible()
  })

  test('submit button is disabled when email field is empty', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/your name/i).fill('Alex')
    await expect(
      page.getByRole('button', { name: /start your daily check-in/i })
    ).toBeDisabled()
  })
})
