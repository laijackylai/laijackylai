import { getStaticProps } from '../pages/photography';

describe('Photography getStaticProps', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      APPSYNC_URL: 'https://example.appsync-api.ap-southeast-1.amazonaws.com/graphql',
      APPSYNC_API_KEY: 'api-key',
      STORAGE_BASE_URL: 'https://storage.example.com',
    };
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          listPhotos: {
            items: [{
              id: 'photo-1',
              s3key: 'public/photos/digital/photo 1.jpg',
              type: 'digital',
              aspectRatio: '1.500',
              blurredBase64: null,
              createdAt: '2026-04-29',
            }],
          },
        },
      }),
    }) as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it('fetches photos from AppSync and maps S3 keys to public URLs', async () => {
    const result = await getStaticProps({} as any);

    expect(global.fetch).toHaveBeenCalledWith(
      process.env.APPSYNC_URL,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'api-key',
        },
      })
    );
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body).query).toContain('listPhotos');
    expect(result).toEqual({
      props: {
        photosData: [{
          id: 'photo-1',
          s3key: 'public/photos/digital/photo 1.jpg',
          type: 'digital',
          aspectRatio: '1.500',
          blurredBase64: null,
          createdAt: '2026-04-29',
          url: 'https://storage.example.com/public/photos/digital/photo%201.jpg',
        }],
      },
      revalidate: 60,
    });
  });

  it('follows nextToken until every page of photos is loaded', async () => {
    const page = (id: string, nextToken: string | null) => ({
      json: jest.fn().mockResolvedValue({
        data: { listPhotos: { items: [{ id, s3key: `public/${id}.jpg`, type: 'film', aspectRatio: '1.000', blurredBase64: null }], nextToken } },
      }),
    });
    global.fetch = jest.fn()
      .mockResolvedValueOnce(page('a', 'token-2'))
      .mockResolvedValueOnce(page('b', null)) as any;

    const result: any = await getStaticProps({} as any);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body).variables).toEqual({ nextToken: 'token-2' });
    expect(result.props.photosData.map((p: any) => p.id)).toEqual(['a', 'b']);
  });
});
