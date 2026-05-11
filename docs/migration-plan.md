# Migration Plan: Amplify Gen 1 → Gen 2 + Server-Side AppSync

Personal portfolio production hardening. Drops DataStore client, migrates backend to Amplify Gen 2, fetches photo data server-side from AppSync.

**Priorities**: maintainability, performance.
**Stack target**: Next.js 13 Pages Router, Amplify Gen 2 (AppSync + DynamoDB + S3), server-side data fetch with ISR.

## Status snapshot (2026-05-10)

| Phase | Status |
|-------|--------|
| 0 — Security + Cleanup | ✅ done |
| 1 — Amplify Gen 2 Backend | ✅ done (incl. 1.10 Phase 3 pull-forward) |
| 2 — Data Migration | ✅ done — PR #38 → `ba16b05`, job 60 SUCCEED, 66/66 rows migrated |
| 3 — Client Refactor | ✅ done — perf fix `3ac8ccf` deployed (main job 62 SUCCEED). Lighthouse 34 → 78 on prod; accepted below >90 target (see §3.7 note) |
| 4 — Decommission Gen 1 | ⏳ blocked: requires 1 week prod soak from `3ac8ccf` deploy (earliest 2026-05-17) |

### Outstanding TODOs (non-blocking)

- [x] §2.6 step 17 — delete Phase 1 Amplify Hosting branch `phase-1-amplify-gen2` — done 2026-05-10
- [x] §3.7 — `docs/phase3-baseline.txt` written; prod Lighthouse 78 recorded, accepted with note
- [ ] §4.1–4.4 — Gen 1 stack teardown after 1-week prod soak (earliest 2026-05-17)

---

## Phase 0 — Security + Cleanup

Independent of backend migration. Ship as separate PR first.

### 0.1 Fix blur API auth fail-open

**File**: `pages/api/blur.tsx:20`

Current bug: when `BLUR_API_TOKEN` env var unset, auth check skipped entirely.

```ts
// before
if (expectedToken && providedToken !== expectedToken) {
  return res.status(401).json({ result: 'Unauthorized' });
}

// after
if (!expectedToken || providedToken !== expectedToken) {
  return res.status(401).json({ result: 'Unauthorized' });
}
```

Set `BLUR_API_TOKEN` in Amplify Hosting env vars.

### 0.2 Delete dead artifacts

**Done in prep §5.** Verify only:

```bash
test ! -e .firebase && test ! -e .firebaserc && test ! -e out
```

### 0.3 Single package manager

**Done in prep §2.2 / §9.** Current `amplify.yml` is npm-only.

Cleanup task: drop the leftover `cat next.config.js` debug line from `amplify.yml` `preBuild`. Final shape:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

Backend block added in Phase 1.8.

### 0.4 CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### 0.5 Tooling bumps

`package.json`:

- `eslint-config-next` → `13.2.4` (match Next version; currently `12.2.5`)
- Remove `eslint-config-airbnb` + airbnb peer deps (declared, never extended)
- Remove `@next/eslint-plugin-next` (covered by `eslint-config-next`)

`tsconfig.json` — currently `target: es5`:

```json
{
  "compilerOptions": {
    "target": "es2020"
  }
}
```

### 0.5b TypeScript bump (Gen 2 prereq)

`@aws-amplify/backend` requires TypeScript ≥5.4. Repo currently `4.7.4`.

```bash
npm install --save-dev typescript@~5.4
npx tsc --noEmit  # confirm clean after bump
```

Run before Phase 1.1.

### 0.6 next.config.js cleanup

Already on `remotePatterns` only (no `images.domains`). Keep literal hostnames — Next 13 does not glob-expand `*` in `hostname`. Add the future Gen 2 bucket hostname after Phase 1.7 sandbox provisions it; until then keep the existing pair plus the new one alongside.

```js
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'https', hostname: 'laijackylai-storage-4ba35e56184317-dev.s3.ap-southeast-1.amazonaws.com', pathname: '/**' },
    { protocol: 'https', hostname: 'laijackylai-storage-4ba35e5623621-main.s3.ap-southeast-1.amazonaws.com', pathname: '/**' },
    // Add Gen 2 bucket hostname here after Phase 1.7
  ],
}
```

### 0.7 Microsoft Clarity via next/script

`pages/_app.tsx` — replace `useEffect` init with `<Script>`:

```tsx
import Script from 'next/script';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script id="ms-clarity" strategy="afterInteractive">
        {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "hkl116cujk");`}
      </Script>
      <Component {...pageProps} />
    </>
  );
}
```

Drop `react-microsoft-clarity` dep.

### 0.8 Blur path decision

**Decision (prep §8): convert to local-only script `scripts/blur.ts`.** Avoids SSR bundle tracing entirely and removes a write surface from the public API.

- Move logic out of `pages/api/blur.tsx` into `scripts/blur.ts`.
- Add `"blur": "ts-node scripts/blur.ts"` to `package.json` `scripts`.
- Delete `pages/api/blur.tsx` (handled in Phase 3.5).
- `BLUR_API_TOKEN` env var becomes obsolete after deletion — drop from Amplify Hosting + `.env.local` at end of Phase 3.

### 0.9 Phase 0 acceptance

**Status (2026-05-10): superseded.** `/api/blur` deleted in Phase 3.5 (moved to `scripts/blur.ts`); `BLUR_API_TOKEN` retired. Remaining gates verified throughout Phases 1–3:

- [x] `npm run lint && npm test && npm run build` green locally — last green 2026-05-09 (33/33 tests)
- [x] CI passes on PR — PR #36 + #38 merged green
- [x] Amplify Hosting deploy green with new `amplify.yml` — main job 60 + 62 SUCCEED
- [x] ~~`BLUR_API_TOKEN` set, `/api/blur` returns 401 without header~~ — N/A, endpoint removed in §3.5
- [x] Clarity firing in browser devtools network tab — verified prod smoke 2026-05-09

---

## Phase 1 — Amplify Gen 2 Backend

Gen 1 → Gen 2 has no automated migration path. Strategy: stand up Gen 2 stack alongside Gen 1, migrate data, cutover, decommission Gen 1.

### 1.1 Install Gen 2 toolchain

Breaking change: `aws-amplify` v5 → v6. `Amplify.configure(awsconfig)` becomes `Amplify.configure(outputs)`; `DataStore` API removed; `Storage` namespace replaced by `uploadData`/`getUrl`. All v5 callers must be reworked in Phase 3.

```bash
npm install aws-amplify@latest                                    # v6+
npm install --save-dev @aws-amplify/backend @aws-amplify/backend-cli
# typescript ≥5.4 already installed in 0.5b
```

**Sequencing**: bumping `aws-amplify` to v6 breaks `next build` immediately because `pages/`, `scripts/`, `tests/`, and `src/ui-components/` still import the removed `DataStore` / `Storage` namespaces. Plan handles this by inserting **Phase 1.10 — Client unblock** (formerly Phase 3.1 + 3.2) directly after 1.9 — before Phase 2. Build stays green from 1.10 onward.

End-state at the close of 1.10: zero `DataStore` imports anywhere, zero `Storage` imports outside server code.

Status: completed on 2026-05-03. `package.json` shows `aws-amplify ^6.16.4`, `@aws-amplify/backend ^1.22.0`, `@aws-amplify/backend-cli ^1.8.2`. `npm run build` is currently red as expected — clears once 1.10 lands.

### 1.2 Bootstrap new Amplify Gen 2 project

Old Gen 1 dirs (`amplify/backend/`, `amplify/#current-cloud-backend/`, `amplify/.config/`, `amplify/hooks/`) stay untouched until cutover. New Gen 2 lives in fresh `amplify/` root files.

Move Gen 1 sideways first:

```bash
mv amplify amplify-gen1
```

Create new structure:

```
amplify/
  backend.ts
  data/
    resource.ts
  auth/
    resource.ts
  storage/
    resource.ts
```

Status: completed on 2026-05-03. `amplify-gen1/` holds the old Gen 1 tracked files (`cli.json`, `team-provider-info.json`, gitignored `backend/`, `#current-cloud-backend/`, `.config/`, `hooks/`). New `amplify/` has `backend.ts`, `auth/resource.ts`, `data/resource.ts`, `storage/resource.ts`.

### 1.3 `amplify/auth/resource.ts`

```ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: { email: true },
});
```

Status: completed on 2026-05-03. `amplify_outputs.json` shows user pool `ap-southeast-1_9ZzUlJ1LF` and identity pool `ap-southeast-1:b9b99ea2-888a-4a19-8184-5232c72f5ede`.

### 1.4 `amplify/data/resource.ts`

```ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Photo: a
    .model({
      s3key: a.string().required(),
      type: a.string().required(),
      aspectRatio: a.string().required(),
      blurredBase64: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),                                // public read for getStaticProps
      allow.authenticated('iam').to(['create', 'update', 'delete']),    // admin writes via SigV4 (see below)
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
```

Why `'iam'` not `'identityPool'`:

- `'identityPool'` requires the caller to present credentials returned by the Cognito identity pool's authenticated flow (signed-in user). SigV4 with raw IAM creds (env vars, SSO, `~/.aws/credentials`) does **not** satisfy this rule.
- `'iam'` lets any IAM principal with `appsync:GraphQL` permission write — matches the `scripts/blur.ts` SigV4 path in Phase 3.5.

Write-path options for `scripts/blur.ts` — pick one before Phase 2:

1. **Lambda authorizer + second API key** — extend `authorizationModes` with a Lambda authorizer that checks a shared secret in the request header; use it for `Photo.create/update`. Stored as `APPSYNC_ADMIN_KEY`. Replace `allow.authenticated('iam')` with `allow.custom()`.
2. **IAM-signed requests** (above) — sign requests in `scripts/blur.ts` with `@aws-sdk/signature-v4`. No long-lived key.

Recommended: option 2. Local script already runs with the dev's AWS creds; one fewer secret to rotate. Plan Phase 3.5 assumes option 2.

If the schema in the deployed sandbox still has `allow.authenticated('identityPool')` (initial mistake), change to `allow.authenticated('iam')` and re-run `npx ampx sandbox` (or pipeline-deploy) before Phase 2.

Status: schema deployed on 2026-05-03. Initial deploy used `allow.authenticated('identityPool')` — **must be patched to `'iam'` before Phase 3.5 SigV4 writes work**. Sandbox AppSync endpoint `https://kkjkxcxd3bf7rcp5vne6njng6m.appsync-api.ap-southeast-1.amazonaws.com/graphql`, default API key `da2-pxeet4rtizekxn74htwhn7s4oy` (in gitignored `amplify_outputs.json`).

### 1.5 `amplify/storage/resource.ts`

```ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'laijackylai-storage',
  access: (allow) => ({
    'photos/*': [allow.guest.to(['read']), allow.authenticated.to(['read', 'write', 'delete'])],
  }),
});
```

Status: completed on 2026-05-03. Bucket `amplify-laijackylai-laija-laijackylaistoragebucket-ntfkq0sgwpt2` (`ap-southeast-1`). Add this hostname to `next.config.js` `remotePatterns` before Phase 3.3.

**Superseded 2026-05-05 by §1.12.1**: access path changes from `'photos/*'` to `'public/*'` to match Gen 1 keys + Gen 2 SDK convention. Use the snippet here only for reference; the `'public/*'` form in 1.12.1 is canonical.

### 1.6 `amplify/backend.ts`

```ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

defineBackend({ auth, data, storage });
```

Status: completed on 2026-05-03.

### 1.7 Sandbox deploy

```bash
npx ampx sandbox
```

Generates `amplify_outputs.json`. Add to `.gitignore`. Test schema in sandbox before promoting.

Status: deployed on 2026-05-03. Sandbox stack `amplify-laijackylai-laijackylai-sandbox-e87c5d3fcf` plus nested auth/data/storage stacks all `CREATE_COMPLETE` in `ap-southeast-1`. `amplify_outputs.json` present locally and gitignored.

### 1.8 Pipeline deploy config

Update `amplify.yml`:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

Status: `amplify.yml` updated on 2026-05-03 with backend block + `npx ampx pipeline-deploy`. Branch deploy on Amplify Hosting not yet observed — verify once a backend-touching commit is pushed.

### 1.9 Phase 1 acceptance

- [x] `npx ampx sandbox` deploys clean — sandbox stack `CREATE_COMPLETE` 2026-05-03
- [x] AppSync endpoint reachable, schema introspection works — `amplify_outputs.json` populated
- [x] S3 bucket created, IAM policies on `photos/*` correct — `amplify-laijackylai-laija-laijackylaistoragebucket-ntfkq0sgwpt2`
- [x] Pipeline deploy succeeds on Amplify Hosting branch — verified 2026-05-05 on test branch `phase-1-amplify-gen2`, job 12 SUCCEED (job 11 backend UPDATE_COMPLETE; frontend retried after transient `npm ci` ECONNRESET)

**Carry-over before Phase 2**:

1. **Schema authz hack** — extracted to `amplify/data/iam-auth.ts` and covered by `tests/AmplifyDataAuth.test.ts`. Done 2026-05-04. Still brittle (depends on internal symbol layout of `@aws-amplify/backend` 1.22.0). Action items:
   - [x] Pin `@aws-amplify/backend` to `1.22.0` (`==`) — done 2026-05-04 (`package.json`).
   - [x] Unit test on the helper — `tests/AmplifyDataAuth.test.ts`.
   - [x] Investigate `@aws-amplify/backend` >1.22 for native `allow.authenticated('iam')` or `allow.iam()`. Checked 2026-05-04: latest npm `@aws-amplify/backend` still 1.22.0; `@aws-amplify/data-schema` latest 1.25.5 — neither exposes native `allow.iam()` or `authenticated('iam')`. Helper remains required. Re-check on next backend release.

   ```ts
   // amplify/data/iam-auth.ts
   export const iamAuthenticated = (allow: any): any => {
     const auth = allow.authenticated('identityPool') as object;
     const [dataSymbol] = Object.getOwnPropertySymbols(auth);
     (auth as any)[dataSymbol].provider = 'iam';
     return auth;
   };
   ```

2. **Gen 2 bucket hostname** — added to `next.config.js:29` 2026-05-04. ✅

3. **`defaultStorageBaseUrl` flip** — both `pages/photography/index.tsx:119` and `pages/projects/index.tsx:233` still hardcode the Gen 1 bucket. Schedule for the Phase 2 / Phase 4 boundary so URLs do not break mid-migration. **Approach decided 2026-05-04: env var flip.** Set `STORAGE_BASE_URL=https://amplify-laijackylai-laija-laijackylaistoragebucket-ntfkq0sgwpt2.s3.ap-southeast-1.amazonaws.com` in `.env.local` + Amplify Hosting env vars after Phase 2 S3 copy completes. No code change needed — `publicStorageUrl()` already reads `process.env.STORAGE_BASE_URL` with hardcoded Gen 1 fallback. Add `STORAGE_BASE_URL` row to `docs/prep-steps.md` env var table.

4. **Pipeline deploy verification** — ✅ closed 2026-05-09. Phase 2 merge (`ba16b05`) triggered pipeline-deploy job 60 → SUCCEED 21:38:51 (13m42s).

5. **`pages/api/revalidate.ts` decision** — dropped 2026-05-04. `REVALIDATE_TOKEN` removed from `.env.local`. 60s ISR window accepted. ✅

6. **Photography `getStaticProps` swallow-then-empty fallback** — fixed 2026-05-04. `pages/photography/index.tsx:135-137,170-172,177-179` now throws when `NODE_ENV !== 'development'` and on non-OK / GraphQL error responses. ✅

7. **`scripts/blur.ts` read/write client split** — done 2026-05-04. `createApiKeyGraphqlClient` (read, apiKey) + `createSignedGraphqlClient` (write, SigV4) match the schema rule split. `loadEnvConfig` picks up `.env.local` on `npm run blur`. Tested in `tests/BlurScript.test.ts`. ✅

### 1.10 Client unblock (pulled from Phase 3.1 + 3.2)

After 1.1's v6 bump, `next build` is broken until every v5 `DataStore` / `Storage` importer is removed. Do that here so Phase 2 starts on a green build.

Status: completed on 2026-05-03 with **Option A** (also pulled Phase 3.3 + 3.5 forward). Final state verified: `lint` clean, `28 / 12 suites` pass, `next build` green with `/photography (ISR: 60 Seconds)` shown. Zero `aws-amplify` imports outside `scripts/blur.ts`.

#### 1.10.1 Remove Gen 1 client artifacts

```bash
rm src/aws-exports.js src/API.ts
rm -rf src/models/ src/graphql/
rm -rf src/ui-components/                # Gen 1 Amplify Studio forms — none referenced by pages/components
```

Verify `src/ui-components/` is unused before delete:

```bash
grep -rn "src/ui-components\|from '\.\./ui-components" pages components || echo "no references"
```

#### 1.10.2 Refactor `pages/projects/index.tsx`

- Currently imports `Storage` from `aws-amplify` (v5 API, removed in v6).
- Mirror Phase 3.3 pattern: server-side fetch via `getStaticProps`, generate signed S3 URLs (or use public S3 URLs via `next/image` `remotePatterns`) in the loader, pass via props.
- Drop the `Storage` import. No client SDK call remains on this page.

#### 1.10.3 Drop deps

```bash
npm uninstall @aws-amplify/datastore swr
```

Confirm `@aws-amplify/datastore` is gone from both `dependencies` and `devDependencies`:

```bash
grep "@aws-amplify/datastore" package.json && echo "STILL PRESENT" || echo "removed"
```

Verify `swr` has no other importers before drop:

```bash
grep -rn "from 'swr'" --include='*.ts' --include='*.tsx' . || echo "no swr usage"
```

Keep `aws-amplify` v6 for the migration script and `scripts/blur.ts`. Server fetches in `getStaticProps` use plain `fetch` against AppSync — no client SDK needed.

#### 1.10.4 Rewrite `pages/_app.tsx`

Strip `Amplify.configure` + `aws-exports` import. Keep clarity Script from Phase 0.

```tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Script from 'next/script';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script id="ms-clarity" strategy="afterInteractive">
        {/* clarity inline */}
      </Script>
      <Component {...pageProps} />
    </>
  );
}
```

#### 1.10.5 Stub the Gen 1 callers temporarily

`pages/photography/index.tsx` and `pages/api/blur.tsx` still need to compile until Phase 3.3 / 3.5 rewrite them. Quickest unblock without code rot:

- **Option A (preferred)**: pull Phase 3.3 + 3.5 forward as well. Then 1.10 = full client cutover and Phase 3 collapses to tests + acceptance only.
- **Option B**: replace v5 imports with `// TODO(phase-3.x)` stubs that throw at runtime. Build passes; routes broken in prod until Phase 3 lands. Only acceptable if Phase 3 follows immediately in the same PR train.

Mark which option is chosen in the PR description. Plan from here on assumes Option A.

#### 1.10.6 Update `tests/` mocks

Tests that import `aws-amplify` directly (`tests/AppShell.test.tsx`, `tests/BlurApi.test.ts`, `tests/PhotographyPage.test.tsx`, `tests/ProjectsPage.test.tsx`) must move to v6 SDK shapes or be deleted in line with their target route's fate (see Phase 3.6).

Suggested order:

1. Delete `tests/BlurApi.test.ts` (route deleted in Phase 3.5 / pulled forward).
2. Update `tests/AppShell.test.tsx` to drop the `Amplify.configure` mock.
3. Convert `tests/PhotographyPage.test.tsx` and `tests/ProjectsPage.test.tsx` to inject server-fetched props.

#### 1.10.7 Acceptance

- [x] `grep -rn "from 'aws-amplify'" pages components tests src` returns zero hits (allowed: `scripts/blur.ts`, `scripts/migrate-photos.ts`)
- [x] `npm run lint && npm test && npm run build` all green — re-verified 2026-05-04 (lint clean, 30/30 tests, `/photography (ISR: 60 Seconds)` builds in 1.5s)
- [x] `src/ui-components/`, `src/models/`, `src/graphql/`, `src/aws-exports.js`, `src/API.ts` all gone
- [x] `@aws-amplify/datastore` + `swr` absent from `package.json`

### 1.11 Verify IAM write path (Phase 2 preflight)

Phase 2.2 migration script and Phase 3.5 `scripts/blur.ts` both write via SigV4 against the `'iam'` auth rule on the `Photo` model. If IAM auth is broken (wrong signer service, missing `appsync:GraphQL` on the principal, schema rule not actually `iam`), both will fail with `Not Authorized`. Verify *once* end-to-end before Phase 2.

#### 1.11.1 Confirm caller IAM identity

```bash
aws sts get-caller-identity
# Note the ARN. It must have appsync:GraphQL on the Gen 2 API.
```

For local dev, the simplest grant is to attach a policy on the IAM user/role:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "appsync:GraphQL",
    "Resource": "arn:aws:appsync:ap-southeast-1:232665835945:apis/<gen2-appsync-api-id>/types/Mutation/fields/createPhoto",
    "Effect": "Allow"
  }]
}
```

Wildcards acceptable for the local dev principal during the migration window:

```json
{ "Action": "appsync:GraphQL", "Resource": "arn:aws:appsync:ap-southeast-1:232665835945:apis/<gen2-appsync-api-id>/*", "Effect": "Allow" }
```

`<gen2-appsync-api-id>` = the host prefix in `amplify_outputs.json` `data.url` (e.g. `kkjkxcxd3bf7rcp5vne6njng6m`).

For production / pipeline-deployed stack, the Amplify Hosting service role and any CI principal need the same grant against the prod stack's AppSync API id (different from sandbox).

#### 1.11.2 Dry-run `scripts/blur.ts` against sandbox

```bash
# .env.local already has APPSYNC_URL pointed at sandbox per amplify_outputs.json
npm run blur
```

Expect:
- `Blur sync complete. Processed N file(s).` with no errors.
- A `listPhotos` query via the sandbox AppSync console returns the synced rows.

If 401 / `UnauthorizedException` / `NotAuthorizedException`:
- `aws sts get-caller-identity` ARN missing `appsync:GraphQL` → fix policy.
- Schema rule still `provider: 'identityPool'` → re-deploy sandbox after the symbol-hack fix.
- Signer using wrong service → must be `service: 'appsync'`, not `'execute-api'`.

#### 1.11.3 Acceptance

- [x] `aws sts get-caller-identity` ARN has `appsync:GraphQL` on the sandbox API — `arn:aws:iam::232665835945:user/amplify-5dZdc` (verified 2026-05-04)
- [x] `npm run blur` exits 0 against sandbox — verified 2026-05-04
- [x] AppSync console shows the rows written by blur.ts — `photos/film/phase1-preflight.png` written + readback confirmed 2026-05-04
- [x] `amplify_outputs.json` Photo rule shows `provider: "iam"` (not `identityPool`) — verified 2026-05-04

All four boxes green — Phase 2 unblocked.

### 1.12 Gap A — Storage path / key prefix alignment

**Surfaced 2026-05-05** during pipeline-deploy verification on Amplify Hosting (test branch `phase-1-amplify-gen2`, jobs 5–6). Frontend build failed:

> `Error: Input buffer contains unsupported image format` (plaiceholder fed a 403 / XML body)

Root cause: `pages/projects/index.tsx:251` declares `imageKeys = ["takcarly/takcarly_1.png", ...]` and pipes them through `publicStorageUrl()` (an unsigned `${STORAGE_BASE_URL}/${key}` builder). The Gen 1 prod bucket actually stores them at `public/takcarly/...` — the old code used Amplify v5 `Storage.get(key)` which auto-prepended `public/`. v6 has no such auto-prefix, and `publicStorageUrl()` does not add one.

There is also a Gen 2 mirror of the same bug: `amplify/storage/resource.ts` declares the access path as `'photos/*'`, which neither matches the Gen 1 keys (`public/...`) nor the Gen 2 SDK convention (`public/*` is the documented guest-read prefix per [Amplify Storage authorization docs](https://docs.amplify.aws/react/build-a-backend/storage/authorization/)). Picking `photos/*` would force a per-key rename during Phase 2.3 S3 sync, which we do not want.

**Decision**: align Gen 2 storage path to `public/*` so Gen 1 keys copy in-place during 2.3, then patch the Projects page to reference keys with the same `public/` prefix that `getStaticProps` will use for both buckets.

#### 1.12.1 Switch Gen 2 storage path to `public/*`

`amplify/storage/resource.ts`:

```ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'laijackylai-storage',
  access: (allow) => ({
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});
```

This is the Gen 2 canonical guest-read prefix. Documented in `aws-amplify/docs` storage authorization page; the `'photos/*'` value used in 1.5 was a mistake.

#### 1.12.2 Fix `pages/projects/index.tsx` keys

`pages/projects/index.tsx:251` — add `public/` prefix:

```ts
const imageKeys = [
  'public/takcarly/takcarly_1.png',
  'public/takcarly/takcarly_2.png',
  'public/takcarly/takcarly_3.png',
];
const urls = imageKeys.map(publicStorageUrl);
```

Do not introduce a helper that prepends `public/` automatically — that just hides the prefix. Source-of-truth keys are stored verbatim.

#### 1.12.3 Compatibility shim in `publicStorageUrl()` (short-term)

**Initial assumption was wrong.** Audit on 2026-05-05 of Gen 1 prod table `Photo-gbzpma2elvdxnjqehhqdnf5wmy-main` (sample of 10 rows):

```
photos/film/000874080031.jpg
photos/digital/DSC05884.jpg
photos/film/000874100006.jpg
photos/film/000044480026.jpg
photos/digital/DSC05980.jpg
photos/digital/DSC03523.jpg
photos/film/000009540019.jpg
photos/film/000060300003.jpg
photos/film/000082500005.jpg
photos/film/000009550014.jpg
```

Every row stores a **bare** key (no `public/` prefix). Actual S3 layout under `s3://laijackylai-storage-4ba35e5623621-main/`:

```
public/photos/film/000874080031.jpg
public/photos/digital/DSC05884.jpg
public/takcarly/takcarly_1.png
```

Gen 1 v5 `Storage.put({ key })` silently prepended `public/` before the S3 PUT but stored the bare key in DynamoDB. Without a fix, `publicStorageUrl(s3key)` constructs `${BASE}/photos/film/...` which 404s against any bucket whose objects live under `public/photos/...`.

**Decision (2026-05-05): Option 1 short-term shim, Option 2 cleanup in Phase 2.**

Patch `publicStorageUrl()` in both `pages/photography/index.tsx:132-136` and `pages/projects/index.tsx:247-251`:

```ts
// Gen 1 DynamoDB stores s3keys as bare paths (e.g. "photos/film/x.jpg"); Gen 1
// v5 SDK silently prepended "public/" before talking to S3. This shim keeps the
// same behavior so both bucket layouts resolve. Remove once Phase 2 migration
// rewrites s3keys with the explicit "public/" prefix.
const publicStorageUrl = (key: string) => {
  const storageBaseUrl = getStorageBaseUrl();
  const normalizedKey = key.startsWith('public/') ? key : `public/${key}`;
  const encodedKey = normalizedKey.split('/').map(encodeURIComponent).join('/');
  return `${storageBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
};
```

Helper is **idempotent**: passing `public/takcarly/...` (the explicit form used in `pages/projects/index.tsx:255-258`) is unchanged; passing bare `photos/film/...` (the shape stored in DynamoDB) gets the prefix added.

Why short-term: hides a real schema convention behind code. Schema source-of-truth should hold full keys. Phase 2.2 migration script will rewrite s3keys with the prefix when copying Gen 1 → Gen 2 (see §2.2 Option 2 cleanup), at which point this shim is removed in §2.5.

Test coverage: `tests/ProjectsPage.test.tsx` asserts both shapes round-trip (public/ preserved, bare prepended).

#### 1.12.4 Update Phase 2.3 sync command

Phase 2.3 currently syncs `s3://laijackylai-storage-4ba35e5623621-main/photos/` → `s3://<gen2-bucket>/photos/`. After 1.12.1 the target prefix is `public/`, and Gen 1 source is also `public/` (the Gen 1 `Storage.put()` default). Replace with:

```bash
aws s3 sync \
  s3://laijackylai-storage-4ba35e5623621-main/public/ \
  s3://<gen2-bucket>/public/ \
  --region ap-southeast-1
```

Bucket name comes from the prod `amplify_outputs.json` once the prod stack lands (different from the test-branch bucket). Update Phase 2.3 with the actual prod bucket name at cutover time.

#### 1.12.5 Tests

Add a regression in `tests/ProjectsPage.test.tsx` (or new `tests/PublicStorageUrl.test.ts`):

```ts
it('publicStorageUrl preserves public/ prefix', () => {
  process.env.STORAGE_BASE_URL = 'https://example.s3.amazonaws.com';
  expect(publicStorageUrl('public/takcarly/takcarly_1.png'))
    .toBe('https://example.s3.amazonaws.com/public/takcarly/takcarly_1.png');
});
```

Export `publicStorageUrl` from `pages/projects/index.tsx` (or move to a shared `lib/storage.ts` if both pages re-import — not required but reduces duplication).

#### 1.12.6 Acceptance

- [x] `amplify/storage/resource.ts` access path = `'public/*'` — verified 2026-05-05
- [x] `pages/projects/index.tsx:255-258` keys all start with `public/` — verified 2026-05-05
- [x] `aws dynamodb scan ... | jq '.Items[].s3key.S'` audit captured — output pasted in §1.12.3; **rows are bare (no `public/` prefix)**, hence the shim in §1.12.3 instead of an "all rows already prefixed" check
- [x] Phase 2.3 sync paths updated in this doc — paths now `public/` (was `photos/`)
- [x] `publicStorageUrl()` shim added + tested for both bare and prefixed keys — `tests/ProjectsPage.test.tsx`
- [x] `npm run lint && npm test && npm run build` green — verified 2026-05-05 by user after commit `2061117`; re-verify after shim commit lands

### 1.13 Gap B — Gen 2 bucket access strategy

**Surfaced 2026-05-05** alongside Gap A. Gen 2 buckets created by `defineStorage` ship with a deny-by-default bucket policy:

```json
{ "Effect": "Deny",  "Principal": "*", "Condition": { "Bool": { "aws:SecureTransport": false } } }
{ "Effect": "Allow", "Principal": { "AWS": "<auto-delete-objects-role>" }, ... }
```

Guest reads are routed through Cognito Identity Pool → unauth IAM role → SigV4-signed S3 GET. There is no public S3 read by default. `publicStorageUrl()` constructs **unsigned** direct S3 URLs — these will 403 against any Gen 2 bucket regardless of the `allow.guest.to(['read'])` rule, because that rule grants the IAM role permission, not the bucket policy.

Gen 1 happened to work because the Gen 1 CLI created a bucket policy with `Principal: "*"` on `public/*`. Gen 2 does not.

Migration plan §3.x assumed `STORAGE_BASE_URL` flip alone was sufficient. It is not. Choose one access strategy below before Phase 4 cutover.

#### 1.13.1 Strategy comparison

| Option | What it does | Build-time fetch in `getStaticProps`? | Auth | Effort | Drawback |
|--------|-------------|----------------------------------------|------|--------|----------|
| **A. Public-read policy on `public/*`** | CDK escape hatch in `amplify/backend.ts` adds `s3:GetObject` Allow for `Principal: "*"` on `arn:.../public/*` only | ✅ Yes — direct unsigned URL works | Public on `public/*`, deny elsewhere | Low | Anyone can fetch `public/*` objects directly. Same exposure as Gen 1 today. |
| **B. Server-side presigned URLs via `getUrl()`** | `getStaticProps` calls `getUrl({ path })` per photo, returns signed URL through props | ✅ Yes — but URL expires at most 1h | IAM-signed via Identity Pool guest role | Medium | URLs expire. ISR re-runs every 60s → URL is regenerated on each rebuild → fine for ISR, but breaks if a CDN caches the HTML longer than `expiresIn`. Adds Amplify SDK config to server runtime. |
| **C. CloudFront + OAC fronting bucket** | New CloudFront distribution, OAC reads bucket, public domain serves objects | ✅ Yes | Public via CDN; bucket private | Medium-high | Adds a distribution + cache-invalidation surface. Overkill for personal site unless edge caching is wanted anyway. |
| **D. Server-side `s3:GetObject` in route handler** | Add `pages/api/photo/[...key].ts` that streams S3 objects through Lambda | ❌ Defeats `next/image` `remotePatterns` benefit | App-level | High | Wastes Lambda time + bandwidth for static assets. Not viable for ISR `<Image>` workflow. |

**Recommendation: Option A (public-read on `public/*` only).**

Rationale:
- Matches existing Gen 1 exposure surface — no new threat model.
- Zero client-side changes; `publicStorageUrl()` keeps working.
- `next/image` continues to fetch directly via `remotePatterns` (best perf, no Lambda hop).
- Survives ISR, on-demand revalidate, and any CDN cache layer.
- Easiest to revert: if we later move to OAC/CloudFront, just remove the policy and add the distribution.

Pick a different option only if the threat model changes (private photos, signed downloads required, etc.).

#### 1.13.2 Implement Option A — public-read policy

`amplify/backend.ts`:

```ts
import { defineBackend } from '@aws-amplify/backend';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';

const backend = defineBackend({ auth, data, storage });
const bucket = backend.storage.resources.bucket;
const cfnBucket = bucket.node.defaultChild as CfnBucket;

// Allow the scoped public/* bucket policy while keeping ACL blocking in place.
cfnBucket.addPropertyOverride('PublicAccessBlockConfiguration.BlockPublicPolicy', false);
cfnBucket.addPropertyOverride('PublicAccessBlockConfiguration.RestrictPublicBuckets', false);

bucket.addToResourcePolicy(
  new PolicyStatement({
    sid: 'PublicReadOnPublicPrefix',
    effect: Effect.ALLOW,
    principals: [new AnyPrincipal()],
    actions: ['s3:GetObject'],
    resources: [`${bucket.bucketArn}/public/*`],
  }),
);
```

The CDK override is required because Amplify's generated bucket has S3 Block Public Access enabled. Keep `BlockPublicAcls` and `IgnorePublicAcls` enabled; only turn off `BlockPublicPolicy` and `RestrictPublicBuckets` so CloudFormation can attach the scoped `s3:GetObject` policy for `public/*`.

The `aws-cdk-lib` peer is already in the dependency tree (transitive of `@aws-amplify/backend`). Install it explicitly because `amplify/backend.ts` imports CDK modules directly:

```bash
npm install --save-dev aws-cdk-lib@^2.252.0 constructs@^10.6.0
```

Pin at the exact major used by `@aws-amplify/backend@1.22.0`. Verify with `npm ls aws-cdk-lib constructs`.

The `Bool: aws:SecureTransport: false` deny-by-default statement Amplify ships with takes precedence over allows for non-HTTPS requests, so the new public-read does **not** weaken HTTPS enforcement.

#### 1.13.3 Verify policy after deploy

Sandbox first:

```bash
npx ampx sandbox

# Then check the bucket policy
aws s3api get-bucket-policy \
  --bucket <sandbox-bucket-from-amplify_outputs.json> \
  --region ap-southeast-1 \
  | jq -r '.Policy' | jq .

# Spot-test guest read
curl -I https://<sandbox-bucket>.s3.ap-southeast-1.amazonaws.com/public/takcarly/takcarly_1.png
# Expect: HTTP/2 200 (after Phase 2.3 sync) or HTTP/2 404 (before sync). Must not be 403.

# Confirm non-public/ prefix is still denied
curl -I https://<sandbox-bucket>.s3.ap-southeast-1.amazonaws.com/protected/test.png
# Expect: HTTP/2 403
```

#### 1.13.4 If picking Option B instead

Implementation sketch (do not implement unless A is rejected):

```ts
// pages/photography/index.tsx getStaticProps
import { Amplify } from 'aws-amplify';
import { getUrl } from 'aws-amplify/storage';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs, { ssr: true });

const photosWithUrls = await Promise.all(
  photos.map(async (p) => ({
    ...p,
    url: (await getUrl({ path: p.s3key, options: { expiresIn: 3600 } })).url.toString(),
  })),
);
```

Caveats:
- Needs `@aws-amplify/adapter-nextjs` for ISR-safe SSR config (see [Amplify Next.js SSR guide](https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/)).
- Identity Pool unauth role needs `s3:GetObject` on `public/*` (already granted by `allow.guest.to(['read'])`).
- `expiresIn` max 3600s. ISR window is 60s by default → URL is fresh on each rebuild. If CloudFront / Amplify Hosting CDN caches the rendered HTML longer than 1h, links 403 client-side. Set explicit `Cache-Control: max-age=3000` on the page or shorten ISR.
- `aws-amplify` re-enters the client bundle (`Amplify.configure` is server-only, but tree-shaking is fragile). Verify `next build` First Load JS does not regress past 100KB (Phase 3.7 acceptance).

#### 1.13.5 Acceptance

- [x] Strategy decision recorded in PR description (A / B / C / D + reason) — Option A chosen 2026-05-05 (rationale in §1.13.1). PR body updated 2026-05-05.
- [x] If A: `aws s3api get-bucket-policy` on test-branch bucket shows `s3:GetObject` Allow on `public/*` only — verified 2026-05-05, `PublicReadOnPublicPrefix` statement scoped to `arn:aws:s3:::<bucket>/public/*`
- [x] If A: `curl -I https://<bucket>/public/<key>` returns 200 — verified 2026-05-05 on `public/takcarly/takcarly_1.png`
- [x] If A: `curl -I https://<bucket>/protected/test` returns 403 — verified 2026-05-05 (scope bounded)
- [ ] If B: not selected
- [x] `next.config.js` `remotePatterns` covers Gen 2 bucket hostname (test-branch hostname `amplify-d2ukbi00figpw1-ph-laijackylaistoragebucket-rivk3jxqwkow.s3.ap-southeast-1.amazonaws.com` — note: prod stack will spawn a different bucket; add prod hostname to `remotePatterns` before flipping `main` env vars)

### 1.13a SSR-runtime env vars (Amplify Hosting gotcha)

**Surfaced 2026-05-07** during browser smoke. `/photography` returned 500 on first request. CloudWatch `/aws/amplify/d2ukbi00figpw1` showed:

```
Error: APPSYNC_URL and APPSYNC_API_KEY are required to build /photography
  at getStaticProps (/tmp/app/.next/server/pages/photography.js:231:19)
  at Object.renderToHTML (/var/task/node_modules/next/dist/server/render.js:389:26)
  ...
```

Build prebuilt `/photography` (ISR 60s) cleanly because env vars **were** present at build. Static page got served on first request OK initially, but Cloudfront cache miss + ISR revalidate triggered the SSR Lambda to re-run `getStaticProps` in the runtime env — where Amplify branch env vars **do not propagate** by default. The pre-existing `shouldFailStaticBuild()` guard (in `pages/photography/index.tsx:121-123`) only allows missing env vars in dev → throws in production runtime → 500.

**Fix**: write Amplify branch env vars to `.env.production` in `amplify.yml` preBuild so Next.js bakes them into the standalone build artifact. Same artifact is loaded by the SSR Lambda; values are present at runtime.

```yaml
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - echo "APPSYNC_URL=$APPSYNC_URL" >> .env.production
        - echo "APPSYNC_API_KEY=$APPSYNC_API_KEY" >> .env.production
        - echo "STORAGE_BASE_URL=$STORAGE_BASE_URL" >> .env.production
```

Drawback: `APPSYNC_API_KEY` ends up in `.next/server/...` files. Acceptable because the schema's `apiKey` rule is read-only; the key is intended for unauthenticated public reads (same exposure model as Gen 1). Write paths use SigV4 (no key in build).

If a private key ever lands here (e.g. Lambda-authorizer shared secret in §1.4 option 1), switch to AWS-side env injection: AWS Systems Manager Parameter Store + a custom build-time fetch into `.env.production`.

#### 1.13a.1 Acceptance

- [x] `amplify.yml` preBuild writes 3 env vars into `.env.production` — verified 2026-05-07 (commit `93f974e`)
- [x] `/photography` returns 200 after deploy — verified via Playwright 2026-05-07 on test branch
- [x] CloudWatch `/aws/amplify/d2ukbi00figpw1` no longer logs the required-env error after job 15

### 1.13b `next.config.js` remotePatterns per-bucket (Phase 4 prep)

Each Amplify Hosting branch spawns a fresh Gen 2 stack with its own S3 bucket name. `next/image` requires the hostname in `remotePatterns` or returns 400 ("url not matched by domains or remotePatterns"). Test-branch hostname added 2026-05-07 (`amplify-d2ukbi00figpw1-ph-laijackylaistoragebucket-rivk3jxqwkow.s3.ap-southeast-1.amazonaws.com`).

**Phase 4 cutover requires**: append the **prod** stack's bucket hostname to `next.config.js` `remotePatterns` before flipping `main` env vars. Read prod hostname from `aws cloudformation describe-stacks --stack-name amplify-laijackylai-main-... --query 'Stacks[0].Outputs[?OutputKey==\`bucketName\`].OutputValue'` once the prod stack lands.

Alternative: switch to a wildcard pattern `**.s3.ap-southeast-1.amazonaws.com` (Next.js 13.x supports `**` in `hostname`) — covers all current and future Gen 2 bucket names without per-stack maintenance. Trade-off: any S3 bucket in `ap-southeast-1` becomes loadable by the optimizer. Acceptable for personal site; flag if scope changes.

### 1.14 Re-run pipeline-deploy verification

After 1.12 + 1.13 land:

1. Push to test branch `phase-1-amplify-gen2`.
2. Wait for build job — backend should incrementally update (no stack recreate).
3. Set/update branch env vars on the Amplify console for the test branch:
   - `APPSYNC_URL`, `APPSYNC_API_KEY` — re-read from CFN data stack outputs after rebuild.
   - `STORAGE_BASE_URL` — point at the test-branch Gen 2 bucket (`amplify-d2ukbi00figpw1-ph-laijackylaistoragebucket-rivk3jxqwkow.s3.ap-southeast-1.amazonaws.com`).
4. Smoke-test:
   - `https://phase-1-amplify-gen2.<app-id>.amplifyapp.com/projects` — page renders, all 3 takcarly images load (200, not 403/empty).
   - `/photography` — at least one photo renders (DynamoDB will be empty until Phase 2.2; acceptance is "page builds without throwing", not "shows photos").
5. After green: cleanup test branch (`aws amplify delete-branch --app-id d2ukbi00figpw1 --branch-name phase-1-amplify-gen2 --region ap-southeast-1`).

#### 1.14.1 Acceptance

- [x] Latest job on test branch = SUCCEED — job 15, 2026-05-07 (after env-var-runtime fix)
- [x] `/projects` returns 200 with all 3 images visible — verified via Playwright 2026-05-07; `/_next/image` returned 200 on all 3 `public/takcarly/...` URLs after `next.config.js` remotePatterns picked up the test-branch Gen 2 hostname
- [x] `/photography` builds without throwing; empty list rendered — verified via Playwright 2026-05-07 after `amplify.yml` preBuild bakes branch env vars into `.env.production` for SSR Lambda runtime; AppSync `listPhotos` returns `{ items: [] }` (DynamoDB empty pre-Phase 2.2)
- [x] Test branch deleted from Amplify Hosting — `phase-1-amplify-gen2` deleted 2026-05-10 after Phase 3 closeout

---

## Phase 2 — Data Migration

**State entering Phase 2 (2026-05-07 post-cutover):**

- Prod Gen 2 stack live on `main` (Amplify app `d2ukbi00figpw1`, job 59 SUCCEED).
- Prod Gen 2 bucket `amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc` already populated via `aws s3 sync` from Gen 1 prod bucket (74 source / 69 target objects, 5-object diff = directory markers, no real photo loss). **§2.3 S3 sync therefore already executed for prod.**
- Prod Gen 2 DynamoDB `Photo` table empty. `/photography` returns 200 but renders an empty list. **§2.2 migration is the remaining write.**
- `next.config.js` `remotePatterns` already covers prod hostname (commit `d5c5d4d`).
- `main` branch env vars set on Amplify Hosting console (`APPSYNC_URL`, `APPSYNC_API_KEY`, `STORAGE_BASE_URL`); `amplify.yml` preBuild bakes them into `.env.production` for SSR Lambda runtime (§1.13a).
- §1.12.3 read-side compatibility shim is live in production. Phase 2.2 normalization writes `public/`-prefixed s3keys to Gen 2 → §2.5 then removes the shim.

**Target stack decision** (revised 2026-05-07):

- ~~Sandbox-first~~ — sandbox is **stale** (sandbox `amplify_outputs.json` last regenerated pre-§1.12.1 storage path change; sandbox stack still has `photos/*` access path, not `public/*`). Running migration into sandbox without re-deploying it would not exercise the prod-shaped schema. Skip unless sandbox is freshly re-deployed via `npx ampx sandbox` first.
- **Prod-direct (default)** — single migration run targeting prod AppSync (`https://dxrdpkha7raqradp27aqqgnkui.appsync-api.ap-southeast-1.amazonaws.com/graphql`). Idempotency wrapper added in §2.2 makes re-runs safe; first run also serves as the dry run.

**Phase 1 learnings carried into Phase 2 (codex MUST honor):**

1. **plaiceholder fails on 403/XML when target bucket empty** (§1.13a postmortem). Mitigation: §2.3 must complete *before* any pipeline-deploy fires, and it already has for prod. If anyone re-runs §2.3 against an empty target, do NOT push a backend-touching commit until S3 sync finishes.
2. **Amplify Hosting branch env vars only reach BUILD, not SSR runtime** (§1.13a). Already mitigated via `amplify.yml` preBuild bake. No action in Phase 2 unless adding new env vars.
3. **Pipeline-deploy webhook auto-fires on every `main` push.** Pause auto-build on `main` for the migration window (§2.0.3) so a stray commit cannot redeploy the backend mid-migration and rotate `STORAGE_BASE_URL`.
4. **Schema has no GSI on `s3key`.** §2.2 idempotency uses `listPhotos(filter: { s3key: { eq } })` which scans — O(N) per row, O(N²) total. Acceptable for ~70 rows; add a `secondaryIndexes` directive on the schema if the table grows past low thousands.
5. **IAM `appsync:GraphQL` grant is per-API-id.** §1.11 verified the sandbox API id only. Prod AppSync API id is **different** — re-grant before §2.2 runs (§2.0.2).
6. **DynamoDB rows store bare keys; S3 stores `public/`-prefixed keys** (§1.12.3 audit). §2.2 normalizes on write so Gen 2 rows have explicit `public/` prefix — after which §2.5 removes the read-side shim.

### 2.0 Pre-flight (BLOCKING — run before §2.1)

#### 2.0.1 Verify prod stack identifiers

Confirm the four prod-stack values §2.x commands depend on. Source of truth: prod stack CloudFormation outputs.

```bash
# Capture once into the shell session; re-use across §2.1–§2.4
PROD_APPSYNC_URL='https://dxrdpkha7raqradp27aqqgnkui.appsync-api.ap-southeast-1.amazonaws.com/graphql'
PROD_APPSYNC_API_KEY='da2-svpb6qfiivb4zlbgjnjxzglnu4'
PROD_BUCKET='amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc'
PROD_APPSYNC_API_ID="$(echo "$PROD_APPSYNC_URL" | awk -F'[/.]' '{print $4}')"   # dxrdpkha7raqradp27aqqgnkui
GEN1_TABLE='Photo-gbzpma2elvdxnjqehhqdnf5wmy-main'
GEN1_BUCKET='laijackylai-storage-4ba35e5623621-main'
REGION='ap-southeast-1'

# Sanity-check derived value
echo "$PROD_APPSYNC_API_ID"
# expect: dxrdpkha7raqradp27aqqgnkui
```

If any value drifts from the doc (e.g. stack rebuild produces a new bucket suffix), re-read from prod CFN before continuing:

```bash
aws cloudformation describe-stacks \
  --stack-name amplify-laijackylai-main-branch-... \
  --region "$REGION" \
  --query 'Stacks[0].Outputs'
```

#### 2.0.2 Verify IAM `appsync:GraphQL` grant on prod API

§1.11.3 verified sandbox; prod has a different API id. Without the grant the migration script returns `NotAuthorizedException` on `createPhoto`.

```bash
# Confirm caller identity
aws sts get-caller-identity
# Note the ARN (expect: arn:aws:iam::232665835945:user/amplify-5dZdc per §1.11.3).

# Confirm the grant covers the prod API. Either the existing wildcard policy
# (`appsync:GraphQL` on `arn:aws:appsync:ap-southeast-1:232665835945:apis/*`)
# already covers it, OR an API-specific policy needs an extra Resource.
aws iam list-attached-user-policies --user-name amplify-5dZdc
aws iam list-user-policies --user-name amplify-5dZdc

# For each managed/inline policy that grants appsync:GraphQL, dump it and grep
# for the prod API id or `*`. If neither matches, attach an inline policy:
aws iam put-user-policy \
  --user-name amplify-5dZdc \
  --policy-name appsync-graphql-prod \
  --policy-document "$(cat <<EOF
{ "Version": "2012-10-17", "Statement": [{
    "Effect": "Allow",
    "Action": "appsync:GraphQL",
    "Resource": "arn:aws:appsync:${REGION}:232665835945:apis/${PROD_APPSYNC_API_ID}/*"
}] }
EOF
)"
```

Smoke-test the grant **before** the bulk run. Plain `node` cannot resolve `.ts` imports, so use `ts-node -e`:

```bash
APPSYNC_URL="$PROD_APPSYNC_URL" \
AWS_REGION="$REGION" \
npx ts-node -e "
import { createSignedGraphqlClient } from './scripts/blur';
(async () => {
  const gql = createSignedGraphqlClient(process.env.APPSYNC_URL!);
  const d = await gql('query { listPhotos(limit: 1) { items { id } } }', {});
  console.log('OK', JSON.stringify(d));
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
"
```

Expect `OK {"listPhotos":{"items":[]}}` (or `{...items:[<rows>]}` if §2.2 was already partially run). If `NotAuthorizedException` / `UnauthorizedException`, the IAM grant did not propagate yet; wait 30s and retry. If `Could not find a declaration file for module 'X'`, ensure `tsconfig.json` `compilerOptions.esModuleInterop` is true (already verified in repo).

#### 2.0.3 Pause `main` auto-build

Prevent a stray commit (or a webhook on this PR being merged) from redeploying the backend during the migration window. CFN drift mid-write would rotate AppSync URL / API key / bucket name and orphan the export.

```bash
aws amplify update-branch \
  --app-id d2ukbi00figpw1 \
  --branch-name main \
  --no-enable-auto-build \
  --region "$REGION"

# Verify
aws amplify get-branch \
  --app-id d2ukbi00figpw1 \
  --branch-name main \
  --region "$REGION" \
  --query 'branch.enableAutoBuild'
# expect: false
```

Re-enable in §2.4 acceptance after migration verifies green.

#### 2.0.4 Snapshot Gen 1 row count (drift guard)

```bash
aws dynamodb scan \
  --table-name "$GEN1_TABLE" \
  --region "$REGION" \
  --select COUNT \
  --query 'Count'
```

Capture the integer. §2.4 compares Gen 2 count to this number — must match exactly.

#### 2.0.5 Acceptance

- [x] Shell session has `PROD_APPSYNC_URL`, `PROD_APPSYNC_API_KEY`, `PROD_BUCKET`, `PROD_APPSYNC_API_ID`, `GEN1_TABLE`, `GEN1_BUCKET`, `REGION` exported — 2026-05-09
- [x] `aws sts get-caller-identity` ARN granted `appsync:GraphQL` on prod API id (verified by signed `listPhotos` returning 200, not 401) — 2026-05-09
- [x] `aws amplify get-branch ... --query 'branch.enableAutoBuild'` returns `false` (paused before migration; re-enabled post-merge) — 2026-05-09
- [x] Gen 1 row count captured (record below) — 66

```
Gen 1 row count snapshot: 66  (date: 2026-05-09)
```

### 2.1 Export from Gen 1 DynamoDB

Gen 1 prod table: `$GEN1_TABLE` (= `Photo-gbzpma2elvdxnjqehhqdnf5wmy-main`).

**Freeze writes** is implicit because `/api/blur` no longer exists (removed in Phase 1.10). Auto-build pause from §2.0.3 covers the redeploy risk.

Verify single-row shape before bulk run:

```bash
aws dynamodb scan \
  --table-name "$GEN1_TABLE" \
  --region "$REGION" \
  --max-items 1 | jq '.Items[0]'
# expect keys: s3key (S), type (S), aspectRatio (S), blurredBase64 (S, optional)
```

Confirm bare-key shape (per §1.12.3 audit):

```bash
aws dynamodb scan \
  --table-name "$GEN1_TABLE" \
  --region "$REGION" \
  --projection-expression s3key \
  | jq -r '.Items[].s3key.S' \
  | grep -c '^public/'
# expect: 0  (none of the Gen 1 rows are pre-prefixed; the migration script adds the prefix)
```

Then full export. `aws dynamodb scan` paginates at 1MB / 1000 items per call; for ~70 rows a single page suffices, but use the loop pattern for safety:

```bash
aws dynamodb scan \
  --table-name "$GEN1_TABLE" \
  --region "$REGION" \
  --output json \
  > gen1-photos.json

# Sanity-check the export matches the live count
EXPORTED_COUNT=$(jq '.Items | length' gen1-photos.json)
LIVE_COUNT=$(aws dynamodb scan --table-name "$GEN1_TABLE" --region "$REGION" --select COUNT --query 'Count')
echo "exported=$EXPORTED_COUNT live=$LIVE_COUNT"
# Must match. If LIVE_COUNT > EXPORTED_COUNT, the scan paginated; re-export with
# the LastEvaluatedKey loop or use `aws dynamodb export-table-to-point-in-time`.
```

`gen1-photos.json` is gitignored (large; contains base64 blur previews). Do **not** commit.

### 2.2 Migration script

Reuse `scripts/blur.ts` helpers (already export `createSignedGraphqlClient` for write, `createApiKeyGraphqlClient` for read). The schema's `apiKey` rule allows `read` only, so write goes via SigV4 against the `'iam'` rule (verified §1.11.3 sandbox + §2.0.2 prod).

**Idempotency contract** (per §2 Phase 1 learning #4): every iteration first runs `listPhotosByS3Key` against the target stack. If a row with that `s3key` already exists, skip the write. This makes re-runs after partial failure safe and lets the same script work for sandbox dry-runs followed by prod runs without manual truncation. Re-uses the `listByS3KeyQuery` already defined in `scripts/blur.ts`; export it from blur.ts (currently module-private).

#### 2.2.1 Export `listByS3KeyQuery` from `scripts/blur.ts`

Edit `scripts/blur.ts:97`:

```ts
// Before
const listByS3KeyQuery = /* GraphQL */ `
// After
export const listByS3KeyQuery = /* GraphQL */ `
```

No other change to `blur.ts`. The query is already correctly shaped for the migration script.

#### 2.2.2 Create `scripts/migrate-photos.ts`

```ts
import gen1 from '../gen1-photos.json';
import { loadEnvConfig } from '@next/env';
import {
  createApiKeyGraphqlClient,
  createSignedGraphqlClient,
  listByS3KeyQuery,
  validateAwsCredentials,
} from './blur';

loadEnvConfig(process.cwd());

const createPhotoMutation = /* GraphQL */ `
  mutation CreatePhoto($input: CreatePhotoInput!) {
    createPhoto(input: $input) {
      id
    }
  }
`;

type Gen1Item = {
  s3key: { S: string };
  type: { S: string };
  aspectRatio: { S: string };
  blurredBase64?: { S: string };
};

const main = async () => {
  // Fail fast if local creds missing (same pattern as scripts/blur.ts)
  await validateAwsCredentials();

  // Read via API key (cheap, no SigV4 cost), write via signed IAM path.
  const readGql = createApiKeyGraphqlClient();
  const writeGql = createSignedGraphqlClient();

  const items = (gen1 as { Items: Gen1Item[] }).Items;
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    // Phase 1 §1.12.3 audit: Gen 1 stores bare keys ("photos/film/x.jpg").
    // Normalize to "public/..." here so Gen 2 rows match the actual S3 layout
    // and the §1.12.3 read-side shim becomes dead code (removed in §2.5).
    const rawKey = item.s3key.S;
    const s3key = rawKey.startsWith('public/') ? rawKey : `public/${rawKey}`;

    try {
      // Idempotency check — skip if this s3key already exists in the target.
      // The schema has no GSI on s3key (see Phase 2 learning #4), so this
      // filter scans the table — O(N²) total. Acceptable for ~70 rows; add
      // `secondaryIndexes` on the schema if the table grows past low thousands.
      const existing = await readGql(listByS3KeyQuery, { s3key });
      if (existing.listPhotos?.items?.length) {
        skipped += 1;
        continue;
      }

      await writeGql(createPhotoMutation, {
        input: {
          s3key,
          type: item.type.S,
          aspectRatio: item.aspectRatio.S,
          blurredBase64: item.blurredBase64?.S ?? null,
        },
      });
      created += 1;
    } catch (err) {
      failed += 1;
      console.error(`Failed: ${s3key}`, err);
    }
  }

  console.log(`Migration complete. Created=${created} Skipped=${skipped} Failed=${failed}.`);
  if (failed > 0) process.exitCode = 1;
};

void main();
```

Add to `package.json` `scripts`:

```json
"migrate-photos": "ts-node scripts/migrate-photos.ts"
```

#### 2.2.3 Point `.env.local` at prod **before running**

Default `.env.local` points at sandbox. For prod-direct migration, override:

```bash
# Confirm current pointer
grep '^APPSYNC_URL=' .env.local
# expect: sandbox URL (kkjkxcxd3bf7rcp5vne6njng6m...)

# Run migration with prod values inline (does NOT mutate .env.local on disk)
APPSYNC_URL="$PROD_APPSYNC_URL" \
APPSYNC_API_KEY="$PROD_APPSYNC_API_KEY" \
AWS_REGION="$REGION" \
npm run migrate-photos
```

Inline override is preferred over editing `.env.local` so the working tree stays sandbox-pointed for `scripts/blur.ts` dev use after migration.

#### 2.2.4 Expected output

```
Migration complete. Created=N Skipped=0 Failed=0.
```

Where `N` equals the Gen 1 row count snapshot from §2.0.4. If `Failed > 0`:

- Exit code = 1 (script enforces).
- Re-run after fixing — idempotency skips the rows that succeeded on the previous attempt.

If `Created + Skipped < Gen 1 count`: scan pagination missed rows during §2.1 export. Re-run §2.1 with the `LastEvaluatedKey` loop and re-execute §2.2.

#### 2.2.5 Acceptance

- [x] `scripts/blur.ts` exports `listByS3KeyQuery` (line 97)
- [x] `scripts/migrate-photos.ts` created per §2.2.2
- [x] `package.json` has `"migrate-photos"` script
- [x] `npm run migrate-photos` against prod exits 0, `Failed=0` — `Created=66 Skipped=0 Failed=0` 2026-05-09
- [x] `Created + Skipped` equals the §2.0.4 Gen 1 count snapshot — 66 == 66
- [x] Blocked-on chain satisfied: §1.11 + §2.0 acceptance both green

### 2.3 S3 photo migration

Source: `$GEN1_BUCKET` (= `laijackylai-storage-4ba35e5623621-main`, Gen 1 prod).
Target: `$PROD_BUCKET` (= `amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc`, Gen 2 prod, current bucket name as of 2026-05-07).

Prefix is `public/` on both sides per §1.12.1 + §1.12.4.

**Status 2026-05-07: ALREADY EXECUTED for prod** during the prod cutover recovery. `aws s3 sync` ran with no `--delete`, idempotent re-runs are safe (sync only copies missing/changed objects).

```bash
aws s3 sync \
  "s3://${GEN1_BUCKET}/public/" \
  "s3://${PROD_BUCKET}/public/" \
  --region "$REGION"
```

#### 2.3.1 Re-verify count parity

Even though the sync already ran, re-verify before declaring §2.4 acceptance — Gen 1 may have gained objects since the original sync:

```bash
SRC_COUNT=$(aws s3 ls "s3://${GEN1_BUCKET}/public/" --recursive --region "$REGION" | grep -v '/$' | wc -l | tr -d ' ')
DST_COUNT=$(aws s3 ls "s3://${PROD_BUCKET}/public/" --recursive --region "$REGION" | grep -v '/$' | wc -l | tr -d ' ')
echo "src=$SRC_COUNT dst=$DST_COUNT"
```

Filter `grep -v '/$'` excludes directory placeholder objects (the source of the original 5-object diff). `src` and `dst` should now match. If not, re-run the sync — it is idempotent.

#### 2.3.2 Spot-check 5 random objects

```bash
aws s3 ls "s3://${PROD_BUCKET}/public/" --recursive --region "$REGION" \
  | awk '{print $4}' | grep -v '/$' | shuf -n 5 \
  | while read -r key; do
      url="https://${PROD_BUCKET}.s3.${REGION}.amazonaws.com/${key}"
      printf '%s -> %s\n' "$key" "$(curl -sI "$url" | head -1)"
    done
```

Each line should report `HTTP/1.1 200`. 403 means §1.13 bucket policy did not propagate or `$PROD_BUCKET` drifted; re-check `aws s3api get-bucket-policy`.

### 2.4 Phase 2 acceptance

**Status (2026-05-09): all acceptance items satisfied. PR #38 squash-merged → `ba16b05`. Prod pipeline-deploy job 60 SUCCEED 21:38:51, 13m42s runtime. Smoke test on `https://main.d2ukbi00figpw1.amplifyapp.com/photography` returned HTTP 200 with 32 unique S3 image URLs in SSR HTML; sample S3 object also 200.**

- [x] §1.11 preflight all green — verified 2026-05-04
- [x] §2.0 pre-flight all green (env shell, IAM grant, auto-build paused, Gen 1 count snapshot) — 2026-05-09
- [x] Target stack decision logged: prod-direct (sandbox stale per Phase 2 header)
- [x] **Photo count matches between Gen 1 and Gen 2 DynamoDB.** — 66 == 66 confirmed via signed `listPhotos` paginate (curl-based; Python urllib hit local SSL verify error)
  - Gen 2 count via signed `listPhotos` (paginate `nextToken` if total > 1000):
    ```bash
    APPSYNC_URL="$PROD_APPSYNC_URL" AWS_REGION="$REGION" \
      ts-node -e "
        import { createSignedGraphqlClient } from './scripts/blur';
        (async () => {
          const gql = createSignedGraphqlClient('$PROD_APPSYNC_URL');
          let total = 0; let nextToken = null;
          do {
            const d = await gql('query (\$nt: String) { listPhotos(limit: 1000, nextToken: \$nt) { items { id } nextToken } }', { nt: nextToken });
            total += d.listPhotos.items.length; nextToken = d.listPhotos.nextToken;
          } while (nextToken);
          console.log('gen2 count =', total);
        })();
      "
    ```
  - Compare to §2.0.4 Gen 1 snapshot. Equal = pass.
- [x] **All S3 objects copied** — §2.3.1 parity confirmed (Phase 1 work)
- [x] **Spot-check 5 photos load** via §2.3.2 — sample `public/photos/film/000039480033.jpg` HTTP 200; SSR HTML contains 32 unique image URLs all 200
- [x] **Migration script exit code 0**, `Failed=0` — `Created=66 Skipped=0 Failed=0` on first run
- [x] **Every Gen 2 `Photo` row's `s3key` starts with `public/`** — verified via AppSync paginate (66/66 prefixed); §2.2 normalization fired correctly
  ```bash
  GEN2_TABLE=$(aws cloudformation list-stack-resources \
    --stack-name $(aws cloudformation list-stacks --region "$REGION" \
      --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
      --query "StackSummaries[?contains(StackName, 'amplify-laijackylai-main') && contains(StackName, 'data')].StackName | [0]" --output text) \
    --region "$REGION" \
    --query "StackResourceSummaries[?ResourceType=='AWS::DynamoDB::Table' && contains(LogicalResourceId, 'Photo')].PhysicalResourceId | [0]" --output text)
  echo "$GEN2_TABLE"

  aws dynamodb scan --table-name "$GEN2_TABLE" --region "$REGION" \
    --projection-expression s3key \
    | jq -r '.Items[].s3key.S' \
    | grep -vc '^public/'
  ```
  Expect: `0`.
- [x] **Browser smoke** — `https://main.d2ukbi00figpw1.amplifyapp.com/photography` HTTP 200, 32 unique S3 image URLs in HTML (rest paginated/lazy), 0 console errors. ISR re-build via job 60 (post-merge auto-fire).
- [x] **Re-enable `main` auto-build** — verified `enableAutoBuild=True` post-merge:
  ```bash
  aws amplify update-branch \
    --app-id d2ukbi00figpw1 --branch-name main \
    --enable-auto-build --region "$REGION"
  ```

### 2.5 Remove `publicStorageUrl()` shim (Option 2 cleanup)

**Status (2026-05-09): done.** Shim removed in same PR #38 / commit `ba16b05` after §2.4 verified all 66 rows `public/`-prefixed.

The shim added in §1.12.3 normalizes bare `photos/...` keys at read time. After Phase 2.2 migration writes every Gen 2 row with the explicit `public/` prefix, the read-side normalization is dead code and should be removed so the schema convention is the only source of truth.

Edit `pages/photography/index.tsx:132-141` and `pages/projects/index.tsx:247-256`:

```ts
// Before (shim)
const publicStorageUrl = (key: string) => {
  const storageBaseUrl = getStorageBaseUrl();
  const normalizedKey = key.startsWith('public/') ? key : `public/${key}`;
  const encodedKey = normalizedKey.split('/').map(encodeURIComponent).join('/');
  return `${storageBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
};

// After (post-migration)
const publicStorageUrl = (key: string) => {
  const storageBaseUrl = getStorageBaseUrl();
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `${storageBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
};
```

Drop the "prepends public/ to bare keys" test case in `tests/ProjectsPage.test.tsx`. Keep the "preserves public/ prefixes" case — it now covers the only supported input shape.

#### 2.5.1 Acceptance

- [x] Every Gen 2 `Photo` row's `s3key` starts with `public/` — 66/66 verified before edit
- [x] Comment block above each `publicStorageUrl` removed
- [x] `key.startsWith('public/')` branch removed from both files (`pages/photography/index.tsx`, `pages/projects/index.tsx`)
- [x] `tests/ProjectsPage.test.tsx` "prepends public/ to bare keys" case deleted
- [x] `npm run lint && npm test && npm run build` green — 33/33 tests pass 2026-05-09
- [x] Browser smoke `/photography` post-deploy — sample `https://amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc.s3.ap-southeast-1.amazonaws.com/public/photos/film/000039480033.jpg` returned HTTP 200

### 2.6 Codex execution runbook (linear order)

This is the canonical step-by-step for a Codex agent. **Do not reorder.** Each step gates the next.

```
1.  Read §2.0; export shell variables (§2.0.1)
2.  Verify IAM grant on prod API (§2.0.2)            [BLOCKER if FAIL]
3.  Pause main auto-build (§2.0.3)                   [BLOCKER if FAIL]
4.  Snapshot Gen 1 row count (§2.0.4); record below
5.  Export Gen 1 DynamoDB → gen1-photos.json (§2.1)  [verify exported == live count]
6.  Re-verify S3 parity (§2.3.1)                     [src must == dst]
7.  Spot-check 5 S3 objects (§2.3.2)                 [all must be 200]
8.  Export listByS3KeyQuery from scripts/blur.ts (§2.2.1)
9.  Create scripts/migrate-photos.ts (§2.2.2)
10. Add migrate-photos npm script (§2.2.2)
11. Run migration with prod env inline (§2.2.3)      [Failed must == 0]
12. Verify Gen 2 count == Gen 1 count (§2.4 first box)
13. Verify all Gen 2 s3keys start with public/ (§2.4)
14. Browser smoke /photography on prod (§2.4)
15. Re-enable main auto-build (§2.4 last box)
16. (Optional, blocked on §2.4 green) §2.5 shim removal
17. (Optional) Delete Phase 1 test branch:
    aws amplify delete-branch --app-id d2ukbi00figpw1 \
      --branch-name phase-1-amplify-gen2 --region ap-southeast-1
```

**Failure handling per step:**

| Step fails | Action |
|------------|--------|
| 2 (IAM) | Apply policy in §2.0.2; wait 30s; retry. Do not proceed. |
| 5 (export count mismatch) | Re-export with pagination loop; do not write to Gen 2 with a partial export. |
| 6 (S3 parity) | Re-run `aws s3 sync` (idempotent); do not proceed if still diverged after 2 attempts. |
| 11 (migration `Failed > 0`) | Read stderr per-row; common causes: NotAuthorized (re-check step 2), throttling (DynamoDB write capacity — bursts can throttle; insert `await new Promise(r => setTimeout(r, 50))` between iterations if hit). Re-run; idempotency skips successful rows. |
| 12 (count mismatch) | Diff `gen1-photos.json` keys vs Gen 2 `listPhotos` keys; re-run migration on the missing set only. |
| 13 (rows missing `public/`) | A code path bypassed the normalizer in §2.2.2 — **do not** ship §2.5 shim removal until this is `0`. |
| 14 (browser 500 / 0 photos) | Check CloudWatch `/aws/amplify/d2ukbi00figpw1`; common cause is ISR cache stale — wait 60s + hard reload. If still failing, check `STORAGE_BASE_URL` env var on `main` branch matches `$PROD_BUCKET`. |
| 15 (auto-build re-enable) | Verify with `aws amplify get-branch ... enableAutoBuild`. Critical — leaving `false` in prod silently breaks future deploys. |

**Recording:**

```
Gen 1 row count snapshot (step 4):       66    date: 2026-05-09
Migration script result (step 11):       Created=66 Skipped=0 Failed=0
Gen 2 count after migration (step 12):   66
Gen 2 rows missing public/ (step 13):    0    (must be 0)
Browser smoke (step 14):                 PASS
Auto-build re-enabled (step 15):         true
```

**Post-merge:**
- PR #38 squash-merged 2026-05-09 → `ba16b05`
- Pipeline-deploy job 60 SUCCEED 21:38:51 (13m42s)
- Step 16 (§2.5 shim removal) — DONE in same PR
- Step 17 (delete `phase-1-amplify-gen2` Amplify Hosting branch) — DONE 2026-05-10

---

## Phase 3 — Client Refactor (Server-Side Fetch)

Drop DataStore from browser. AppSync called server-side via `getStaticProps` + ISR.

### 3.0 ISR verification gate (BLOCKING)

Phase 3.3 hard-depends on Amplify Hosting Next.js SSR adapter supporting `getStaticProps` + `revalidate` + `res.revalidate()`.

Run the smoke test before any Phase 3 work:

1. Deploy throwaway `pages/test-isr.tsx` with `getStaticProps` + `revalidate: 30`.
2. Hit twice across 30s window — confirm regeneration.
3. POST to `/api/test-revalidate` — confirm targeted revalidation.

Outcome:

- ✅ all three pass → continue Phase 3 as written.
- ❌ any fail → pivot to `getServerSideProps` + `Cache-Control: s-maxage=60, stale-while-revalidate` for Phase 3.3, drop Phase 3.4 entirely. Re-evaluate Vercel migration if perf goal (3.7 acceptance) is missed.

Status (2026-05-09): time-based ISR satisfied **on prod** — pipeline-deploy job 60 succeeded post-merge and `/photography` rendered 32 photo URLs from Gen 2 DynamoDB via `getStaticProps`. `next build` reports `/photography (ISR: 60 Seconds)`. On-demand `res.revalidate()` path **moot** (3.4 dropped — no `/api/revalidate` route).

### 3.1 Remove Gen 1 client artifacts

**Done in Phase 1.10.1 + 1.10.3.** No-op here. Re-verify acceptance grep:

```bash
grep -rn "from 'aws-amplify'" pages components tests src 2>/dev/null
# Expected: zero hits. Allowed only in scripts/blur.ts, scripts/migrate-photos.ts.
```

### 3.2 `pages/_app.tsx`

**Done in Phase 1.10.4.** No-op here.

### 3.3 Photography page server fetch

**Done (pulled forward in Phase 1.10).** `pages/photography/index.tsx` now exports `getStaticProps` w/ `revalidate: 60` and uses x-api-key against AppSync.

Reference shape:

```tsx
import type { GetStaticProps } from 'next';

type Photo = { s3key: string; type: string; aspectRatio: string; blurredBase64: string | null };

export const getStaticProps: GetStaticProps<{ photos: Photo[] }> = async () => {
  const query = /* GraphQL */ `
    query ListPhotos { listPhotos { items { s3key type aspectRatio blurredBase64 } } }
  `;
  const res = await fetch(process.env.APPSYNC_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.APPSYNC_API_KEY!,
    },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return { props: { photos: json.data.listPhotos.items }, revalidate: 60 };
};

export default function Photography({ photos }: { photos: Photo[] }) {
  // existing render logic, props now from server
}
```

Carry-over (also in 1.9 carry-over): the live implementation swallows errors and returns `{ photosData: [] }` (lines 173-175). Throw in non-dev contexts to surface AppSync outages at build time.

### 3.4 On-demand revalidate (dropped)

Status (2026-05-04): **dropped**. 60s ISR window is acceptable for blur-sync cadence (manual photo additions, infrequent). `REVALIDATE_TOKEN` removed from `.env.local` 2026-05-04. No `pages/api/revalidate.ts` route. If on-demand revalidation needed later, restore from git history.

### 3.5 Move `/api/blur` to local `scripts/blur.ts`

Per Phase 0.8 decision and Phase 1.4 schema choice (option 2: IAM-signed). Public API surface goes away — `BLUR_API_TOKEN` no longer needed.

Status (2026-05-09): **done + IAM write path proven against prod**. `pages/api/blur.tsx` deleted; `scripts/blur.ts` uses `SignatureV4` + `defaultProvider()` against `service: 'appsync'`. The Phase 2 migration (`scripts/migrate-photos.ts`) reused `createSignedGraphqlClient` from `scripts/blur.ts` and successfully wrote 66 rows to prod AppSync — IAM creds + schema `iam` rule confirmed authorize writes.

Steps:

1. Create `scripts/blur.ts` (port logic from `pages/api/blur.tsx`).
2. Delete `pages/api/blur.tsx`.
3. Drop `BLUR_API_TOKEN` from Amplify Hosting env vars + `.env.local` after the script works end-to-end.
4. Add `"blur": "ts-node scripts/blur.ts"` to `package.json` `scripts`.
5. Add `@aws-crypto/sha256-js`, `@aws-sdk/signature-v4`, `@aws-sdk/protocol-http`, `@aws-sdk/credential-provider-node` as devDeps for IAM signing.

```ts
// scripts/blur.ts
import fs from 'fs/promises';
import sharp from 'sharp';
import sizeOf from 'image-size';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';

const APPSYNC_URL = process.env.APPSYNC_URL!;
const REGION = process.env.AWS_REGION ?? 'ap-southeast-1';
const HOST = new URL(APPSYNC_URL).host;

const signer = new SignatureV4({
  service: 'appsync',
  region: REGION,
  credentials: defaultProvider(),
  sha256: Sha256,
});

async function gql(query: string, variables: Record<string, unknown>) {
  const body = JSON.stringify({ query, variables });
  const req = new HttpRequest({
    method: 'POST',
    protocol: 'https:',
    hostname: HOST,
    path: '/graphql',
    headers: { 'content-type': 'application/json', host: HOST },
    body,
  });
  const signed = await signer.sign(req);
  const res = await fetch(APPSYNC_URL, {
    method: 'POST',
    headers: signed.headers as Record<string, string>,
    body,
  });
  return res.json();
}

async function main() {
  const folder = './assets/images';
  const files = await fs.readdir(folder);
  for (const file of files) {
    if (file.startsWith('.DS_Store')) continue;
    // ... existing sharp/sizeOf logic from pages/api/blur.tsx ...
    // call gql(LIST_BY_S3KEY) → gql(CREATE_PHOTO) or gql(UPDATE_PHOTO)
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Notes:
- Local AWS creds (env vars, `~/.aws/credentials`, or SSO) must have `appsync:GraphQL` on the Gen 2 API.
- No long-lived secret stored anywhere.
- If option 1 (Lambda authorizer) was picked in 1.4 instead, replace signer block with a static header `'x-api-key': process.env.APPSYNC_ADMIN_KEY!`.

### 3.6 Tests

Concrete file list (verified against current `tests/`):

- `tests/BlurApi.test.ts` — **delete** (route is gone). Replace with a `scripts/blur.test.ts` covering the `sharp` + diff-vs-existing logic with `fetch` mocked.
- `tests/App.test.tsx` — drop `Amplify.configure` + `aws-exports` mocks.
- `tests/PhotographyPage.test.tsx` — switch from `DataStore` mock to `getStaticProps` props injection; assert render from passed `photos`.
- Add `tests/PhotographyServerFetch.test.ts` — unit-test the `getStaticProps` `fetch` call (mock global `fetch`, assert AppSync URL + headers + body).
- Grep for residual imports before commit:

```bash
grep -rn "from 'aws-amplify'\|from '../src/models'\|from '../../src/models'\|aws-exports" tests/ pages/ components/
```

Expected after Phase 3: zero hits in `tests/`, `pages/`, `components/`. Only `scripts/blur.ts` (and the migration script) may import `aws-amplify` v6 helpers.

### 3.7 Phase 3 acceptance

**Status (2026-05-10): Phase 3 closed. Perf fix `3ac8ccf` deployed (main job 62 SUCCEED). Prod Lighthouse 34 → 78 (+44pt), well over the ≥10pt-improvement fallback. Absolute >90 target not hit; accepted with note — see acceptance below.**

Capture baseline before starting Phase 3 so the bundle / Lighthouse goals are measurable:

```bash
npm run build  # record .next/build output: First Load JS for /photography
npm run test:lighthouse  # record current perf score
```

Save numbers in `docs/phase3-baseline.txt`.

- [x] Baseline captured (`docs/phase3-baseline.txt` exists) — current post-cutover figure: `/photography 2.15 kB / 81 kB First Load JS`; pre-cutover baseline lost, backfill from git history only if comparison wanted
- [x] `aws-amplify` removed from client bundle — verified by `grep`: zero importers in pages/components/tests/src
- [x] Photography page First Load JS < 100KB — `81 kB` shown in `next build`
- [x] ISR revalidate works (time-based) — prod `/photography` re-rendered with Gen 2 data after job 60 SUCCEED 2026-05-09. On-demand path n/a (3.4 dropped)
- [x] All tests pass — 33 / 13 suites, 2026-05-09
- [x] Lighthouse perf score >90 on `/photography` (or ≥10pt improvement vs baseline) — **accepted at 78 with note**. Prod baseline 2026-05-10: `34` (FCP 9.0s, LCP 15.9s, TBT 980ms, byte weight 116,926 KiB). Post-fix prod (`3ac8ccf`, main job 62 SUCCEED, measured 2026-05-10T23:07Z): `78` (FCP 1.1s, LCP 4.7s, TBT 50ms, CLS 0.132, SI 3.0s, byte weight 420 KiB). Improvement +44pt — exceeds ≥10pt fallback criterion. Absolute >90 target missed; remaining headroom is LCP (hero image dimensions/format) + CLS 0.132 (image aspect-ratio reservation). Tracked as future perf work outside migration scope. Full numbers in `docs/phase3-baseline.txt`.

---

## Phase 4 — Decommission Gen 1

Only after Phase 3 in production for one week with no rollback.

### 4.1 Tear down Gen 1 stack

`amplify delete` requires Gen 1 CLI + local `amplify/backend/` state, but `amplify/backend/` is gitignored — likely already gone on this machine. Use CloudFormation directly.

Stack identifiers (from `docs/gen1-api-snapshot.json` + `docs/gen1-storage-snapshot.json`):

- AppSync API id: `gbzpma2elvdxnjqehhqdnf5wmy`
- S3 bucket: `laijackylai-storage-4ba35e5623621-main` (must be emptied before stack deletion)
- DynamoDB tables: `Photo-gbzpma2elvdxnjqehhqdnf5wmy-main`, `AmplifyDataStore-gbzpma2elvdxnjqehhqdnf5wmy-main`

Steps:

```bash
# 1. List the Gen 1 root stack and nested stacks (do not delete yet)
aws cloudformation list-stacks --region ap-southeast-1 \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  | jq '.StackSummaries[] | select(.StackName | startswith("amplify-laijackylai-main"))'

# 2. Empty the S3 bucket (CloudFormation cannot delete non-empty buckets)
aws s3 rm s3://laijackylai-storage-4ba35e5623621-main --recursive --region ap-southeast-1

# 3. Delete the root stack — nested stacks (auth/api/storage) tear down with it
aws cloudformation delete-stack \
  --stack-name <amplify-laijackylai-main-root-stack-name-from-step-1> \
  --region ap-southeast-1

# 4. Watch deletion
aws cloudformation describe-stacks --stack-name <root-stack> --region ap-southeast-1
```

Do **not** delete the dev/staging stacks (`*-dev`, `*-staging` from `docs/gen1-dynamodb-tables-snapshot.json`) without separately confirming they are unused.

### 4.2 Repo cleanup

```bash
rm -rf amplify-gen1/
```

Remove from `package.json` (already done in 3.1, double-check):

- `@aws-amplify/datastore`
- `swr`

Confirm `aws-amplify` is v6+, no v5 leftovers:

```bash
npm ls aws-amplify
```

### 4.3 Update `CLAUDE.md`

Replace data-layer section:

```md
### Data Layer

Photos served from S3 (`<gen2-bucket>`). Metadata in DynamoDB via AppSync GraphQL, schema defined in `amplify/data/resource.ts`. Photography page fetches server-side via `getStaticProps` with ISR (60s revalidate). On-demand revalidate via `/api/revalidate`.

`amplify_outputs.json` generated by Amplify Gen 2, gitignored.
```

### 4.4 Phase 4 acceptance

- [ ] Gen 1 AWS resources deleted (verify in console)
- [ ] AWS bill drops Gen 1 line items next cycle
- [ ] Repo has no `amplify-gen1/` references

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| `./assets/images` path broken on Amplify SSR | Phase 0.8 verification before Phase 3 |
| Gen 1 → Gen 2 data drift during cutover | Migrate during low-traffic window, freeze writes |
| AppSync API key in client env still public | Accept (read-only). Move writes to IAM-signed in Phase 3.5 if needed |
| ISR stale data after upload | On-demand revalidate webhook (Phase 3.4) |
| IAM role config on Amplify Hosting | Test sandbox first, document role ARN |
| Tests break on DataStore removal | Phase 3.6 rewrites mocks |

## Effort Estimate

Revised after audit. Original "1 day" did not budget for v5→v6 client migration, ISR verification, schema iteration, or test rewrites.

| Phase | Hours | Notes |
|-------|-------|-------|
| 0 — Security + cleanup + TS bump | 1.5 | Most cleanup done in prep; TS bump may surface type errors |
| 1.1–1.9 — Gen 2 backend | 4–6 | Includes auth-mode iteration for write path, sandbox + pipeline-deploy verification |
| 1.10 — Client unblock (was 3.1+3.2) | 2–3 | v5→v6 import removal, ui-components delete, projects page refactor, app shell strip |
| 2 — Data migration | 1.5 | Adds freeze window + spot-check |
| 3.0 — ISR smoke test (gate) | 1 | Throwaway deploy + observation; may force pivot to SSR |
| 3.3–3.7 — Server fetch + blur script + tests | 3–4 | Photography `getStaticProps`, `scripts/blur.ts` SigV4 rewrite, test rewrites |
| 4 — Decommission | 1 | CloudFormation path + bucket emptying |
| **Total** | **~2–3 days focused** | |
