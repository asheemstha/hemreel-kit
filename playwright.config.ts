import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

// Uses Playwright's own Chromium when it is installed (npx playwright install chromium).
// Otherwise falls back to PW_CHROMIUM_PATH, or to any Chromium already in Playwright's cache, so the checks run offline.
function fallbackChromium(): string | undefined {
  if (process.env.PW_CHROMIUM_PATH) return process.env.PW_CHROMIUM_PATH;
  const cache = join(homedir(), 'Library', 'Caches', 'ms-playwright');
  if (!existsSync(cache)) return undefined;
  for (const dir of readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
    const app = join(cache, dir, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
    if (existsSync(app)) return app;
  }
  return undefined;
}


export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  use: { baseURL: 'http://localhost:5181', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, launchOptions: { executablePath: process.env.PW_USE_BUNDLED ? undefined : fallbackChromium() } },
  webServer: { command: 'npm run build && npm run preview', url: 'http://localhost:5181', reuseExistingServer: true, timeout: 180_000 },
  reporter: [['list']],
});
