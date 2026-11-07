import { render, screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import GIS from '../pages/gis';
import Music from '../pages/music';

jest.mock('next/router', () => require('next-router-mock'));

describe('secondary pages', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
  });

  it('renders GIS images with blur placeholders in a snap container', () => {
    render(<GIS />);

    expect(screen.getByAltText('torontoShootingRates2022')).toBeInTheDocument();
    expect(screen.getByAltText('CycleRoutes')).toBeInTheDocument();
    expect(document.querySelector('.snap-y.snap-mandatory')).toBeInTheDocument();
  });

  it('renders the music page shell', () => {
    render(<Music />);

    const nav = within(screen.getByTestId('desktop-nav'));
    expect(nav.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('heading', { name: 'Music' })).toBeInTheDocument();
  });
});
