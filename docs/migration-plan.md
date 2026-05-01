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

```bash
rm -rf .firebase/ .firebaserc out/
```

### 0.3 Single package manager

Project uses npm. Keep `package-lock.json` as the only package-manager lockfile.

Update `amplify.yml`:

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

- `eslint-config-next` → `13.2.4` (match Next version)
- Remove `eslint-config-airbnb` + airbnb peer deps (declared, never extended)
- Remove `@next/eslint-plugin-next` (covered by `eslint-config-next`)

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2020"
  }
}
```

### 0.6 next.config.js cleanup

Remove deprecated `images.domains`, keep only `remotePatterns`:

```js
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'https', hostname: 'laijackylai-storage-*.s3.ap-southeast-1.amazonaws.com', pathname: '/**' },
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

### 0.8 Verify SSR file paths

`/api/blur.tsx` reads `./assets/images` from filesystem. On Amplify Hosting SSR runtime, `assets/` may not be packaged with the function bundle. Verify before relying on it.

If broken: convert `/api/blur` to local-only one-shot script under `scripts/blur.ts` invoked via `npm run blur` from dev machine. Remove from `pages/api/`.

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

```bash
npm install aws-amplify@latest
npm install --save-dev @aws-amplify/backend @aws-amplify/backend-cli typescript
```

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

### 1.3 `amplify/auth/resource.ts`

```ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: { email: true },
});
```

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
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['create', 'update', 'delete']),
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

### 1.6 `amplify/backend.ts`

```ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

defineBackend({ auth, data, storage });
```

### 1.7 Sandbox deploy

```bash
npx ampx sandbox
```

Generates `amplify_outputs.json`. Add to `.gitignore`. Test schema in sandbox before promoting.

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

### 1.9 Phase 1 acceptance

- [ ] `npx ampx sandbox` deploys clean
- [ ] AppSync endpoint reachable, schema introspection works
- [ ] S3 bucket created, IAM policies on `photos/*` correct
- [ ] Pipeline deploy succeeds on Amplify Hosting branch

---

## Phase 2 — Data Migration

### 2.1 Export from Gen 1 DynamoDB

```bash
aws dynamodb scan \
  --table-name Photo-<gen1-table-suffix> \
  --region ap-southeast-1 \
  > gen1-photos.json
```

### 2.2 Migration script

Create `scripts/migrate-photos.ts`:

```ts
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import gen1 from '../gen1-photos.json';
import type { Schema } from '../amplify/data/resource';

Amplify.configure(outputs);
const client = generateClient<Schema>();

async function main() {
  for (const item of gen1.Items) {
    await client.models.Photo.create({
      s3key: item.s3key.S,
      type: item.type.S,
      aspectRatio: item.aspectRatio.S,
      blurredBase64: item.blurredBase64?.S ?? null,
    });
  }
}
main();
```

Run once: `npx ts-node scripts/migrate-photos.ts`.

### 2.3 S3 photo migration

Copy bucket contents:

```bash
aws s3 sync \
  s3://laijackylai-storage-4ba35e5623621-main/photos/ \
  s3://<gen2-bucket>/photos/ \
  --region ap-southeast-1
```

### 2.4 Phase 2 acceptance

- [ ] Photo count matches between Gen 1 and Gen 2 DynamoDB
- [ ] All S3 objects copied (compare `aws s3 ls --recursive | wc -l`)
- [ ] Spot-check 5 photos load via Gen 2 bucket URL

---

## Phase 3 — Client Refactor (Server-Side Fetch)

Drop DataStore from browser. AppSync called server-side via `getStaticProps` + ISR.

### 3.1 Remove Gen 1 client artifacts

```bash
rm src/aws-exports.js src/API.ts
rm -rf src/models/ src/graphql/
```

Drop deps:

```bash
npm uninstall @aws-amplify/datastore swr
```

Keep `aws-amplify` for the data client only (used in `/api/blur` and migration script).

### 3.2 `pages/_app.tsx`

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

### 3.3 Photography page server fetch

`pages/photography/index.tsx`:

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

### 3.4 On-demand revalidate (optional)

`pages/api/revalidate.ts`:

```ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
    return res.status(401).end();
  }
  await res.revalidate('/photography');
  return res.json({ revalidated: true });
}
```

Trigger from blur ingest after upload, or hand-call after S3 changes.

### 3.5 `/api/blur.tsx` rewrite

Switch from `DataStore` → AppSync mutation via fetch:

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import sharp from 'sharp';
import sizeOf from 'image-size';

const APPSYNC_URL = process.env.APPSYNC_URL!;
const APPSYNC_API_KEY = process.env.APPSYNC_ADMIN_KEY!; // separate key with write perms, or IAM-signed

async function gql(query: string, variables: Record<string, unknown>) {
  const res = await fetch(APPSYNC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': APPSYNC_API_KEY },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const expectedToken = process.env.BLUR_API_TOKEN;
  const provided = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!expectedToken || provided !== expectedToken) {
    return res.status(401).json({ result: 'Unauthorized' });
  }
  // ... existing sharp/sizeOf logic
  // replace DataStore.query/save with gql() calls
}
```

Note: AppSync API key with write perms = same exposure as Gen 1. Better: IAM-signed requests via `@aws-sdk/signature-v4`. Defer if low priority.

### 3.6 Tests

- Update `tests/BlurApi.test.ts`: mock `fetch` instead of `DataStore`.
- Update `tests/App.test.tsx`: drop `Amplify.configure` mocks.
- Add new test: photography page renders from server props.

### 3.7 Phase 3 acceptance

- [ ] `aws-amplify` removed from client bundle (verify via `next build` analyzer)
- [ ] Photography page loads under 100KB JS first-load
- [ ] ISR revalidate works: upload photo → wait 60s → photo appears
- [ ] All tests pass
- [ ] Lighthouse perf score >90 on `/photography`

---

## Phase 4 — Decommission Gen 1

Only after Phase 3 in production for one week with no rollback.

### 4.1 Tear down Gen 1 stack

```bash
cd amplify-gen1
amplify delete
```

Removes Gen 1 AppSync, DynamoDB tables, Cognito pools, S3 bucket.

### 4.2 Repo cleanup

```bash
rm -rf amplify-gen1/
```

Remove from `package.json`:

- `@aws-amplify/datastore`

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

| Phase | Hours |
|-------|-------|
| 0 — Security + cleanup | 1 |
| 1 — Gen 2 backend | 3–4 |
| 2 — Data migration | 1 |
| 3 — Client refactor | 2 |
| 4 — Decommission | 0.5 |
| **Total** | **~1 day focused** |
