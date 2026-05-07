import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ResponsiveDrawer from '../components/drawer';

jest.mock('next/link', () => {
  return ({ children, href }: { children: any, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('ResponsiveDrawer', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    };
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the logo image', () => {
    render(<ResponsiveDrawer />);
    const logoImage = screen.getByAltText('logo');
    expect(logoImage).toBeInTheDocument();
  });

  it('renders the navigation links', () => {
    render(<ResponsiveDrawer />);
    const navigationLinks = screen.getAllByRole('link');
    expect(navigationLinks).toHaveLength(5);
    expect(navigationLinks[1]).toHaveTextContent('Projects');
    expect(navigationLinks[1]).toHaveAttribute('href', '/projects');
    expect(navigationLinks[2]).toHaveTextContent('Photography');
    expect(navigationLinks[2]).toHaveAttribute('href', '/photography');
    expect(navigationLinks[3]).toHaveTextContent('Music');
    expect(navigationLinks[3]).toHaveAttribute('href', '/music');
    expect(navigationLinks[4]).toHaveTextContent('GIS');
    expect(navigationLinks[4]).toHaveAttribute('href', '/gis');
  });

  it('removes resize and scroll listeners on unmount', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const removeEventListener = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ResponsiveDrawer />);
    unmount();

    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('uses compact logo sizing and gap on mobile', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });

    render(<ResponsiveDrawer />);

    await waitFor(() => {
      expect(screen.getByAltText('logo')).toHaveAttribute('width', '50');
    });
    expect(screen.getByRole('list')).toHaveStyle({ gap: '4rem' });
  });

  it('clamps logo width to the minimum after scrolling past the threshold', async () => {
    render(<ResponsiveDrawer />);

    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 200 });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByAltText('logo')).toHaveAttribute('width', '50');
    });
  });
});
