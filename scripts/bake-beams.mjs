// Bakes the theme-switch headlight beams (lib/site.js) to WebP images in public/fx.
// Rasterising these blurred SVGs in the browser cost ~1s of main thread per page load, so it happens here once.
// Run after changing the light model: node scripts/bake-beams.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

// Light model (top-down, viewBox 400×200, lamps on the right edge pointing left):
// radial falloff from each lamp with a hot spot just ahead of it; a crisp core cone plus a wide, heavily
// blurred penumbra so edges soften with distance; long headlight throw, short wide fog fans; ground spill.
const svgUrl = (defs, body) => 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200" preserveAspectRatio="none"><defs>' + defs +
  '<filter id="n" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>' +
  '<filter id="w" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="15"/></filter>' +
  '<filter id="s" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22"/></filter>' +
  '</defs>' + body + '</svg>');
const rg = (id, cx, cy, r, stops) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}" fx="${cx}" fy="${cy}">` +
  stops.map(([o, a, c]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') + '</radialGradient>';
const HEAD_Y = [70, 130], FOG_Y = [38, 162]; // fog at screen ~10% / 90% (beam box spans -15%..115%)
const HEAD_STOPS = c => [[0, .8, c], [.05, 1, c], [.28, .82, c], [.55, .45, c], [.8, .15, c], [1, 0, c]];
const FOG_STOPS = (c, e) => [[0, .9, c], [.07, 1, c], [.35, .65, c], [.7, .22, e], [1, 0, e]];
const cone = (x0, y0, x1, half) => `M${x0} ${y0} L${x1} ${y0 - half} L${x1} ${y0 + half}Z`;
const headLayer = HEAD_Y.map((y, i) =>
  `<path filter="url(#w)" opacity=".38" fill="url(#hd${i})" d="${cone(394, y, 0, 66)}"/>` +   // penumbra
  `<path filter="url(#n)" fill="url(#hd${i})" d="${cone(394, y, 0, 38)}"/>`).join('');          // core
const fogLayer = FOG_Y.map((y, i) =>
  `<path filter="url(#w)" opacity=".5" fill="url(#fg${i})" d="${cone(390, y, 190, 78)}"/>` +
  `<path filter="url(#n)" fill="url(#fg${i})" d="${cone(390, y, 200, 50)}"/>`).join('');
const spill = '<ellipse filter="url(#s)" fill="url(#sp)" cx="396" cy="100" rx="70" ry="100"/>';
const SVGS = {
  beams: svgUrl(
    HEAD_Y.map((y, i) => rg(`hd${i}`, 394, y, 400, HEAD_STOPS('#fff'))).join('') +
    FOG_Y.map((y, i) => rg(`fg${i}`, 390, y, 200, FOG_STOPS('#fff', '#fff'))).join('') +
    rg('sp', 396, 100, 100, [[0, .6, '#fff'], [1, 0, '#fff']]),
    spill + headLayer + fogLayer),
  fog: svgUrl(FOG_Y.map((y, i) => rg(`fg${i}`, 390, y, 200, FOG_STOPS('#FFAA14', '#FFD27A'))).join(''), fogLayer),
};

const browser = await chromium.launch({ channel: 'chrome' }); // system Chrome: no Playwright browser download needed
const page = await browser.newPage();
mkdirSync('public/fx', { recursive: true });
for (const [name, src] of Object.entries(SVGS)) {
  const png = await page.evaluate(src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 512;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/png').split(',')[1]);
    };
    img.onerror = reject;
    img.src = src;
  }), src);
  await sharp(Buffer.from(png, 'base64')).webp({ quality: 90, alphaQuality: 90 }).toFile(`public/fx/${name}.webp`); // q90: no banding in the soft edges
}
await browser.close();
