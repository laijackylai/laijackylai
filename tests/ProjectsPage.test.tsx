import { fireEvent, render, screen } from '@testing-library/react';
import Projects, { getStaticProps, publicStorageUrl } from '../pages/projects';

jest.mock('plaiceholder', () => ({
  getPlaiceholder: jest.fn().mockResolvedValue({ base64: 'data:image/png;base64,placeholder' }),
}));

describe('Projects page', () => {
  const originalStorageBaseUrl = process.env.STORAGE_BASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    window.scrollTo = jest.fn();
    window.open = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    }) as any;
  });

  afterEach(() => {
    process.env.STORAGE_BASE_URL = originalStorageBaseUrl;
  });

  it('renders the five project sections and opens the senior design PDF', () => {
    render(<Projects imageUrls={['https://example.com/takcarly.png']} base64={['data:image/png;base64,abc']} />);

    expect(screen.getByText('Open Source Contribution')).toBeInTheDocument();
    expect(screen.getByText('Canadian Fires')).toBeInTheDocument();
    expect(screen.getByText('NUXT Google Maps')).toBeInTheDocument();
    expect(screen.getByText('Takcarly')).toBeInTheDocument();
    expect(screen.getByText('Senior Design Project')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /download/i }));
    expect(window.open).toHaveBeenCalledWith('/docs/FYP-Final-Report.pdf', '_blank');
  });

  it('keeps external links isolated from the opener', () => {
    render(<Projects imageUrls={[]} base64={[]} />);

    const externalLinks = screen.getAllByRole('link').filter((link) => (
      link.getAttribute('target') === '_blank'
    ));

    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('returns empty image data when static project data loading fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('fetch failed'));

    await expect(getStaticProps({} as any)).resolves.toEqual({
      props: {
        imageUrls: [],
        base64: [],
      },
    });
  });

  it('preserves public/ prefixes in public storage URLs', () => {
    process.env.STORAGE_BASE_URL = 'https://example.s3.amazonaws.com';

    expect(publicStorageUrl('public/takcarly/takcarly_1.png')).toBe(
      'https://example.s3.amazonaws.com/public/takcarly/takcarly_1.png'
    );
  });

});
