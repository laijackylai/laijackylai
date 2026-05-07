import { expect, Page, TestInfo } from '@playwright/test';

type RuntimeIssue = {
  type: string;
  message: string;
};

export function watchRuntimeIssues(page: Page) {
  const issues: RuntimeIssue[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.push({
        type: 'console',
        message: message.text(),
      });
    }
  });

  page.on('pageerror', (error) => {
    issues.push({
      type: 'pageerror',
      message: error.message,
    });
  });

  page.on('response', (response) => {
    if (response.status() !== 404) {
      return;
    }

    const request = response.request();
    if (['image', 'font'].includes(request.resourceType())) {
      issues.push({
        type: '404',
        message: `${request.resourceType()} ${response.url()}`,
      });
    }
  });

  return {
    assertClean(testInfo: TestInfo) {
      expect(issues, testInfo.title).toEqual([]);
    },
  };
}
