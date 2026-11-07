import { render, screen } from '@testing-library/react';
import GIS from '../pages/gis';
import Music from '../pages/music';

describe('secondary pages', () => {
  it('renders each GIS map as a snap panel', () => {
    render(<GIS />);

    expect(screen.getByAltText(/shooting rates by Toronto neighbourhood/)).toBeInTheDocument();
    expect(screen.getByAltText(/cycling routes/i)).toBeInTheDocument();
    expect(document.querySelectorAll('section.snap')).toHaveLength(2);
  });

  it('renders the music landing page linking to Instagram', () => {
    render(<Music />);

    expect(screen.getByRole('heading', { name: 'Music' })).toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: /instagram/i })) {
      expect(link).toHaveAttribute('href', 'https://www.instagram.com/sing.sang.sunk/');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
