import { test, expect } from '@playwright/test'

test.describe('Sign-in page', () => {
  test.beforeEach(async ({ page }) => {
    // Stand in for Firebase Auth sending the email link.
    await page.route('**/accounts:sendOobCode**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ kind: 'identitytoolkit#GetOobConfirmationCodeResponse', email: 'alex@example.com' }),
      })
    )
  })

  test('offers Google and email-link sign-in', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    await expect(page.getByLabel(/your name/i)).toBeVisible()
    await expect(page.getByLabel(/email address/i)).toBeVisible()
  })

  test('the email button stays disabled until name and email are filled', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: /email me a sign-in link/i })
    await page.getByLabel(/your name/i).fill('Alex')
    await expect(button).toBeDisabled()
    await page.getByLabel(/email address/i).fill('alex@example.com')
    await expect(button).toBeEnabled()
  })

  test('sending a sign-in link asks the person to check their inbox', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/your name/i).fill('Alex')
    await page.getByLabel(/email address/i).fill('alex@example.com')
    await page.getByRole('button', { name: /email me a sign-in link/i }).click()
    await expect(page.getByText(/check your inbox/i)).toBeVisible()
    await expect(page.getByText('alex@example.com')).toBeVisible()
  })

  test('opening /auth/finish without a link explains it is not valid', async ({ page }) => {
    await page.goto('/auth/finish')
    await expect(page.getByText(/sign-in link isn't valid/i)).toBeVisible()
  })
})
