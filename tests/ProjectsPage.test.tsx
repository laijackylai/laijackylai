import { render, screen } from '@testing-library/react';
import Projects, { getStaticProps } from '../pages/projects';
import { publicStorageUrl } from '../lib/storage';

jest.mock('plaiceholder', () => ({
  getPlaiceholder: jest.fn().mockResolvedValue({ base64: 'data:image/png;base64,placeholder' }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/projects',
  }),
}));

describe('Projects page', () => {
  const originalStorageBaseUrl = process.env.STORAGE_BASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    window.scrollTo = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    }) as any;
  });

  afterEach(() => {
    if (originalStorageBaseUrl === undefined) {
      delete process.env.STORAGE_BASE_URL;
    } else {
      process.env.STORAGE_BASE_URL = originalStorageBaseUrl;
    }
  });

  it('renders the projects in order, without the Nuxt demo, and links the senior design PDF', () => {
    render(<Projects imageUrls={['https://example.com/takcarly.png']} base64={['data:image/png;base64,abc']} />);

    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual([
      'rbrmesh', 'PitchPose', 'Flight Replay', 'Iceland Road Trip Planner',
      '3D Tidal and Cloud Visualization System', 'loaders.gl terrain', 'Canadian Fires', 'Takcarly',
    ]);
    expect(screen.queryByText(/NUXT/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /technical report/i })).toHaveAttribute('href', '/docs/FYP-Final-Report.pdf');
    expect(screen.getByAltText('Takcarly app screenshot 1')).toBeInTheDocument();
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

  it('keeps image URLs when blur placeholder loading fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('fetch failed'));

    await expect(getStaticProps({} as any)).resolves.toEqual({
      props: {
        imageUrls: [
          'https://amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc.s3.ap-southeast-1.amazonaws.com/public/takcarly/takcarly_1.png',
          'https://amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc.s3.ap-southeast-1.amazonaws.com/public/takcarly/takcarly_2.png',
          'https://amplify-d2ukbi00figpw1-ma-laijackylaistoragebucket-fy9zegnfclvc.s3.ap-southeast-1.amazonaws.com/public/takcarly/takcarly_3.png',
        ],
        base64: [null, null, null],
      },
      revalidate: 3600,
    });
  });

  it('treats non-OK image responses as missing blur placeholders', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 403 });

    const result: any = await getStaticProps({} as any);
    expect(result.props.base64).toEqual([null, null, null]);
  });

  it('preserves public/ prefixes in public storage URLs', () => {
    process.env.STORAGE_BASE_URL = 'https://example.s3.amazonaws.com';

    expect(publicStorageUrl('public/takcarly/takcarly_1.png')).toBe(
      'https://example.s3.amazonaws.com/public/takcarly/takcarly_1.png'
    );
  });

});
