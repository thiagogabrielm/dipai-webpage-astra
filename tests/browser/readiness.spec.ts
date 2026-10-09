import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import news from '../../src/data/news.json' with { type: 'json' };
import cases from '../../src/data/use-cases.json' with { type: 'json' };

const routes = [
  '/',
  '/products/',
  '/news/',
  '/use-cases/',
  '/team/',
  '/contact/',
  '/faq/',
  '/book-demo/',
  '/privacy-policy/',
  '/404.html',
  ...news.map((p) => `/news/${p.slug}/`),
  ...cases.map((p) => `/use-cases/${p.slug}/`),
];
for (const theme of ['dark', 'light']) {
  test(`all pages pass automated accessibility checks in ${theme} mode`, async ({ page }) => {
    test.setTimeout(240000);
    for (const route of routes) {
      await page.goto(route + '?theme=' + theme);
      await page.evaluate(() => document.fonts.ready);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      expect(
        result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        route,
      ).toEqual([]);
    }
  });
}

test('cookie settings are keyboard accessible, removable and load no trackers', async ({
  page,
  context,
}) => {
  const external: string[] = [];
  page.on('request', (req) => {
    if (!req.url().startsWith('http://127.0.0.1:48768/') && !req.url().startsWith('data:'))
      external.push(req.url());
  });
  // A light device preference must not override the dark default.
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  const button = page.locator('.site-footer [data-cookie-settings]');
  await page.locator('[data-theme-choice="light"]').click();
  await button.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Cookie settings' });
  await expect(dialog).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect(dialog.locator('[role="status"]')).toContainText('light mode');
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBeTruthy();
  await dialog.getByRole('button', { name: 'Use default theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('dipai-color-theme'))).toBeNull();
  await expect(dialog.locator('[role="status"]')).toContainText('No colour preference');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(external).toEqual([]);
});

test('navigation and FAQ are usable by keyboard', async ({ page }) => {
  await page.goto('/faq/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  if ((page.viewportSize()?.width || 0) < 901) {
    await page.locator('.mobile-menu').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.mobile-menu')).toHaveAttribute('aria-expanded', 'true');
  }
  const company = page.locator('.nav-dropdown summary');
  await company.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.nav-dropdown')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(company).toBeFocused();
  const question = page.locator('#faq-ownership summary');
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#faq-ownership')).toHaveAttribute('open', '');
});

test('moving content has pause controls and smaller screens get smaller photos', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?theme=dark');
  await page.locator('[data-ribbon-pause]').click();
  await expect(page.locator('.logo-track')).toHaveCSS('animation-play-state', 'paused');
  const pause = page.locator('[data-quote-pause]');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  const selected = await page.locator('#testimonials-focus').getAttribute('data-quote-selected');
  await page.locator('#focus-quotes-heading').click();
  await page.waitForTimeout(5300);
  await expect(page.locator('#testimonials-focus')).toHaveAttribute(
    'data-quote-selected',
    selected!,
  );
  await page.goto('/team/');
  const photo = page.locator('.team-person-photo img').first();
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toHaveAttribute('srcset', /300w/);
  await expect(photo).toHaveAttribute('sizes', /90vw/);
  expect(
    await photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
  ).toBeTruthy();
});
