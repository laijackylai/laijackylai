import fs from 'fs/promises';
import sharp from 'sharp';
import sizeOf from 'image-size';
import { processImage } from '../scripts/blur';

jest.mock('fs/promises', () => ({
  stat: jest.fn(),
}));
jest.mock('image-size', () => jest.fn());
jest.mock('sharp', () => jest.fn());

describe('blur script image processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.stat as jest.Mock).mockResolvedValue({ isFile: () => true });
    (sizeOf as jest.Mock).mockReturnValue({ width: 1200, height: 800 });
    (sharp as unknown as jest.Mock).mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      blur: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('blur')),
    });
  });

  it('skips .DS_Store files', async () => {
    const gql = jest.fn();

    await expect(processImage('.DS_Store', gql as any)).resolves.toBeUndefined();
    expect(gql).not.toHaveBeenCalled();
  });

  it('creates a new photo when no existing row matches the S3 key', async () => {
    const gql = jest
      .fn()
      .mockResolvedValueOnce({ listPhotos: { items: [] } })
      .mockResolvedValueOnce({ createPhoto: { id: 'photo-1' } });

    await expect(processImage('DSC001.jpg', gql as any)).resolves.toBe('created');
    expect(gql.mock.calls[1][1]).toEqual({
      input: {
        s3key: 'photos/digital/DSC001.jpg',
        type: 'digital',
        aspectRatio: '1.500',
        blurredBase64: 'data:image/png;base64,Ymx1cg==',
      },
    });
  });

  it('updates a changed existing photo', async () => {
    const gql = jest
      .fn()
      .mockResolvedValueOnce({
        listPhotos: {
          items: [{
            id: 'photo-1',
            s3key: 'photos/film/film.jpg',
            type: 'film',
            aspectRatio: '1.000',
            blurredBase64: 'old',
          }],
        },
      })
      .mockResolvedValueOnce({ updatePhoto: { id: 'photo-1' } });

    await expect(processImage('film.jpg', gql as any)).resolves.toBe('updated');
    expect(gql.mock.calls[1][1]).toEqual({
      input: {
        id: 'photo-1',
        s3key: 'photos/film/film.jpg',
        type: 'film',
        aspectRatio: '1.500',
        blurredBase64: 'data:image/png;base64,Ymx1cg==',
      },
    });
  });
});
