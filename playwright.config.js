import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// Some managed environments ship a pre-installed Chromium whose build number may not
// match this @playwright/test version. When that symlink exists, launch it directly
// instead of downloading; in CI (where we run `playwright install`) it won't exist and
// Playwright uses its own matching browser.
const PREINSTALLED_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = existsSync(PREINSTALLED_CHROMIUM) ? PREINSTALLED_CHROMIUM : undefined;

// The e2e suite runs against the Vite DEV server because the scenario seeds
// (?seed=) are dev-only and stripped from production builds. Vite serves the app
// under the configured `base`, so baseURL includes the repo path.
const BASE = process.env.E2E_BASE_URL || 'http://localhost:5173/1861-Lincoln-Web-Game/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
