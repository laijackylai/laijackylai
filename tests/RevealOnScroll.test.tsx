import { render, screen } from '@testing-library/react';
import RevealOnScroll from '../components/reviewOnScroll';

describe('RevealOnScroll', () => {
  beforeEach(() => {
    (global.IntersectionObserver as any).instances = [];
  });

  it('renders children and becomes visible after intersection', () => {
    render(<RevealOnScroll>Visible child</RevealOnScroll>);

    expect(screen.getByText('Visible child')).toBeInTheDocument();
    expect(screen.getByText('Visible child')).toHaveClass('opacity-100');
  });

  it('unobserves the mounted element on cleanup', () => {
    const { unmount } = render(<RevealOnScroll>Cleanup child</RevealOnScroll>);
    const observer = (global.IntersectionObserver as any).instances[0];

    unmount();

    expect(observer.unobserve).toHaveBeenCalled();
  });
});
