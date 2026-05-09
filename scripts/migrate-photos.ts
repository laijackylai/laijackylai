import fs from 'fs/promises';
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
  await validateAwsCredentials();

  const readGql = createApiKeyGraphqlClient();
  const writeGql = createSignedGraphqlClient();
  const gen1 = JSON.parse(await fs.readFile('gen1-photos.json', 'utf8')) as { Items: Gen1Item[] };
  const items = (gen1 as { Items: Gen1Item[] }).Items;
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    const rawKey = item.s3key.S;
    const s3key = rawKey.startsWith('public/') ? rawKey : `public/${rawKey}`;

    try {
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
