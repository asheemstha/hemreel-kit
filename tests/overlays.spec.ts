import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// The overlays are closed when the page-wide axe scan runs, so each one is opened here and scanned on its own.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function scan(page: Page, selector: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).include(selector).analyze();
  return results.violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.slice(0, 4).map((n) => `   ${n.target.join(' ')}`).join('\n')}`);
}

async function gallery(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components?freeze');
  await page.waitForLoadState('networkidle');
}

const OPEN: Array<{ name: string; section: string; button: string; role: 'dialog' | 'alertdialog' }> = [
  { name: 'dialog', section: '#dialog', button: 'Edit clip', role: 'dialog' },
  { name: 'confirm dialog', section: '#confirm-dialog', button: 'Delete project', role: 'alertdialog' },
  { name: 'drawer', section: '#drawer', button: 'Show run log', role: 'dialog' },
  { name: 'command palette', section: '#command-palette', button: 'Open command palette', role: 'dialog' },
];

for (const o of OPEN) {
  test(`axe with the ${o.name} open`, async ({ page }) => {
    await gallery(page);
    await page.locator(o.section).getByRole('button', { name: o.button }).click();
    const panel = page.getByRole(o.role);
    await expect(panel).toBeVisible();
    const found = await scan(page, `[role="${o.role}"]`);
    expect(found, found.join('\n\n')).toEqual([]);
  });
}

test('axe with a popover, a calendar and a searchable select open', async ({ page }) => {
  await gallery(page);
  await page.locator('#popover').getByRole('button', { name: /Filter clips/ }).click();
  await expect(page.locator('.hr-popover')).toBeVisible();
  let found = await scan(page, '.hr-popover');
  expect(found, found.join('\n\n')).toEqual([]);
  await page.keyboard.press('Escape');

  await page.locator('#date-picker').getByRole('button', { name: /20 Nov 2026/ }).first().click();
  await expect(page.locator('.hr-popover')).toBeVisible();
  found = await scan(page, '.hr-popover');
  expect(found, found.join('\n\n')).toEqual([]);
  await page.keyboard.press('Escape');

  await page.locator('#select').getByRole('combobox', { name: /Project/ }).click();
  await expect(page.getByRole('combobox', { name: 'Search project' })).toBeVisible();
  found = await scan(page, '.hr-popup');
  expect(found, found.join('\n\n')).toEqual([]);
});

test('dialog keeps focus inside, closes with Esc and gives focus back', async ({ page }) => {
  await gallery(page);
  const trigger = page.locator('#dialog').getByRole('button', { name: 'Edit clip' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Edit clip' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    await expect.poll(() => dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('confirm dialog starts on Cancel and a click outside does not close it', async ({ page }) => {
  await gallery(page);
  await page.locator('#confirm-dialog').getByRole('button', { name: 'Delete project' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.mouse.click(8, 8);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('⌘K opens the palette on a screen, typing filters, Enter goes there', async ({ page }) => {
  await page.goto('/home?freeze');
  await page.waitForLoadState('networkidle');
  await page.keyboard.press('ControlOrMeta+k');
  const palette = page.getByRole('dialog', { name: 'Command palette' });
  await expect(palette).toBeVisible();
  await page.keyboard.type('sett');
  await expect(palette.getByRole('option')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(palette).toBeHidden();
  await expect(page).toHaveURL(/\/settings/);
});

test('a non-modal drawer leaves the page usable', async ({ page }) => {
  await gallery(page);
  await page.locator('#drawer').getByRole('button', { name: 'Show clip details' }).click();
  await expect(page.locator('[data-nonmodal]')).toBeVisible();
  // the rest of the page is still reachable: another control can be clicked while the panel is open
  await page.locator('#drawer').getByRole('button', { name: 'Show clip details' }).click();
  await expect(page.locator('[data-nonmodal]')).toBeHidden();
});
