import { test as base } from '@playwright/test';

// Stub Microsoft Clarity: in headless Chrome it burns ~2s of main thread per 3s (headed Chrome: ~0),
// which delays hydration and flakes clicks; it would also record test sessions as real visits.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/clarity\.ms/, (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await use(page);
  },
});
export { expect } from '@playwright/test';
