const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm start',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120000,
      },
});