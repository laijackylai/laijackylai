// Server-only helpers shared by getStaticProps on the home, projects and photography pages.
export type PhotoData = {
  id: string,
  s3key: string,
  type: string,
  aspectRatio: string,
  blurredBase64: string | null,
  createdAt?: string | null,
  url: string,
}

const defaultStorageBaseUrl = 'https://amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc.s3.ap-southeast-1.amazonaws.com';

export const shouldFailStaticBuild = () => (
  process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS !== 'true'
);

export const publicStorageUrl = (key: string, route = '/projects') => {
  if (!process.env.STORAGE_BASE_URL && shouldFailStaticBuild()) {
    throw new Error(`STORAGE_BASE_URL is required to build ${route}`);
  }
  const storageBaseUrl = process.env.STORAGE_BASE_URL || defaultStorageBaseUrl;
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `${storageBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
};

const maxInlineBlurDataUrlLength = 2048;

const normalizeBlurDataUrl = (blurredBase64: string | null) => {
  if (!blurredBase64 || blurredBase64.length > maxInlineBlurDataUrlLength) {
    return null;
  }
  return blurredBase64;
};

const listPhotosQuery = /* GraphQL */ `
  query ListPhotos($nextToken: String) {
    listPhotos(nextToken: $nextToken) {
      items {
        id
        s3key
        type
        aspectRatio
        blurredBase64
        createdAt
      }
      nextToken
    }
  }
`;

// Every Photo row from AppSync (following nextToken), with its public S3 URL. Throws on missing env or API errors.
export const fetchPhotos = async (route: string): Promise<PhotoData[]> => {
  if (!process.env.APPSYNC_URL || !process.env.APPSYNC_API_KEY) {
    throw new Error(`APPSYNC_URL and APPSYNC_API_KEY are required to build ${route}`);
  }
  const photos: Omit<PhotoData, 'url'>[] = [];
  let nextToken: string | null = null;
  do {
    const res = await fetch(process.env.APPSYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.APPSYNC_API_KEY,
      },
      body: JSON.stringify({ query: listPhotosQuery, variables: { nextToken } }),
    });
    const json = await res.json();
    if (res.ok === false || json.errors) {
      throw new Error(JSON.stringify(json.errors ?? { status: res.status }));
    }
    photos.push(...(json.data?.listPhotos?.items ?? []));
    nextToken = json.data?.listPhotos?.nextToken ?? null;
  } while (nextToken);
  return photos.map((photo) => ({
    ...photo,
    id: photo.id || photo.s3key,
    blurredBase64: normalizeBlurDataUrl(photo.blurredBase64),
    url: publicStorageUrl(photo.s3key, route),
  }));
};
