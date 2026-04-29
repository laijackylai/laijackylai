import { expect, test } from '@playwright/test';
import { watchRuntimeIssues } from './helpers';

const navLinks = [
  { name: 'Projects', path: '/projects' },
  { name: 'Music', path: '/music' },
  { name: 'GIS', path: '/gis' },
  { name: 'Photography', path: '/photography' },
];

test.describe('golden paths', () => {
  test('loads the landing page and each navigation target without runtime issues', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Mobile navigation behavior is covered by the hamburger drawer test.');
    const runtime = watchRuntimeIssues(page);

    await page.goto('/');
    await expect(page).toHaveTitle('HKLai');
    await expect(page.getByText('My Journey')).toBeVisible();
    await expect(page.getByText('DATA GEN ENGINEER @ GIESECKE+DEVRIENT')).toBeVisible();

    for (const link of navLinks) {
      const navLink = page.locator(`a[href="${link.path}"]`).filter({ hasText: link.name }).first();
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveAttribute('href', link.path);
    }

    for (const link of navLinks) {
      await page.goto(link.path);
      await expect(page).toHaveURL(new RegExp(`${link.path}$`));
    }

    runtime.assertClean(testInfo);
  });

  test('photography page loads without crashing when server data is empty', async ({ page }, testInfo) => {
    const runtime = watchRuntimeIssues(page);
    await page.goto('/photography');

    if (testInfo.project.name.includes('mobile')) {
      await page.getByRole('button', { name: 'Open navigation menu' }).click({ force: true });
    }
    await expect(page.getByRole('link', { name: 'Photography' })).toBeVisible();

    runtime.assertClean(testInfo);
  });

  test('projects PDF download opens the public report URL', async ({ page }, testInfo) => {
    const runtime = watchRuntimeIssues(page);
    await page.goto('/projects');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: /download/i }).click();
    const popup = await popupPromise;

    await expect(popup).toHaveURL(/\/docs\/FYP-Final-Report\.pdf$/);
    await popup.close();
    runtime.assertClean(testInfo);
  });

  test('GIS page exposes the snap-scrolling image panels', async ({ page }, testInfo) => {
    const runtime = watchRuntimeIssues(page);
    await page.goto('/gis');

    await expect(page.getByAltText('torontoShootingRates2022')).toBeVisible();
    await expect(page.getByAltText('CycleRoutes')).toBeVisible();
    await expect(page.locator('.snap-y.snap-mandatory')).toBeVisible();
    await page.mouse.wheel(0, 800);
    await expect(page.getByAltText('CycleRoutes')).toBeVisible();

    runtime.assertClean(testInfo);
  });

  test('desktop viewport shows the horizontal drawer links', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Desktop drawer is covered in the desktop project.');
    const runtime = watchRuntimeIssues(page);
    await page.goto('/');

    for (const link of navLinks) {
      await expect(page.getByRole('link', { name: link.name })).toBeVisible();
    }

    runtime.assertClean(testInfo);
  });

  test('mobile viewport opens and closes the hamburger drawer', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('desktop'), 'Mobile drawer is covered in the mobile project.');
    const runtime = watchRuntimeIssues(page);
    await page.goto('/');

    const drawer = page.locator('.transform.transition-transform.fixed.top-0.left-0.bottom-0.z-20.w-screen');

    await expect(drawer).toHaveClass(/-translate-x-full/);
    await page.getByRole('button', { name: 'Open navigation menu' }).click({ force: true });
    await expect(drawer).toHaveClass(/translate-x-0/);
    await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Photography' })).toBeVisible();
    await page.getByRole('button', { name: 'Close navigation menu' }).click();
    await expect(drawer).toHaveClass(/-translate-x-full/);

    runtime.assertClean(testInfo);
  });
});
