import fs from 'fs/promises';
import sharp from 'sharp';
import sizeOf from 'image-size';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';

type ExistingPhoto = {
  id: string;
  s3key: string;
  type: string;
  aspectRatio: string;
  blurredBase64?: string | null;
};

const folder = './assets/images';
const region = process.env.AWS_REGION ?? 'ap-southeast-1';

export const createSignedGraphqlClient = (appSyncUrl = process.env.APPSYNC_URL) => {
  if (!appSyncUrl) {
    throw new Error('APPSYNC_URL is required');
  }

  const url = new URL(appSyncUrl);
  const signer = new SignatureV4({
    service: 'appsync',
    region,
    credentials: defaultProvider(),
    sha256: Sha256,
  });

  return async (query: string, variables: Record<string, unknown>) => {
    const body = JSON.stringify({ query, variables });
    const request = new HttpRequest({
      method: 'POST',
      protocol: url.protocol,
      hostname: url.host,
      path: url.pathname,
      headers: { 'content-type': 'application/json', host: url.host },
      body,
    });
    const signed = await signer.sign(request);
    const res = await fetch(appSyncUrl, {
      method: 'POST',
      headers: signed.headers as Record<string, string>,
      body,
    });
    const json = await res.json();
    if (json.errors) {
      throw new Error(JSON.stringify(json.errors));
    }
    return json.data;
  };
};

const listByS3KeyQuery = /* GraphQL */ `
  query ListPhotosByS3Key($s3key: String!) {
    listPhotos(filter: { s3key: { eq: $s3key } }, limit: 1) {
      items {
        id
        s3key
        type
        aspectRatio
        blurredBase64
      }
    }
  }
`;

const createPhotoMutation = /* GraphQL */ `
  mutation CreatePhoto($input: CreatePhotoInput!) {
    createPhoto(input: $input) {
      id
    }
  }
`;

const updatePhotoMutation = /* GraphQL */ `
  mutation UpdatePhoto($input: UpdatePhotoInput!) {
    updatePhoto(input: $input) {
      id
    }
  }
`;

const upsertPhoto = async (
  gql: ReturnType<typeof createSignedGraphqlClient>,
  input: Omit<ExistingPhoto, 'id'>
) => {
  const data = await gql(listByS3KeyQuery, { s3key: input.s3key });
  const existing = data.listPhotos?.items?.[0] as ExistingPhoto | undefined;

  if (existing) {
    if (
      existing.type !== input.type ||
      existing.aspectRatio !== input.aspectRatio ||
      existing.blurredBase64 !== input.blurredBase64
    ) {
      await gql(updatePhotoMutation, { input: { id: existing.id, ...input } });
      return 'updated';
    }
    return 'unchanged';
  }

  await gql(createPhotoMutation, { input });
  return 'created';
};

export const processImage = async (file: string, gql: ReturnType<typeof createSignedGraphqlClient>) => {
  if (file.startsWith('.DS_Store')) return undefined;

  const filePath = `${folder}/${file}`;

  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) return undefined;

    const fileType = file.startsWith('DSC') ? 'digital' : 'film';
    const s3Key = `photos/${fileType}/${file}`;

    const dimensions = sizeOf(filePath);
    if (!dimensions || !dimensions.width || !dimensions.height) return undefined;

    const aspectRatio = (dimensions.width / dimensions.height).toFixed(3);
    const buffer = await sharp(filePath)
      .resize({ width: 480, height: Math.round(480 / parseFloat(aspectRatio)) })
      .blur(0.75)
      .toBuffer();

    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return upsertPhoto(gql, {
      s3key: s3Key,
      type: fileType,
      aspectRatio,
      blurredBase64: dataUrl,
    });
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
    return 'error';
  }
};

export const syncBlurImages = async (gql = createSignedGraphqlClient()) => {
  try {
    const files = await fs.readdir(folder);
    const results = await Promise.all(files.map((file) => processImage(file, gql)));
    const processed = results.filter(Boolean).length;
    console.log(`Blur sync complete. Processed ${processed} file(s).`);
    return processed;
  } catch (error) {
    console.error('Error reading image folder:', error);
    throw error;
  }
};

if (require.main === module) {
  syncBlurImages().catch(() => {
    process.exitCode = 1;
  });
}
