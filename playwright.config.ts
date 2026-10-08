import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // run tests sequentially to avoid db conflicts
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  webServer: [
    {
      command: 'npm run dev --workspace=server',
      url: 'http://127.0.0.1:3000/api/combos',
      reuseExistingServer: !process.env.CI,
      env: { NODE_ENV: 'test' }
    },
    {
      command: 'npm run dev --workspace=client',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
    }
  ]
});
