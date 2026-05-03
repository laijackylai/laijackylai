import handler from '../pages/api/blur';
import { DataStore } from 'aws-amplify';
import fs from 'fs/promises';
import sharp from 'sharp';
import sizeOf from 'image-size';
import { Photo } from '../src/models';

jest.mock('../src/aws-exports', () => ({}));
jest.mock('aws-amplify', () => ({
  Amplify: { configure: jest.fn() },
  DataStore: {
    query: jest.fn(),
    save: jest.fn(),
  },
}));
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  stat: jest.fn(),
}));
jest.mock('image-size', () => jest.fn());
jest.mock('sharp', () => jest.fn());
jest.mock('../src/models', () => {
  class MockPhoto {
    static copyOf(photo: any, mutator: (draft: any) => void) {
      const draft = { ...photo };
      mutator(draft);
      return draft;
    }

    constructor(values: any) {
      Object.assign(this, values);
    }
  }

  return { Photo: MockPhoto };
});

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const createRequest = (headers = {}) => ({ headers } as any);
const createAuthorizedRequest = () => createRequest({ authorization: 'Bearer secret' });

describe('blur API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.BLUR_API_TOKEN;
    (fs.stat as jest.Mock).mockResolvedValue({ isFile: () => true });
    (sizeOf as jest.Mock).mockReturnValue({ width: 1200, height: 800 });
    (sharp as unknown as jest.Mock).mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      blur: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('blur')),
    });
  });

  it('returns 401 when BLUR_API_TOKEN is missing', async () => {
    const res = createResponse();

    await handler(createRequest({ authorization: 'Bearer secret' }), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(DataStore.save).not.toHaveBeenCalled();
  });

  it('returns 401 when the provided token is missing', async () => {
    process.env.BLUR_API_TOKEN = 'secret';
    const res = createResponse();

    await handler(createRequest(), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(DataStore.save).not.toHaveBeenCalled();
  });

  it('handles an empty folder without writes', async () => {
    process.env.BLUR_API_TOKEN = 'secret';
    (fs.readdir as jest.Mock).mockResolvedValue([]);
    const res = createResponse();

    await handler(createAuthorizedRequest(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ result: 'Success', processed: 0 });
    expect(DataStore.save).not.toHaveBeenCalled();
  });

  it('creates datastore records for new photos and skips .DS_Store', async () => {
    process.env.BLUR_API_TOKEN = 'secret';
    (fs.readdir as jest.Mock).mockResolvedValue(['.DS_Store', 'DSC001.jpg']);
    (DataStore.query as jest.Mock).mockResolvedValue([]);
    const res = createResponse();

    await handler(createAuthorizedRequest(), res);

    expect(DataStore.save).toHaveBeenCalledWith(expect.any(Photo));
    expect(DataStore.save).toHaveBeenCalledWith(expect.objectContaining({
      s3key: 'photos/digital/DSC001.jpg',
      type: 'digital',
      aspectRatio: '1.500',
      blurredBase64: 'data:image/png;base64,Ymx1cg==',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not save an unchanged existing photo', async () => {
    process.env.BLUR_API_TOKEN = 'secret';
    (fs.readdir as jest.Mock).mockResolvedValue(['film.jpg']);
    (DataStore.query as jest.Mock).mockResolvedValue([{
      s3key: 'photos/film/film.jpg',
      type: 'film',
      aspectRatio: '1.500',
      blurredBase64: 'data:image/png;base64,Ymx1cg==',
    }]);
    const res = createResponse();

    await handler(createAuthorizedRequest(), res);

    expect(DataStore.save).not.toHaveBeenCalled();
  });

  it('updates a changed existing photo', async () => {
    process.env.BLUR_API_TOKEN = 'secret';
    (fs.readdir as jest.Mock).mockResolvedValue(['film.jpg']);
    (DataStore.query as jest.Mock).mockResolvedValue([{
      s3key: 'photos/film/film.jpg',
      type: 'film',
      aspectRatio: '1.000',
      blurredBase64: 'old',
    }]);
    const res = createResponse();

    await handler(createAuthorizedRequest(), res);

    expect(DataStore.save).toHaveBeenCalledWith(expect.objectContaining({
      s3key: 'photos/film/film.jpg',
      aspectRatio: '1.500',
      blurredBase64: 'data:image/png;base64,Ymx1cg==',
    }));
  });

  it('logs sharp failures without crashing the request', async () => {
    process.env.BLUR_API_TOKEN = 'secret';
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    (fs.readdir as jest.Mock).mockResolvedValue(['film.jpg']);
    (sharp as unknown as jest.Mock).mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      blur: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockRejectedValue(new Error('sharp failed')),
    });
    const res = createResponse();

    await handler(createAuthorizedRequest(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(DataStore.save).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
