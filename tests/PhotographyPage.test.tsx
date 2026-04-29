import { render, screen } from '@testing-library/react';
import Photography, { getServerSideProps } from '../pages/photography';
import { DataStore, Storage } from 'aws-amplify';

jest.mock('../src/aws-exports', () => ({}));
jest.mock('aws-amplify', () => ({
  DataStore: {
    query: jest.fn(),
  },
  Storage: {
    get: jest.fn(),
  },
  graphqlOperation: jest.fn(),
}));
jest.mock('../src/models', () => ({
  Photo: jest.fn(),
}));

const photosData = [
  {
    id: 'photo-1',
    s3key: 'photos/digital/photo-1.jpg',
    type: 'digital',
    aspectRatio: '1.500',
    blurredBase64: 'data:image/png;base64,abc',
    createdAt: '2026-04-29',
    url: 'https://example.com/photo-1.jpg',
  },
  {
    id: 'photo-2',
    s3key: 'photos/film/photo-2.jpg',
    type: 'film',
    aspectRatio: '0.750',
    blurredBase64: 'data:image/png;base64,def',
    createdAt: '2026-04-28',
    url: 'https://example.com/photo-2.jpg',
  },
];

describe('Photography page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    window.scrollTo = jest.fn();
  });

  it('renders an empty photo list without crashing', () => {
    render(<Photography photosData={[]} />);

    expect(screen.queryByRole('img', { name: /photos\//i })).not.toBeInTheDocument();
  });

  it('renders one image per photo with metadata', () => {
    render(<Photography photosData={photosData as any} />);

    expect(screen.getByAltText('photos/digital/photo-1.jpg')).toBeInTheDocument();
    expect(screen.getByAltText('photos/film/photo-2.jpg')).toBeInTheDocument();
    expect(screen.getByText('photo-1')).toBeInTheDocument();
    expect(screen.getByText('photo-2')).toBeInTheDocument();
  });

  it('returns an empty list when DataStore query fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    (DataStore.query as jest.Mock).mockRejectedValue(new Error('query failed'));

    await expect(getServerSideProps({} as any)).resolves.toEqual({
      props: {
        photosData: [],
      },
    });
    expect(Storage.get).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
