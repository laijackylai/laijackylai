import { expect, test } from './fixtures';
import { ready, watchRuntimeIssues } from './helpers';

const navLinks = [
  { name: 'Projects', path: '/projects' },
  { name: 'Photography', path: '/photography' },
  { name: 'Music', path: '/music' },
  { name: 'GIS', path: '/gis' },
];
const isMobile = (name: string) => name.includes('mobile');

test.describe('golden paths', () => {
  test('loads the landing page and navigates to every page from the nav', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.name), 'Mobile navigation is covered by the menu sheet test.');
    test.slow(); // five page loads against a local prod server
    const runtime = watchRuntimeIssues(page);

    await page.goto('/');
    await ready(page);
    await expect(page).toHaveTitle('HKLai');
    await expect(page.getByRole('heading', { name: 'My Journey' })).toBeVisible();
    await expect(page.getByText('@ eBay')).toBeVisible();

    for (const link of navLinks) {
      await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: link.name }).click();
      await expect(page).toHaveURL(new RegExp(`${link.path}$`));
      // toContainText: the title glitch briefly adds aria-hidden shard copies of the word
      await expect(page.getByRole('heading', { level: 1 })).toContainText(link.name);
      await ready(page);
    }

    runtime.assertClean(testInfo);
  });

  test('keyboard shortcuts switch page and theme', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.name), 'Keyboard shortcuts are a desktop feature.');
    const runtime = watchRuntimeIssues(page);
    await page.goto('/');
    await ready(page);

    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.keyboard.press('t');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).not.toBe(theme);
    await page.keyboard.press('2');
    await expect(page).toHaveURL(/\/projects$/);
    await ready(page);
    await page.keyboard.press('?');
    await expect(page.getByRole('dialog', { name: 'Keys' })).toBeVisible();

    runtime.assertClean(testInfo);
  });

  test('photography filters and viewer work', async ({ page }, testInfo) => {
    const runtime = watchRuntimeIssues(page);
    await page.goto('/photography');
    await ready(page);

    const frames = page.locator('li.photo');
    const total = await frames.count();
    test.skip(total === 0, 'No photo data in this build.');
    await page.getByRole('group', { name: 'Filter photos by format' }).getByRole('button', { name: /^film/i }).click();
    await expect.poll(() => frames.count()).toBeLessThanOrEqual(total);

    // mandatory snap scrolling re-snaps under Playwright's scroll-then-click (a real tap lands where it sees);
    // this test is about filters and the viewer, so turn snapping off for it
    await page.addStyleTag({ content: 'html.snap-page { scroll-snap-type: none !important; scroll-behavior: auto !important; }' });
    await frames.first().getByRole('button').click();
    const viewer = page.locator('dialog.lightbox');
    await expect(viewer).toBeVisible();
    await viewer.getByRole('button', { name: 'Next photo' }).click();
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();

    runtime.assertClean(testInfo);
  });

  test('projects page lists the report and snap panels', async ({ page }, testInfo) => {
    const runtime = watchRuntimeIssues(page);
    await page.goto('/projects');
    await ready(page);

    await expect(page.locator('section.proj')).toHaveCount(8);
    await expect(page.locator('section.proj h2').first()).toHaveText('rbrmesh');
    await expect(page.getByRole('link', { name: /technical report/i })).toHaveAttribute('href', '/docs/FYP-Final-Report.pdf');
    const pdf = await page.request.get('/docs/FYP-Final-Report.pdf');
    expect(pdf.ok()).toBe(true);

    runtime.assertClean(testInfo);
  });

  test('GIS page scrolls between map panels', async ({ page }, testInfo) => {
    const runtime = watchRuntimeIssues(page);
    await page.goto('/gis');
    await ready(page);

    await expect(page.locator('html')).toHaveClass(/snap-page/);
    await page.locator('#g2').scrollIntoViewIfNeeded();
    await expect(page.getByAltText(/cycling routes/i)).toBeVisible();

    runtime.assertClean(testInfo);
  });

  test('mobile viewport opens and closes the menu sheet', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo.project.name), 'Menu sheet is mobile only.');
    const runtime = watchRuntimeIssues(page);
    await page.goto('/');
    await ready(page);

    const sheet = page.locator('#sheet');
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await expect(sheet).toHaveClass(/open/);
    await expect(sheet.getByRole('link', { name: /Photography/ })).toBeVisible();
    await page.getByRole('button', { name: 'Close navigation menu' }).click();
    await expect(sheet).not.toHaveClass(/open/);

    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await sheet.getByRole('link', { name: /Music/ }).click();
    await expect(page).toHaveURL(/\/music$/);

    runtime.assertClean(testInfo);
  });

  test('no page scrolls sideways on a phone', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo.project.name), 'Phone widths only.');
    test.slow();
    for (const path of ['/', ...navLinks.map((l) => l.path)]) {
      await page.goto(path);
      await ready(page);
      const [scrollW, clientW] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(scrollW, path).toBeLessThanOrEqual(clientW);
    }
  });
});
