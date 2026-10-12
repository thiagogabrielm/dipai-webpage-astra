import { test, expect } from '@playwright/test';
import news from '../../src/data/news.json' with { type: 'json' };
import cases from '../../src/data/use-cases.json' with { type: 'json' };
const routes = [
  '/',
  '/products/',
  '/use-cases/',
  '/news/',
  '/contact/',
  '/faq/',
  '/team/',
  '/about-us/',
  '/book-demo/',
  '/privacy-policy/',
  ...news.map((p) => `/news/${p.slug}/`),
  ...cases.map((c) => `/use-cases/${c.slug}/`),
];
test('every page loads without missing media, overflow, or script errors', async ({ page }) => {
  test.setTimeout(120000);
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('127.0.0.1'))
      failures.push(`${response.status()} ${response.url()}`);
  });
  for (const route of routes) {
    const response = await page.goto(route + '?theme=dark');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.site-footer')).toHaveCount(1);
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await expect(page.locator('.footer-network')).toBeAttached();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      route + ' overflow',
    ).toBeTruthy();
    expect(
      await page.evaluate(() =>
        [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      ),
      route + ' broken images',
    ).toEqual([]);
  }
  expect(failures).toEqual([]);
});
test('archive filters retain the full-width CTA separator', async ({ page }) => {
  for (const [route, filter, card, section] of [
    ['/use-cases/', '[data-use-filter]', '[data-use-case]', '.use-case-library'],
    ['/news/', '[data-news-filter]', '[data-news-item]', '.news-archive'],
  ]) {
    await page.goto(route + '?theme=dark');
    const buttons = page.locator(filter);
    await expect(buttons.first()).toBeVisible();
    for (let i = 0; i < (await buttons.count()); i++) {
      await buttons.nth(i).click();
      await expect(buttons.nth(i)).toHaveAttribute('aria-pressed', 'true');
      expect(await page.locator(card + ':visible').count()).toBeGreaterThan(0);
      const divider = await page.locator(section).evaluate((e) => {
        const s = getComputedStyle(e, '::after');
        return {
          width: parseFloat(s.width),
          border: parseFloat(s.borderTopWidth) || parseFloat(s.borderBottomWidth),
          z: s.zIndex,
        };
      });
      expect(divider.width).toBeGreaterThanOrEqual((page.viewportSize()?.width || 0) - 20);
      expect(divider.border).toBeGreaterThan(0);
      expect(Number(divider.z)).toBeGreaterThan(0);
    }
  }
});
test('hero, product tabs and continent controls work', async ({ page }) => {
  await page.goto('/?theme=dark');
  for (const [id, value] of [
    ['offshore', '40%'],
    ['cruise', '7%'],
    ['wellboat', '78%'],
    ['bulk', '4%'],
  ]) {
    await page.locator('#vessel-tab-' + id).click();
    await expect(page.locator('#vessel-' + id)).toBeVisible();
    await expect(page.locator('#vessel-' + id + ' .vessel-kpi-value')).toHaveText(value);
    await expect
      .poll(() => page.locator('.hero-background').last().getAttribute('src'))
      .toContain(id === 'offshore' ? 'offshore' : id);
  }
  for (let i = 0; i < 4; i++) {
    await page.locator(`[data-product="${i}"]`).click();
    await expect(page.locator(`[data-product="${i}"]`)).toHaveAttribute('aria-selected', 'true');
  }
  await page.locator('#fleet').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() =>
        performance.getEntriesByType('resource').some((r) => r.name.includes('land.geojson')),
      ),
    )
    .toBeTruthy();
  const regions = page.locator('.region-buttons button');
  for (let i = 0; i < (await regions.count()); i++) {
    await regions.nth(i).click();
    await expect(regions.nth(i)).toHaveAttribute('aria-pressed', 'true');
  }
});
test('client links, theme switching and legacy URLs remain available', async ({ page }) => {
  await page.goto('/navy-variant.html?theme=dark');
  await expect(page).toHaveURL(/\/?\?theme=dark$/);
  await expect(page.locator('.logo-set').first().locator('a')).toHaveCount(8);
  await page.goto('/book-demo.html?theme=dark');
  await expect(page).toHaveURL('/book-demo/?theme=dark');
  await expect(page.locator('.demo-client-grid a.client-link')).toHaveCount(9);
  await page.locator('[data-theme-choice="light"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.footer-brand img')).toHaveAttribute('src', '/assets/dipai-logo.svg');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('forms show success only after a successful mocked response', async ({ page }) => {
  for (const kind of ['contact', 'demo']) {
    await page.goto(kind === 'demo' ? '/book-demo/' : '/contact/');
    const form = page.locator(`#${kind}-form`);
    await form.locator('[name="name"]').fill('Test Person');
    await form.locator('[name="email"]').fill('test@example.com');
    if (kind === 'demo') await form.locator('[name="company"]').fill('Test Fleet');
    const message = 'Automated verification: fuel & maintenance.\nNo email is sent.';
    await form.locator('[name="message"]').fill(message);
    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('name', kind);
    await expect(form).toHaveAttribute('netlify-honeypot', 'website');
    let responseStatus = 503;
    const payloads: URLSearchParams[] = [];
    const endpoint = new URL('/', page.url()).href;
    await page.route(endpoint, (route) => {
      const request = route.request();
      if (request.method() !== 'POST') return route.continue();
      expect(request.headers()['content-type']).toBe('application/x-www-form-urlencoded');
      payloads.push(new URLSearchParams(request.postData() || ''));
      return route.fulfill({
        status: responseStatus,
        contentType: 'text/html',
        body: '<p>Mock response</p>',
      });
    });
    await form.locator('[type="submit"]').click();
    await expect(form.locator('[data-form-status]')).toBeVisible();
    await expect(form.locator('[name="message"]')).toHaveValue(message);
    await expect(form.locator('[type="submit"]')).toBeEnabled();
    await expect(page.locator(`#${kind}-result`)).toBeHidden();
    responseStatus = 200;
    await form.locator('[type="submit"]').click();
    await expect(page.locator(`#${kind}-result`)).toBeVisible();
    await expect(page.locator(`#${kind}-result h2`)).toBeFocused();
    expect(payloads).toHaveLength(2);
    for (const payload of payloads) {
      expect(payload.get('form-name')).toBe(kind);
      expect(payload.get('email')).toBe('test@example.com');
      expect(payload.get('message')).toBe(message);
      expect(payload.get('website')).toBe('');
      if (kind === 'demo') expect(payload.get('company')).toBe('Test Fleet');
    }
    await page.unroute(endpoint);
  }
});

test('forms support native submission without JavaScript', async ({
  browser,
  baseURL,
  viewport,
  isMobile,
  hasTouch,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport,
    isMobile,
    hasTouch,
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    for (const kind of ['contact', 'demo']) {
      const path = kind === 'demo' ? '/book-demo/' : '/contact/';
      let submitted: URLSearchParams | undefined;
      await page.route(new URL(path, baseURL).href, (route) => {
        if (route.request().method() !== 'POST') return route.continue();
        submitted = new URLSearchParams(route.request().postData() || '');
        return route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<h1>Submission received</h1>',
        });
      });
      await page.goto(path);
      const form = page.locator(`#${kind}-form`);
      await form.locator('[name="name"]').fill('Test Person');
      await form.locator('[name="email"]').fill('test@example.com');
      await form.locator('[name="message"]').fill('Native submission without sending email.');
      if (kind === 'demo') await form.locator('[name="company"]').fill('Test Fleet');
      await form.locator('[type="submit"]').click();
      await expect(page.getByRole('heading', { name: 'Submission received' })).toBeVisible();
      expect(submitted?.get('form-name')).toBe(kind);
      expect(submitted?.get('email')).toBe('test@example.com');
      expect(submitted?.get('website')).toBe('');
    }
  } finally {
    await context.close();
  }
});

test('local preview refuses real form submissions instead of reporting success', async ({
  page,
}) => {
  await page.goto('/contact/');
  const form = page.locator('#contact-form');
  await form.locator('[name="name"]').fill('Local Test');
  await form.locator('[name="email"]').fill('test@example.com');
  await form.locator('[name="message"]').fill('This stays on the local preview server.');
  await form.locator('[type="submit"]').click();
  await expect(form.locator('[data-form-status]')).toContainText('not enabled');
  await expect(page.locator('#contact-result')).toBeHidden();
  await expect(form.locator('[name="message"]')).toHaveValue(
    'This stays on the local preview server.',
  );
});

test('testimonials, FAQ links and product module navigation remain usable', async ({ page }) => {
  await page.goto('/?theme=dark');
  await page.locator('#testimonials-focus').scrollIntoViewIfNeeded();
  const current = await page
    .locator('.focus-quote-card.is-current')
    .getAttribute('data-quote-index');
  await page.locator('[data-quote-next]').click();
  await expect(page.locator('.focus-quote-card.is-current')).not.toHaveAttribute(
    'data-quote-index',
    current!,
  );
  await page.goto('/faq/#faq-ownership');
  await expect(page.locator('#faq-ownership')).toHaveAttribute('open', '');
  await page.goto('/products/?theme=light');
  if ((page.viewportSize()?.width || 0) <= 900) {
    await page.locator('#module-vesselgpt').scrollIntoViewIfNeeded();
  } else {
    await page.locator('a.module-nav-link[href="#module-vesselgpt"]').click();
  }
  await expect(page.locator('#module-vesselgpt')).toBeInViewport();
  await expect(page.locator('#module-vesselgpt img')).toBeVisible();
});

test('globe transitions render intermediate frames while the footer mesh stays still', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?theme=dark');
  await page.locator('#fleet').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() =>
        performance.getEntriesByType('resource').some((r) => r.name.includes('land.geojson')),
      ),
    )
    .toBeTruthy();
  const canvas = page.locator('#fleet-globe');
  await page.waitForTimeout(200);
  const start = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.locator('[data-region="oceania"]').click();
  await page.waitForTimeout(180);
  const middle = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.waitForTimeout(1400);
  const end = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  expect(start).not.toEqual(middle);
  expect(middle).not.toEqual(end);
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  const mesh = page.locator('.footer-network');
  await page.waitForTimeout(200);
  const fixed = await mesh.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.waitForTimeout(300);
  expect(await mesh.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toEqual(fixed);
});
