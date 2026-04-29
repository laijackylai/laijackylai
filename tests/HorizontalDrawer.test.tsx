import { fireEvent, render, screen } from '@testing-library/react';
import HorizontalDrawer from '../components/horizontalDrawer';

describe('HorizontalDrawer', () => {
  it('renders desktop links at desktop width', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });

    render(<HorizontalDrawer logoSize={25} width={32} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /photography/i })).toHaveAttribute('href', '/photography');
    expect(screen.getByRole('link', { name: /music/i })).toHaveAttribute('href', '/music');
    expect(screen.getByRole('link', { name: /gis/i })).toHaveAttribute('href', '/gis');
    expect(links[0].parentElement).toHaveStyle({ width: '32rem' });
  });

  it('opens and closes the mobile drawer', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });

    render(<HorizontalDrawer logoSize={25} width={28} />);

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    const overlay = screen.getByRole('button', { name: 'Close navigation menu' });
    const drawer = overlay.parentElement?.parentElement as HTMLElement;

    expect(drawer.className).toContain('-translate-x-full');
    fireEvent.click(menuButton);
    expect(drawer.className).toContain('translate-x-0');
    fireEvent.click(overlay);
    expect(drawer.className).toContain('-translate-x-full');
  });
});
