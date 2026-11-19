import { mkdirSync } from 'node:fs';
import { test } from '@playwright/test';
import { GALLERY_ROUTES } from './routes';

// 1440×900 screenshots of every gallery route, written to ./screenshots. Index, Foundations and Components are captured full page.
mkdirSync('screenshots', { recursive: true });
for (const route of GALLERY_ROUTES) {
  test(`screenshot: ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${route}?freeze`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const name = route === '/' ? 'index' : route.slice(1).replace(/\//g, '-');
    const full = ['/', '/foundations', '/components'].includes(route);
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: full });
  });
}
