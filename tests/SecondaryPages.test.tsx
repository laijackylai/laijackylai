import { render, screen } from '@testing-library/react';
import GIS from '../pages/gis';
import Music from '../pages/music';

describe('secondary pages', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
  });

  it('renders GIS images with blur placeholders in a snap container', () => {
    render(<GIS />);

    expect(screen.getByAltText('torontoShootingRates2022')).toBeInTheDocument();
    expect(screen.getByAltText('CycleRoutes')).toBeInTheDocument();
    expect(document.querySelector('.snap-y.snap-mandatory')).toBeInTheDocument();
  });

  it('renders the music page shell and removes its scroll listener', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const removeEventListener = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<Music />);

    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByText('Music Page')).toBeInTheDocument();

    unmount();

    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
