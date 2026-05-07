import { render, screen } from '@testing-library/react';
import AnimatedText from '../components/animatedText';
import Title from '../components/title';
import ocra from '../components/font';

jest.mock('next/head', () => {
  return ({ children }: { children: any }) => <>{children}</>;
});

describe('static components', () => {
  it('renders animated text characters without dropping spaces', () => {
    render(<AnimatedText text="Hi Jacky" />);

    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(document.querySelectorAll('.animate-text-reveal')).toHaveLength(8);
  });

  it('sets the page title and favicon', () => {
    const { container } = render(<Title />);

    expect(container.querySelector('title')).toHaveTextContent('HKLai');
    expect(container.querySelector('link[rel="icon"]')).toHaveAttribute('href', 'logos/logo_black.ico');
  });

  it('exports the local font variable class', () => {
    expect(ocra.variable).toBeTruthy();
  });
});
