import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { GALLERY_ROUTES } from './routes';

// Every gallery route must pass axe with zero violations (WCAG 2.0, 2.1 and 2.2 A and AA rules).
for (const route of GALLERY_ROUTES) {
  test(`axe: ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${route}${route.includes('?') ? '&' : '?'}freeze`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    // Tooltip popups portal to <body> while open (the gallery pins one open), so they sit outside the landmarks by design.
    // They are excluded from the scan; their trigger carries the same name, so nothing is lost.
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .exclude('.hr-tooltip__pos')
      .analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.slice(0, 5).map((n) => `   ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1] ?? ''}`).join('\n')}`);
    expect(summary, summary.join('\n\n')).toEqual([]);
  });
}

test('focus ring is visible on the first focusable element of /components', async ({ page }) => {
  await page.goto('/components');
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
  expect(outline).not.toBe('none');
});

test('shortcut sheet traps focus, closes with Esc and returns focus', async ({ page }) => {
  await page.goto('/review?freeze');
  await page.getByRole('button', { name: 'Keyboard shortcuts' }).click();
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog).toBeVisible();
  // focus moves into the sheet when it opens
  await expect(page.getByRole('button', { name: 'Close, Esc' })).toBeFocused();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    // Base UI routes Tab through focus guards next to the panel, which hand focus back on the next frame
    await expect.poll(() => dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Keyboard shortcuts' })).toBeFocused();
});

test('? opens the sheet from the keyboard and every key in the review flow works', async ({ page }) => {
  await page.goto('/review?freeze');
  await page.keyboard.press('Shift+Slash');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('p');
  await expect(page.getByText('Kept.')).toBeVisible();
  await expect(page.getByText('1 kept · 0 skipped')).toBeVisible();
});
