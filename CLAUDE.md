# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm test          # Run all tests
npm test -- --testPathPattern=tests/Drawer  # Run single test file
```

## Architecture

Personal portfolio site built with **Next.js 13 (Pages Router)**, TypeScript, and Tailwind CSS. Backend is fully managed by **AWS Amplify**.

### Data Layer

AWS DataStore (Amplify) is the persistence layer — not a direct database. Data models live in `src/models/`, auto-generated from the GraphQL schema in `src/graphql/`. `src/API.ts` and `src/aws-exports.js` are Amplify-generated; never edit manually.

AppSync GraphQL endpoint (ap-southeast-1) with API_KEY auth. S3 bucket `laijackylai-storage-*` stores photo assets.

### Photo Pipeline

`/api/blur.tsx` is an admin endpoint that syncs local photos from `./assets/images/` into DataStore:
- Generates blurred base64 previews via `sharp`
- Classifies photos by filename: `DSC*` → `digital`, else → `film`
- Upserts `Photo` DataStore records with s3key, type, aspectRatio, blurredBase64

### Pages

- `/` — main landing page with scroll-reactive drawer and animated sections
- `/photography` — photo gallery (reads from DataStore)
- `/projects` — project showcase with PDF viewer
- `/gis` — GIS work
- `/music` — music section

### Key Components

- `components/drawer.tsx` — scroll-reactive vertical nav (shrinks logo on scroll), fixed position
- `components/horizontalDrawer.tsx` — horizontal variant for landing page
- `components/reviewOnScroll.tsx` — intersection-observer reveal animation wrapper
- `components/animatedText.tsx` — animated text component

### Testing

Tests live in `/tests/`, matched by `<rootDir>/tests/**/*.test.(js|jsx|ts|tsx)`. Uses Jest + jsdom + Testing Library. `next-router-mock` handles Next.js router in tests.
