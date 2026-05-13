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

  it('randomizes the server-fetched photo order', async () => {
    const randomSpy = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        data: {
          listPhotos: {
            items: [
              {
                id: 'photo-1',
                s3key: 'public/photos/digital/photo-1.jpg',
                type: 'digital',
                aspectRatio: '1.500',
                blurredBase64: null,
                createdAt: '2026-04-29',
              },
              {
                id: 'photo-2',
                s3key: 'public/photos/film/photo-2.jpg',
                type: 'film',
                aspectRatio: '1.000',
                blurredBase64: null,
                createdAt: '2026-04-30',
              },
              {
                id: 'photo-3',
                s3key: 'public/photos/film/photo-3.jpg',
                type: 'film',
                aspectRatio: '0.750',
                blurredBase64: null,
                createdAt: '2026-05-01',
              },
            ],
          },
        },
      }),
    });

    const result = await getStaticProps({} as any);

    expect((result as any).props.photosData.map((photo: any) => photo.id)).toEqual([
      'photo-2',
      'photo-3',
      'photo-1',
    ]);
  });
});
