import { fireEvent, render, screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import HorizontalDrawer from '../components/horizontalDrawer';

jest.mock('next/router', () => require('next-router-mock'));

describe('HorizontalDrawer', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
  });

  it('renders desktop links at desktop width', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });

    render(<HorizontalDrawer logoSize={25} width={32} />);

    const nav = within(screen.getByTestId('desktop-nav'));
    const links = nav.getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(nav.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(nav.getByRole('link', { name: /photography/i })).toHaveAttribute('href', '/photography');
    expect(nav.getByRole('link', { name: /music/i })).toHaveAttribute('href', '/music');
    expect(nav.getByRole('link', { name: /gis/i })).toHaveAttribute('href', '/gis');
    expect(links[0].parentElement).toHaveStyle({ width: '32rem' });
  });

  it('highlights the active desktop route', () => {
    mockRouter.setCurrentUrl('/projects');
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });

    render(<HorizontalDrawer logoSize={25} width={32} />);

    const projectsLink = within(screen.getByTestId('desktop-nav')).getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveAttribute('aria-current', 'page');
    expect(projectsLink).not.toHaveClass('bg-sapphire-500');
    expect(projectsLink.lastElementChild).toHaveClass('text-black');
  });

  it('opens and closes the mobile drawer', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });

    render(<HorizontalDrawer logoSize={25} width={28} />);

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    const overlay = screen.getByRole('button', { name: 'Close navigation menu' });
    const drawer = screen.getByTestId('mobile-drawer');

    expect(drawer).toHaveClass('-translate-x-full', 'invisible');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menuButton);
    expect(drawer).toHaveClass('translate-x-0', 'visible');
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(overlay);
    expect(drawer).toHaveClass('-translate-x-full', 'invisible');
  });
});
