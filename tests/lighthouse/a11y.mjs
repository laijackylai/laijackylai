import fs from 'node:fs/promises';
import path from 'node:path';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? 'http://127.0.0.1:3000';
const routes = (process.env.LIGHTHOUSE_ROUTES ?? '/,/projects,/photography,/gis,/music').split(',');
const minAccessibilityScore = Number(process.env.LIGHTHOUSE_A11Y_MIN ?? 90);
const outputDir = path.join(process.cwd(), 'test-results', 'lighthouse');

await fs.mkdir(outputDir, { recursive: true });

const chrome = await launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

const failures = [];

try {
  for (const route of routes) {
    const url = new URL(route, baseUrl).toString();
    const result = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['accessibility'],
      output: ['json'],
      logLevel: 'error',
    });

    if (!result?.lhr) {
      failures.push(`${route}: Lighthouse did not return a report`);
      continue;
    }

    const score = Math.round((result.lhr.categories.accessibility.score ?? 0) * 100);
    const fileSafeRoute = route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-/, '');
    await fs.writeFile(
      path.join(outputDir, `${fileSafeRoute}.json`),
      JSON.stringify(result.lhr, null, 2),
    );

    console.log(`${route}: accessibility ${score}`);

    if (score < minAccessibilityScore) {
      failures.push(`${route}: accessibility ${score} < ${minAccessibilityScore}`);
    }
  }
} finally {
  await chrome.kill();
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
