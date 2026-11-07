# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm test          # Run all tests
npm test -- --testPathPattern=tests/HorizontalDrawer  # Run single test file
npm run test:e2e  # Playwright e2e
npm run blur      # Sync ./assets/images blur placeholders into AppSync (needs AWS creds)
```

## Architecture

Personal portfolio site built with **Next.js 15 (Pages Router)**, TypeScript, and Tailwind CSS. Backend is **AWS Amplify Gen 2** (`amplify/`, CDK-based). Node version is pinned in `.nvmrc`.

### Data Layer

`amplify/data/resource.ts` defines one `Photo` model on AppSync (ap-southeast-1). Public reads use API_KEY; writes use IAM (`amplify/data/iam-auth.ts`). The site does not use the Amplify client SDK at runtime: `getStaticProps` calls AppSync directly with `fetch` using the server-only env vars `APPSYNC_URL` / `APPSYNC_API_KEY`, and follows `nextToken` pagination.

Photos live in the Amplify S3 bucket under `public/*` (bucket policy allows anonymous `GetObject` there). Image URLs are built by `publicStorageUrl()` from `STORAGE_BASE_URL`; any new bucket hostname must be added to `images.remotePatterns` in `next.config.js`. Cognito self sign-up is disabled in `amplify/backend.ts` because authenticated users can write photos and storage.

`amplify.yml` writes the Amplify Hosting branch env vars into `.env.production` at build time.

### Photo Pipeline

`scripts/blur.ts` (`npm run blur`) syncs local photos from `./assets/images/` into AppSync:
- Generates a 16px-wide PNG blur placeholder via `sharp` (must stay under the 2048-char inline limit in `pages/photography`)
- Classifies photos by filename: `DSC*` → `digital`, else → `film`
- Upserts `Photo` records by s3key (reads via API key, writes via SigV4)

`scripts/migrate-photos.ts` was the one-off Gen 1 → Gen 2 row migration.

### Pages

All pages share the v4 "hardware" design (styles/globals.css, plain CSS, no Tailwind). `/projects`, `/photography`, `/music` and `/gis` are full-page snap pages: `<html class="snap-page">` is set server-side in `_document.tsx` from `SNAP_PAGES` and toggled on client navigation.

- `/` — hero, skills, journey (eBay logo flashes its 1999 logo on hover), page tiles with random greyscale hover pictures (photos pool comes from AppSync in `getStaticProps`, failure-tolerant)
- `/projects` — data-driven `PROJECTS` list; Takcarly screenshots + blur via `plaiceholder`
- `/photography` — photo sequence (ISR, AppSync + S3), shuffled per load, format filters, `<dialog>` viewer
- `/gis` — map panels
- `/music` — landing + deck linking to Instagram @sing.sang.sunk

### Key Components

- `components/layout.tsx` — nav, mobile sheet, footer, keys dialog, icon sprite; runs `initSite` after every route render
- `lib/site.js` — imperative behaviours: theme switch (headlight view transition, beams pre-baked to PNG), nav indicator, dot-grid canvas behind `.noise-bg` (sleeps when idle), reveal, clocks, section pager, keyboard shortcuts, title glitch
- `lib/storage.ts` — `publicStorageUrl`, `fetchPhotos`, `shouldFailStaticBuild`
- Title glitch fonts in `public/fonts`: Zerbydoo is commercial OK; Cyber Blast, RaXOR, Street Wolfker, Riot Funky are personal-use demos (licence txt alongside). Site must stay non-commercial or buy licences

### Testing

Tests live in `/tests/`, matched by `<rootDir>/tests/**/*.test.(js|jsx|ts|tsx)`. Uses Jest + jsdom + Testing Library. `next-router-mock` handles Next.js router in tests. E2E tests (Playwright) live in `tests/e2e/`.
