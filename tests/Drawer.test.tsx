import { render, screen } from '@testing-library/react';
import ResponsiveDrawer from '../components/drawer';

jest.mock('next/link', () => {
  return ({ children, href }: { children: any, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('ResponsiveDrawer', () => {
  it('renders the logo image', () => {
    render(<ResponsiveDrawer />);
    const logoImage = screen.getByAltText('logo');
    expect(logoImage).toBeInTheDocument();
  });

  it('renders the navigation links', () => {
    render(<ResponsiveDrawer />);
    const navigationLinks = screen.getAllByRole('link');
    expect(navigationLinks).toHaveLength(5);
    expect(navigationLinks[1]).toHaveTextContent('Work');
    expect(navigationLinks[2]).toHaveTextContent('Tech');
    expect(navigationLinks[3]).toHaveTextContent('Photography');
    expect(navigationLinks[4]).toHaveTextContent('Music');
  });
});
