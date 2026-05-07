import { expect, test } from '@playwright/test';
import path from 'node:path';
import { watchRuntimeIssues } from './helpers';

const routes = ['/', '/projects', '/photography', '/gis', '/music'];
const axePath = require.resolve('axe-core/axe.min.js');

test.describe('accessibility smoke checks', () => {
  for (const route of routes) {
    test(`has no serious axe violations on ${route}`, async ({ page }, testInfo) => {
      const runtime = watchRuntimeIssues(page);

      await page.goto(route);
      await page.addScriptTag({ path: path.resolve(axePath) });

      const results = await page.evaluate(async () => {
        return window.axe.run(document, {
          resultTypes: ['violations'],
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa'],
          },
        });
      });

      const seriousViolations = results.violations.filter((violation) => (
        ['serious', 'critical'].includes(violation.impact ?? '')
      ));

      expect(seriousViolations).toEqual([]);
      runtime.assertClean(testInfo);
    });
  }
});

declare global {
  interface Window {
    axe: typeof import('axe-core');
  }
}
