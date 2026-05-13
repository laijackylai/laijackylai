import { fireEvent, render, screen } from '@testing-library/react';
import Photography from '../pages/photography';

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/photography',
  }),
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
  {
    id: 'photo-3',
    s3key: 'photos/film/photo-3.jpg',
    type: 'film',
    aspectRatio: '1.000',
    blurredBase64: null,
    createdAt: '2026-04-27',
    url: 'https://example.com/photo-3.jpg',
  },
];

describe('Photography page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('randomizes the photo order on page load', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    render(<Photography photosData={photosData as any} />);

    const photoButtons = screen.getAllByRole('button', { name: /open full resolution photo/i });
    expect(photoButtons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Open full resolution photo photos/film/photo-2.jpg',
      'Open full resolution photo photos/film/photo-3.jpg',
      'Open full resolution photo photos/digital/photo-1.jpg',
    ]);
  });

  it('opens a full resolution photo modal from a photo click', () => {
    render(<Photography photosData={photosData as any} />);

    fireEvent.click(screen.getByRole('button', { name: /open full resolution photo photos\/digital\/photo-1\.jpg/i }));

    expect(screen.getByRole('dialog', { name: /full resolution photo photos\/digital\/photo-1\.jpg/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close full resolution photo/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

});
