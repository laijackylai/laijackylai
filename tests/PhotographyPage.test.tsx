import { fireEvent, render, screen } from '@testing-library/react';
import Photography from '../pages/photography';

const photosData = [
  { id: 'photo-1', s3key: 'photos/digital/photo-1.jpg', type: 'digital', aspectRatio: '1.500', blurredBase64: 'data:image/png;base64,abc', createdAt: '2026-04-29', url: 'https://example.com/photo-1.jpg' },
  { id: 'photo-2', s3key: 'photos/film/photo-2.jpg', type: 'film', aspectRatio: '0.750', blurredBase64: 'data:image/png;base64,def', createdAt: '2026-04-28', url: 'https://example.com/photo-2.jpg' },
  { id: 'photo-3', s3key: 'photos/film/photo-3.jpg', type: 'film', aspectRatio: '1.000', blurredBase64: null, createdAt: '2026-04-27', url: 'https://example.com/photo-3.jpg' },
];

describe('Photography page', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders an empty photo list with the empty notice hidden only when there are photos', () => {
    render(<Photography photosData={[]} />);

    expect(screen.queryByRole('button', { name: /open .* photograph/i })).not.toBeInTheDocument();
    expect(screen.getByText(/0 photos shown/)).toBeInTheDocument();
  });

  it('renders one image per photo with metadata', () => {
    render(<Photography photosData={photosData as any} />);

    expect(screen.getByAltText('digital photograph photo-1.jpg')).toBeInTheDocument();
    expect(screen.getByAltText('film photograph photo-2.jpg')).toBeInTheDocument();
    expect(screen.getByText('photo-1')).toBeInTheDocument();
    expect(screen.getByText('photos/film/photo-2.jpg')).toBeInTheDocument();
  });

  it('randomizes the photo order on page load', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0);

    render(<Photography photosData={photosData as any} />);

    expect(screen.getAllByRole('button', { name: /^open /i }).map((b) => b.getAttribute('aria-label'))).toEqual([
      'Open film photograph photo-2.jpg',
      'Open film photograph photo-3.jpg',
      'Open digital photograph photo-1.jpg',
    ]);
  });

  it('filters by format with counts', () => {
    render(<Photography photosData={photosData as any} />);

    fireEvent.click(screen.getAllByRole('button', { name: /^film/i })[0]);
    expect(screen.getAllByRole('button', { name: /^open /i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /^film/i })[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('button', { name: /^digital/i })[0]).toHaveTextContent('01');
  });

  it('opens the viewer, steps through photos and closes', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    render(<Photography photosData={photosData as any} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open digital photograph photo-1.jpg' }));
    expect(screen.getByText(/1 \/ 3 — digital · photo-1/)).toBeInTheDocument();

    // jsdom has no showModal, so the viewer stays in a closed <dialog>: query hidden elements
    fireEvent.click(screen.getByRole('button', { name: 'Next photo', hidden: true }));
    expect(screen.getByText(/2 \/ 3 — film · photo-2/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close full resolution photo/i, hidden: true }));
    expect(screen.queryByText(/\/ 3 —/)).not.toBeInTheDocument();
  });
});
