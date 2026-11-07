import { loadEnvConfig } from '@next/env';
import { createSignedGraphqlClient, makeBlurDataUrl, validateAwsCredentials } from './blur';

loadEnvConfig(process.cwd());

// Rebuilds blurredBase64 for every existing Photo from the image already in S3.
// Usage: APPSYNC_URL=... STORAGE_BASE_URL=... npm run regen-blur [-- --write]
const write = process.argv.includes('--write');

const listQuery = /* GraphQL */ `
  query ListPhotos($nextToken: String) {
    listPhotos(nextToken: $nextToken) {
      items { id s3key aspectRatio blurredBase64 }
      nextToken
    }
  }
`;

const updateMutation = /* GraphQL */ `
  mutation UpdatePhoto($input: UpdatePhotoInput!) {
    updatePhoto(input: $input) { id }
  }
`;

const main = async () => {
  const base = process.env.STORAGE_BASE_URL?.replace(/\/$/, '');
  if (!base) throw new Error('STORAGE_BASE_URL is required');
  await validateAwsCredentials();
  const gql = createSignedGraphqlClient();

  const photos: { id: string; s3key: string; aspectRatio: string; blurredBase64?: string | null }[] = [];
  let nextToken: string | null = null;
  do {
    const data = await gql(listQuery, { nextToken });
    photos.push(...data.listPhotos.items);
    nextToken = data.listPhotos.nextToken;
  } while (nextToken);

  const keys = photos.map((p) => p.s3key);
  console.log(`photos=${photos.length} duplicateKeys=${keys.length - new Set(keys).size} oversized=${photos.filter((p) => (p.blurredBase64 ?? '').length > 2048).length}`);
  console.log(`prefixes=${[...new Set(keys.map((k) => k.split('/').slice(0, -1).join('/')))].join(', ')}`);

  let updated = 0;
  let failed = 0;
  for (const photo of photos) {
    try {
      const url = `${base}/${photo.s3key.split('/').map(encodeURIComponent).join('/')}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
      const blurredBase64 = await makeBlurDataUrl(Buffer.from(await res.arrayBuffer()), photo.aspectRatio);
      if (blurredBase64 === photo.blurredBase64) continue;
      if (write) await gql(updateMutation, { input: { id: photo.id, blurredBase64 } });
      updated += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed: ${photo.s3key}`, error);
    }
  }

  console.log(`${write ? 'Updated' : 'Would update'}=${updated} Failed=${failed}${write ? '' : ' (dry run; pass --write)'}`);
  if (failed > 0) process.exitCode = 1;
};

void main();
