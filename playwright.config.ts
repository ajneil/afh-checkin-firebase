import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    // Placeholder public Firebase config: tests stub Firebase Auth's network calls.
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'e2e-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo-afh.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-afh',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'e2e-app-id',
    },
  },
})
