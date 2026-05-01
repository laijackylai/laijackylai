# Prep Steps — Before Migration Plan

Prereqs not covered in `migration-plan.md`. Complete before Phase 0.

---

## 1. AWS account access

### 1.1 IAM principal with Gen 2 perms

Current user `amplify-5dZdc` was provisioned by Gen 1 CLI. Likely scoped to existing categories (auth, storage). Gen 2 = CDK; needs broader perms.

Options:
- **Recommended**: create a new IAM user `amplify-gen2-deploy` with `AdministratorAccess-Amplify` managed policy + `AWSCloudFormationFullAccess`.
- Or: attach `AdministratorAccess` temporarily for migration window, revoke after Phase 4.

Verify:
```bash
aws sts get-caller-identity
aws iam list-attached-user-policies --user-name amplify-gen2-deploy
```

Status: verified on 2026-05-01 with current principal `arn:aws:iam::232665835945:user/amplify-5dZdc`. Attached policies include `AdministratorAccess` and `AdministratorAccess-Amplify`, which is sufficient for the migration window.

### 1.2 CDK bootstrap

Gen 2 deploys via CDK. Region must be bootstrapped once per account/region.

```bash
npx cdk bootstrap aws://232665835945/ap-southeast-1
```

Idempotent. Creates `CDKToolkit` CloudFormation stack.

Status: completed on 2026-05-01 for `aws://232665835945/ap-southeast-1`.

### 1.3 AWS CLI bump

Local is `2.2.13` (2021). DynamoDB scan + S3 sync work but bump:

```bash
brew upgrade awscli   # or reinstall per AWS docs
```

Status: pending. Local AWS CLI is `2.2.13`; upgrade outside the repo before Gen 2 work.

### 1.4 Amplify Hosting service role

Gen 2 backend pipeline needs an **app-level service role** distinct from Gen 1's auth/unauth roles.

Steps:
1. AWS Console → Amplify → app `d2ukbi00figpw1` → App settings → IAM service role
2. Create new role w/ trust policy `amplify.amazonaws.com`
3. Attach `AmplifyBackendDeployFullAccess` (managed) + access to CDK bootstrap bucket
4. Save app

Without this, `npx ampx pipeline-deploy` fails in CI.

Status: app `d2ukbi00figpw1` has service role `arn:aws:iam::232665835945:role/amplifyconsole-backend-role` attached.

---

## 2. Local toolchain

### 2.1 Node

Local Node `v25.8.1` is fine. CI pinned to 20 — match locally for reproducibility:

```bash
nvm install 20 && nvm use 20
```

Status: `.nvmrc` is committed with `20`. Current shell is still `v25.8.1`; run `nvm use` before migration commands.

### 2.2 Package manager

Use npm only. Keep `package-lock.json` committed and run `npm ci` in CI/Amplify.

Status: npm-only repo cleanup is done. Legacy package-manager lockfiles, ignore rules, and command references were removed. Amplify app `d2ukbi00figpw1` build spec was updated to the checked-in npm `amplify.yml`.

### 2.3 ts-node for migration script

Already in devDeps. Verify:
```bash
npx ts-node --version
```

Status: verified `v10.9.1`.

### 2.4 tsconfig flags

Already correct: `resolveJsonModule: true` + `esModuleInterop: true` present. No change needed for `gen1-photos.json` import.

---

## 3. MCP servers (optional but recommended)

Speeds up Gen 2 work. AWS Labs publishes MCP servers via `uvx`.

### 3.1 Install `uv`

```bash
brew install uv
```

### 3.2 Add to `~/.claude.json` `mcpServers`

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"]
    },
    "aws-cdk": {
      "command": "uvx",
      "args": ["awslabs.cdk-mcp-server@latest"]
    },
    "aws-frontend": {
      "command": "uvx",
      "args": ["awslabs.frontend-mcp-server@latest"]
    },
    "aws-api": {
      "command": "uvx",
      "args": ["awslabs.aws-api-mcp-server@latest"],
      "env": {
        "AWS_REGION": "ap-southeast-1"
      }
    }
  }
}
```

Why each:
- `aws-docs` — Amplify Gen 2 docs lookup (training data stale on Gen 2)
- `aws-cdk` — Gen 2 = CDK underneath; helps when extending `backend.ts` w/ raw CDK
- `aws-frontend` — Next.js + Amplify integration patterns
- `aws-api` — read-only AWS API calls (DynamoDB scan, S3 ls) without leaving Claude

No dedicated Amplify Gen 2 MCP exists yet. AWS docs MCP covers Gen 2 reference.

### 3.3 Restart Claude Code

`/mcp` to verify connection.

### 3.4 Optional: Playwright MCP

Already installed (`plugin_playwright_playwright__*` tools visible). Use for Phase 3 photography-page smoke tests post-deploy.

---

## 4. Environment variables

Plan only names `BLUR_API_TOKEN`. Full list:

| Var | Where | Purpose | Phase |
|-----|-------|---------|-------|
| `BLUR_API_TOKEN` | Amplify Hosting + `.env.local` | `/api/blur` auth | 0.1 |
| `APPSYNC_URL` | Amplify Hosting + `.env.local` | SSR fetch endpoint | 3.3 |
| `APPSYNC_API_KEY` | Amplify Hosting + `.env.local` | read-only key for `getStaticProps` | 3.3 |
| `APPSYNC_ADMIN_KEY` | Amplify Hosting only | write key for `/api/blur` | 3.5 |
| `REVALIDATE_TOKEN` | Amplify Hosting only | `/api/revalidate` auth | 3.4 |
| `AWS_REGION` | implicit | `ap-southeast-1` | 1+ |

Set in:
- Local: `.env.local` (gitignored — verify `.env*.local` in `.gitignore` ✅)
- CI/Amplify Hosting: Console → App settings → Environment variables
- `getStaticProps` reads at **build time** — must be set on Amplify Hosting build env, not just runtime

Generate tokens:
```bash
openssl rand -hex 32
```

---

## 5. Repo cleanup beyond Phase 0.2

Plan deletes `.firebase/`, `out/`. Also stale:

```bash
rm -rf .firebase .firebaserc out/ build/ .swc/
rm README                              # duplicate; keep README.md
rm .github/workflows/firebase-hosting-merge.yml
rm .github/workflows/firebase-hosting-pull-request.yml
rm .graphqlconfig.yml                  # Gen 1 GraphQL CLI config
```

Also git-ignore additions:
```
amplify_outputs.json
.env.local
.env*.local
```

(`.env*.local` already covered.)

Status: cleanup completed. Removed stale Firebase/build artifacts and legacy config files: `.firebase/`, `.firebaserc`, `out/`, `build/`, `.swc/`, Firebase hosting workflows, `.graphqlconfig.yml`, and duplicate `README`. `.gitignore` now includes `amplify_outputs.json`, `.env.local`, and `.env*.local`.

---

## 6. Verify ISR support on Amplify Hosting

Critical assumption in Phase 3.3 + 3.4. Amplify Hosting Next.js 13 Pages Router SSR adapter has had partial ISR support historically.

Verify before Phase 3:
1. Deploy a throwaway `pages/test-isr.tsx` with `getStaticProps` + `revalidate: 30`
2. Hit twice across 30s window, confirm regeneration
3. Test `res.revalidate('/test-isr')` from `/api/test-revalidate`

If broken — fallback options:
- `getServerSideProps` + `Cache-Control: s-maxage=60, stale-while-revalidate`
- Migrate hosting to Vercel (better Next.js parity, native ISR)

Decide before committing to Phase 3.

---

## 7. Gen 1 reference data capture

Before Phase 1.2 sideways-move:

```bash
# Record Gen 1 table names + bucket names
cat amplify/backend/amplify-meta.json | jq '.api.laijackylai.output' > docs/gen1-api-snapshot.json
cat amplify/backend/amplify-meta.json | jq '.storage' > docs/gen1-storage-snapshot.json

# Record DynamoDB table names actually deployed
aws dynamodb list-tables --region ap-southeast-1 | grep -i photo
```

Saves discovery time at Phase 2.1.

Status: saved `docs/gen1-api-snapshot.json`, `docs/gen1-storage-snapshot.json`, and `docs/gen1-dynamodb-tables-snapshot.json`.

---

## 8. Phase 0.8 decision up-front

`/api/blur` reads `./assets/images/` from filesystem. Amplify SSR Lambda bundle does **not** package arbitrary repo dirs by default.

**Recommended decision now**: convert to local-only script `scripts/blur.ts`. Avoids fixing two times.

Status: decision made. Use the local-only `scripts/blur.ts` path during Phase 0.8 instead of adding SSR bundle tracing for `./assets/images`.

If keeping as API route, add to `next.config.js`:
```js
experimental: {
  outputFileTracingIncludes: {
    '/api/blur': ['./assets/images/**/*'],
  },
}
```

Verify bundle size before relying on this.

---

## 9. amplify.yml consistency

Plan Phase 1.8 should use npm consistently for backend and frontend phases.

Use this shape:
```yaml
backend:
  phases:
    build:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
```

---

## 10. Pre-flight checklist

- [x] IAM principal w/ Gen 2 deploy perms confirmed (`aws sts get-caller-identity`) — current `amplify-5dZdc` user has `AdministratorAccess` + `AdministratorAccess-Amplify`.
- [x] CDK bootstrapped in `ap-southeast-1`
- [ ] AWS CLI ≥ 2.15 — current local version is `2.2.13`.
- [x] Amplify Hosting service role attached to app `d2ukbi00figpw1`
- [ ] Node 20 active locally — `.nvmrc` pins 20, but current shell is `v25.8.1`.
- [ ] MCP servers configured + `/mcp` shows connected
- [ ] All env var values generated + ready to paste
- [ ] ISR smoke test on Amplify Hosting passed (or Vercel decision made)
- [x] Gen 1 snapshots saved to `docs/gen1-*-snapshot.json`
- [x] Phase 0.8 decision made (local script vs SSR bundling)
- [x] Plan Phase 1.8 yaml uses npm consistently

After all checked, start Phase 0.
