# Test Plan — laijackylai

Goal: find all bugs, restore working baseline, before adding new features.

## Implementation Status

Last updated: 2026-04-29

Completed:
- Fixed stale Jest tests for the current drawer and landing page.
- Added component tests for `HorizontalDrawer` and `RevealOnScroll`.
- Added API tests for `pages/api/blur.tsx`.
- Fixed `pages/api/blur.tsx` async race, callback nesting, aspect ratio consistency, sharp error handling, `.DS_Store` skipping, and optional `BLUR_API_TOKEN` auth.
- Fixed the FYP PDF URL to `/docs/FYP-Final-Report.pdf`.
- Replaced the dead dynamic Tailwind width class in `HorizontalDrawer` with an inline width style.
- Stabilized photography image sizing so dimensions are not randomized on every render.
- Added missing `rel="noopener noreferrer"` to known external links.
- Removed deprecated `images.domains` from `next.config.js`.
- Fixed the lint configuration so TypeScript files parse correctly and generated Amplify UI files are ignored.
- Fixed `ResponsiveDrawer` desktop/mobile initialization so the initial `0` width does not force mobile sizing on desktop.
- Fixed the landing page scroll handler so repeated scroll events share one pending animation frame.
- Added remaining unit/jsdom coverage for `ResponsiveDrawer`, static components, landing links, photography, projects, GIS, music, `_app`, and `api/hello`.
- Ignored `.next/` in Jest module resolution so standalone build output does not collide with the root package during test runs.
- Added Playwright golden-path tests for the production server path across desktop and mobile Chrome.
- Added axe accessibility smoke checks and Lighthouse accessibility score gating across `/`, `/projects`, `/photography`, `/gis`, and `/music`.
- Added accessible names for icon-only nav, scroll, overlay, and project links, plus a custom `_document` with `lang="en"`.
- Verified `yarn test --runInBand`, `yarn lint`, `yarn build`, `npx tsc --noEmit`, `yarn test:e2e`, and `yarn test:lighthouse`.

Remaining:
- Smoke-test Amplify deploy.

## Pre-flight (fix before testing)

- [x] `tests/Drawer.test.tsx` stale. Asserts links "Work"/"Tech" — drawer now has Projects/Photography/Music/GIS. Fixed to assert current nav text and hrefs.
- [x] `tests/App.test.tsx` checks `getByTestId('drawer-component')`. Fixed to test `HorizontalDrawer` links, journey items, and scroll arrows.
- [x] Run `yarn lint` + `yarn test` first. Current verified commands: `yarn lint`, `yarn test --runInBand`.
- [x] Run `yarn build` — production build compiles clean and `.next/standalone` is produced.

## 1. Unit / Component Tests

### `components/drawer.tsx` (ResponsiveDrawer)
- [x] renders logo
- [x] renders 5 anchors (logo + 4 nav)
- [x] nav text matches: Projects, Photography, Music, GIS
- [x] href values point to `/projects`, `/photography`, `/music`, `/gis`
- [x] mounts + unmounts cleanly (resize + scroll listeners removed)
- [x] mobile branch: window<720 sets compact logo sizing and mobile gap
- [x] scroll past threshold clamps `imgWidth=minImgSize`

### `components/horizontalDrawer.tsx`
- [x] desktop branch (width≥768) renders 5 links
- [x] mobile branch renders hamburger + overlay
- [x] `toggleDrawer` flips `drawerOpen`
- [x] overlay click closes drawer
- [x] **BUG suspect**: `lg:w-[${width}rem]` — fixed by using `style={{ width: `${width}rem` }}`.

### `components/reviewOnScroll.tsx`
- [x] renders children
- [x] IntersectionObserver attached on mount
- [x] `isVisible` true once entry intersects → opacity-100
- [x] cleanup unobserves mounted element
- [x] **BUG suspect**: cleanup uses `ref.current` captured late. Fixed by capturing the observed element inside the effect.

### `components/animatedText.tsx`, `title.tsx`, `font.tsx`
- [x] smoke render

## 2. Page Tests (jsdom)

### `pages/index.tsx`
- [x] renders HorizontalDrawer and social links (linkedin/github/instagram/contact)
- [x] journey list renders 5 items (assert each title)
- [x] scroll=0 shows down-arrow; scroll>0 shows up-arrow
- [x] click down-arrow calls `window.scrollTo` w/ smooth + offset
- [x] click up-arrow scrolls to top
- [x] contact mailto correct
- [x] **BUG suspect**: scroll handler not throttled despite rAF (rAF doesn't dedupe — many enqueued frames). Fixed with one pending frame guard.

### `pages/photography/index.tsx`
- [x] empty `photosData` → no images, no crash
- [x] non-empty → renders `<Image>` per photo
- [x] `getServerSideProps` mocked: DataStore.query rejects → returns `{ photosData: [] }`
- [x] shuffle does not mutate referenced object beyond array order
- [x] **BUG**: `random()` called per render inside map → fixed with deterministic `useMemo` sizing keyed by photo id.
- [x] **BUG**: `wh * parseFloat(p.aspectRatio)` — fixed upstream by normalizing `blur.tsx` aspect ratio to `width / height`.

### `pages/projects/index.tsx`
- [x] renders 5 RevealOnScroll sections
- [x] external links have `target="_blank"` and `rel="noopener noreferrer"`
- [x] `openFYPPDF` opens `/docs/FYP-Final-Report.pdf`; file exists in `/public/docs/`.
- [x] `getServerSideProps` failure returns empty arrays (already handled — verify branch hit).

### `pages/gis/index.tsx`
- [x] 2 images render
- [x] snap-y scroll container present

### `pages/music/index.tsx`
- [x] renders drawer + "Music Page" placeholder
- [x] scroll listener cleanup

### `pages/_app.tsx`
- [x] `clarity.init` called once (mock)
- [x] pageProps forwarded
- [x] **BUG suspect**: clarity inits on every full mount. Verified current mount behavior and rerender does not re-init.

## 3. API Tests

### `pages/api/blur.tsx`
Major bugs — write tests + fix:
- [x] **BUG**: `fs.readdir` callback-style; handler returns `res.status(200)` immediately before any work done. Converted to `fs.promises.readdir` + await.
- [x] **BUG**: nested `fs.stat` + `sharp().toBuffer(cb)` callbacks → converted to awaited promises with per-file error handling.
- [x] **BUG**: aspectRatio orientation logic flipped (`orientation==1` → h/w; orientation missing → w/h). Normalized to `width / height`.
- [x] Auth: endpoint open. Added optional env-token guard with `BLUR_API_TOKEN`.
- Tests:
  - [x] empty folder → 200, no DataStore writes
  - [x] new photo → `DataStore.save` called w/ `new Photo(...)`
  - [x] existing photo unchanged → no save
  - [x] existing photo changed → `Photo.copyOf` save
  - [x] sharp error → no crash, error logged
  - [x] `.DS_Store` skipped

### `pages/api/hello.ts`
- [x] 200 + JSON shape

## 4. Integration / E2E (Playwright — already installed)

Golden paths:
1. [x] Load `/` → see Title, journey, verify each nav target href → page loads w/o browser console/page error
2. [x] `/photography` → page shell loads without crashing when server data is empty/unauthorized
3. [x] `/projects` → click "download" → PDF opens (verify URL after fix)
4. [x] `/gis` → snap scroll between two images
5. [x] Mobile viewport (375×667): hamburger opens drawer, links visible, overlay closes
6. [x] Desktop viewport (1440×900): horizontal drawer shows all links

Cross-cutting:
- [x] No browser console errors on covered pages
- [x] No 404s for images / fonts / logos on covered pages
- [x] Lighthouse a11y ≥ 90 (alt text, link names). Current score: 98 on `/`, `/projects`, `/photography`, `/gis`, and `/music`.
- [x] All `<a target="_blank">` have `rel="noopener noreferrer"` — fixed for known page links.

## 5. Build / Config

- [x] `yarn build` → check `.next/standalone` produced
- [x] `next.config.js` `domains` deprecated in Next 13 — only `remotePatterns` needed. Cleaned up.
- [ ] amplify.yml deploy succeeds (smoke)
- [x] TypeScript: `tsc --noEmit` passes
- [x] Jest ignores `.next/` build output to avoid package name collision after standalone builds.

## 6. Bug Punch List (found during read)

| # | File | Issue | Status |
|---|------|-------|--------|
| 1 | tests/Drawer.test.tsx | stale link names | Fixed |
| 2 | tests/App.test.tsx | `drawer-component` testid not on landing | Fixed |
| 3 | api/blur.tsx | callback fs API → response sent before work; race | Fixed |
| 4 | api/blur.tsx | aspectRatio orientation logic inverted | Fixed |
| 5 | api/blur.tsx | unauthenticated admin endpoint | Fixed with optional `BLUR_API_TOKEN` |
| 6 | projects/index.tsx | `openFYPPDF` relative URL broken | Fixed |
| 7 | photography/index.tsx | `random()` per render = layout shift | Fixed |
| 8 | photography/index.tsx | aspectRatio applied as width multiplier — inconsistent w/ blur.tsx definition | Fixed upstream in `blur.tsx` |
| 9 | horizontalDrawer.tsx | dynamic Tailwind class `lg:w-[${width}rem]` dead | Fixed |
| 10 | index.tsx | external links missing `rel="noopener noreferrer"` | Fixed |
| 11 | next.config.js | `domains` deprecated, redundant w/ remotePatterns | Fixed |
| 12 | reviewOnScroll.tsx | cleanup ref captured late (minor) | Fixed |
| 13 | drawer.tsx | initial `windowWidth=0` mobile branch could apply compact sizing before measurement | Fixed |
| 14 | index.tsx | scroll handler queued one rAF per scroll event | Fixed |
| 15 | jest.config.mjs | `.next/standalone/package.json` collides with root package after build | Fixed |
| 16 | projects/index.tsx | icon-only external links had no accessible names | Fixed |
| 17 | pages/_document.tsx | document lacked an explicit `lang` attribute | Fixed |
| 18 | playwright.config.ts | Next dev watcher made E2E runs flaky and slow | Fixed by running Playwright against `next build` + `next start` |

## Suggested Order

1. [x] Fix #1 #2 (so test suite is green baseline)
2. [x] Add remaining page + component unit tests (sections 1–2)
3. [x] Fix #3–#6 + tests (section 3)
4. [x] Add Playwright golden-path (section 4)
5. [x] Fix remaining bugs (#7–#12)
6. [x] Re-run full suite + build
