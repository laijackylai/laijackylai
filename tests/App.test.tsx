import { act, fireEvent, render, screen } from '@testing-library/react'
import App from '../pages'

jest.mock('next/router', () => require('next-router-mock'));

describe('App', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 900 });
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    Object.defineProperty(window, 'pageYOffset', { writable: true, configurable: true, value: 0 });
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    };
    window.cancelAnimationFrame = jest.fn();
    window.scrollTo = jest.fn();
  });

  it('renders the current drawer links and journey items', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /photography/i })).toHaveAttribute('href', '/photography');
    expect(screen.getByRole('link', { name: /music/i })).toHaveAttribute('href', '/music');
    expect(screen.getByRole('link', { name: /gis/i })).toHaveAttribute('href', '/gis');
    expect(screen.getByRole('link', { name: /linkedin_logo/i })).toHaveAttribute('href', 'https://linkedin.com/in/laijackylai');
    expect(screen.getByRole('link', { name: /github_logo/i })).toHaveAttribute('href', 'https://github.com/laijackylai');
    expect(screen.getByRole('link', { name: /instagram_logo/i })).toHaveAttribute('href', 'https://www.instagram.com/laijackylai/');
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', 'mailto:laijackylai@gmail.com');

    expect(screen.getByText('DATA GEN ENGINEER @ GIESECKE+DEVRIENT')).toBeInTheDocument();
    expect(screen.getByText('SOFTWARE ENGINEER @ VOTANIC LIMITED')).toBeInTheDocument();
    expect(screen.getByText('CO-FOUNDER @ VIVABLEE LIMITED')).toBeInTheDocument();
    expect(screen.getByText('CO-OP @ HONG KONG OBSERVATORY')).toBeInTheDocument();
    expect(screen.getByText('PART-TIME RESEARCH ANALYST @ CENTALINE PROPERTY AGENCY')).toBeInTheDocument();
  })

  it('scroll arrows move down from the hero and back to top after scrolling', () => {
    render(<App />)

    const downArrow = document.querySelector('button svg path[d="M19.5 8.25l-7.5 7.5-7.5-7.5"]')?.closest('button');
    expect(downArrow).toBeInTheDocument();
    fireEvent.click(downArrow as HTMLButtonElement);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 300, behavior: 'smooth' });

    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 10 });
    fireEvent.scroll(window);

    const upArrow = document.querySelector('button svg path[d="M4.5 15.75l7.5-7.5 7.5 7.5"]')?.closest('button');
    expect(upArrow).toBeInTheDocument();
    fireEvent.click(upArrow as HTMLButtonElement);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  })

  it('deduplicates scroll updates while a frame is pending', () => {
    const frameCallbacks: FrameRequestCallback[] = [];
    window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });

    render(<App />);

    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 10 });
    fireEvent.scroll(window);
    fireEvent.scroll(window);

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      frameCallbacks[0](0);
    });

    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 20 });
    fireEvent.scroll(window);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  })
})
