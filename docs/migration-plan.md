# Migration Plan: Amplify Gen 1 → Gen 2 + Server-Side AppSync

Personal portfolio production hardening. Drops DataStore client, migrates backend to Amplify Gen 2, fetches photo data server-side from AppSync.

**Priorities**: maintainability, performance.
**Stack target**: Next.js 13 Pages Router, Amplify Gen 2 (AppSync + DynamoDB + S3), server-side data fetch with ISR.

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

- [ ] `npm run lint && npm test && npm run build` green locally
- [ ] CI passes on PR
- [ ] Amplify Hosting deploy green with new `amplify.yml`
- [ ] `BLUR_API_TOKEN` set, `/api/blur` returns 401 without header
- [ ] Clarity firing in browser devtools network tab

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
- [ ] Pipeline deploy succeeds on Amplify Hosting branch — pending push to a connected branch (only remaining 1.9 box)

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

4. **Pipeline deploy verification** — decided 2026-05-04: wait for natural backend-touching commit (Phase 2 work). No synthetic commit. Still open until Phase 2 commits land on `main`.

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

---

## Phase 2 — Data Migration

**Target stack decision** — decide before 2.1:

- **Sandbox-first (safer)**: migrate to `amplify-laijackylai-laijackylai-sandbox-e87c5d3fcf` as a dry run. After verifying counts + spot checks, push a backend-touching commit on `main` to trigger pipeline-deploy → wait for the prod Gen 2 stack → re-run 2.1–2.3 against prod. Sync runs twice; prod data is fresh.
- **Prod-first (single shot)**: push the backend commit *before* Phase 2, wait for pipeline-deploy green, then migrate once into the prod stack. Skip the sandbox sync. Requires confidence the script works because the first run is the real one.

Whichever is picked, set `APPSYNC_URL` + (if used) `APPSYNC_API_KEY` in `.env.local` to match the **target** stack before each run. Default `.env.local` is currently the sandbox; remember to flip for prod-targeted runs.

### 2.1 Export from Gen 1 DynamoDB

Gen 1 prod table (from `docs/gen1-dynamodb-tables-snapshot.json`): `Photo-gbzpma2elvdxnjqehhqdnf5wmy-main`.

**Freeze writes first**: ensure no one runs the (soon-to-be-removed) `/api/blur` route during the window. Pause Amplify Hosting auto-build for `main` for the migration window so a redeploy cannot rotate creds mid-cutover.

Verify single-row shape before bulk run:

```bash
aws dynamodb scan \
  --table-name Photo-gbzpma2elvdxnjqehhqdnf5wmy-main \
  --region ap-southeast-1 \
  --max-items 1 | jq '.Items[0]'   # expect { s3key: { S }, type: { S }, aspectRatio: { S }, blurredBase64: { S } }
```

Then full export:

```bash
aws dynamodb scan \
  --table-name Photo-gbzpma2elvdxnjqehhqdnf5wmy-main \
  --region ap-southeast-1 \
  > gen1-photos.json
```

### 2.2 Migration script

Use SigV4 against the `'iam'` write rule (same auth path as `scripts/blur.ts`). `generateClient<Schema>()` defaults to `apiKey` mode and the schema's `apiKey` rule only allows `read` — so the SDK client path 401s on `create()`. Reuse the helper from `scripts/blur.ts`.

Create `scripts/migrate-photos.ts`:

```ts
import gen1 from '../gen1-photos.json';
import { createSignedGraphqlClient } from './blur';

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
  const gql = createSignedGraphqlClient();
  const items = (gen1 as { Items: Gen1Item[] }).Items;
  let created = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await gql(createPhotoMutation, {
        input: {
          s3key: item.s3key.S,
          type: item.type.S,
          aspectRatio: item.aspectRatio.S,
          blurredBase64: item.blurredBase64?.S ?? null,
        },
      });
      created += 1;
    } catch (err) {
      failed += 1;
      console.error(`Failed: ${item.s3key.S}`, err);
    }
  }

  console.log(`Migration complete. Created: ${created}. Failed: ${failed}.`);
  if (failed > 0) process.exitCode = 1;
};

void main();
```

Add to `package.json` `scripts`:

```json
"migrate-photos": "ts-node scripts/migrate-photos.ts"
```

Run once per target stack:

```bash
npm run migrate-photos
```

Notes:

- Reuses `createSignedGraphqlClient` from `scripts/blur.ts` — must `export` that helper from blur.ts (already does).
- No idempotency check — assumes the target table is empty. If a re-run is needed, either truncate the Gen 2 `Photo` table first or wrap the loop with a `listPhotosByS3Key` lookup before `create`.
- Blocked by 1.11 acceptance — do not run until SigV4 + IAM write path is verified.

### 2.3 S3 photo migration

Source: `laijackylai-storage-4ba35e5623621-main` (Gen 1 prod, from `docs/gen1-storage-snapshot.json`).
Target: `amplify-laijackylai-laija-laijackylaistoragebucket-ntfkq0sgwpt2` for sandbox; the prod stack's bucket name once pipeline-deploy lands (read from prod `amplify_outputs.json`).

```bash
aws s3 sync \
  s3://laijackylai-storage-4ba35e5623621-main/photos/ \
  s3://amplify-laijackylai-laija-laijackylaistoragebucket-ntfkq0sgwpt2/photos/ \
  --region ap-southeast-1
```

Verify count parity:

```bash
aws s3 ls s3://laijackylai-storage-4ba35e5623621-main/photos/ --recursive | wc -l
aws s3 ls s3://amplify-laijackylai-laija-laijackylaistoragebucket-ntfkq0sgwpt2/photos/ --recursive | wc -l
```

Counts must match.

### 2.4 Phase 2 acceptance

- [x] 1.11 preflight all green — verified 2026-05-04
- [ ] Target stack decision logged (sandbox-first vs prod-first) in PR description
- [ ] Photo count matches between Gen 1 and Gen 2 DynamoDB (count via AppSync `listPhotos` vs `aws dynamodb scan --select COUNT`)
- [ ] All S3 objects copied (compare `aws s3 ls --recursive | wc -l`)
- [ ] Spot-check 5 photos load via Gen 2 bucket URL (after adding the Gen 2 hostname to `next.config.js` `remotePatterns`)
- [ ] Migration script exit code 0, `failed` count zero

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

Status (2026-05-03): time-based ISR satisfied locally — `next build` reports `/photography (ISR: 60 Seconds)`. On-demand `res.revalidate()` path **not yet verified on Amplify Hosting** (no `pages/api/revalidate.ts` exists; see 3.4 status). If on-demand revalidation is wanted, run that leg of the smoke test before implementing 3.4.

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

Status (2026-05-03): **done (pulled forward in Phase 1.10)**. `pages/api/blur.tsx` deleted; `scripts/blur.ts` uses `SignatureV4` + `defaultProvider()` against `service: 'appsync'`. End-to-end run against the deployed sandbox not yet executed — schedule before Phase 2 to confirm IAM creds + schema `iam` rule actually authorize writes.

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

Capture baseline before starting Phase 3 so the bundle / Lighthouse goals are measurable:

```bash
npm run build  # record .next/build output: First Load JS for /photography
npm run test:lighthouse  # record current perf score
```

Save numbers in `docs/phase3-baseline.txt`.

- [ ] Baseline captured (`docs/phase3-baseline.txt` exists) — partial: 2026-05-03 build shows `/photography 2.15 kB / 81 kB First Load JS`. Pre-cutover baseline not captured separately. Either backfill from git history or accept current numbers as the post-cutover figure.
- [x] `aws-amplify` removed from client bundle — verified by `grep`: zero importers in pages/components/tests
- [x] Photography page First Load JS < 100KB — `81 kB` shown in `next build`
- [ ] ISR revalidate works: run `scripts/blur.ts` → POST `/api/revalidate` → photo appears within 60s — blocked on 3.4 implementation decision
- [x] All tests pass — 28 / 12 suites, 2026-05-03
- [ ] Lighthouse perf score >90 on `/photography` (or ≥10pt improvement vs baseline) — not yet run

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
