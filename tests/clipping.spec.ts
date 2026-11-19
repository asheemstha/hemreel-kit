import { expect, test } from '@playwright/test';
import { GALLERY_ROUTES } from './routes';

// Fails when visible text is cut off: a box that hides overflow (or ends in an ellipsis) holding more text than it shows,
// or an input whose text line is taller than its box. Scroll containers and screen-reader-only text are skipped.
for (const route of GALLERY_ROUTES) {
  test(`no clipped text: ${route}`, async ({ page }) => {
    await page.goto(`${route}?freeze`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    const clipped = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        if (el.closest('.hr-sr-only') || el.closest('[hidden]')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (el instanceof HTMLInputElement && (el.clientWidth <= 1 || el.type === 'radio' || el.type === 'checkbox' || el.type === 'file')) continue;
        const own = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent ?? '').join('').trim();
        if (!own) continue;
        const hidesX = cs.textOverflow === 'ellipsis' || ['hidden', 'clip'].includes(cs.overflowX);
        const hidesY = ['hidden', 'clip'].includes(cs.overflowY) && cs.webkitLineClamp === 'none';
        if ((hidesX && el.scrollWidth > el.clientWidth + 1) || (hidesY && el.scrollHeight > el.clientHeight + 1)) out.push(`"${own.slice(0, 40)}" (${el.className})`);
      }
      return out;
    });
    expect(clipped, clipped.join('\n')).toEqual([]);
  });
}
