import '@testing-library/jest-dom/extend-expect';

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = jest.fn((target) => {
      this.callback([{ isIntersecting: true, target }]);
    });
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    MockIntersectionObserver.instances.push(this);
  }
}

MockIntersectionObserver.instances = [];

global.IntersectionObserver = MockIntersectionObserver;

// jsdom has no matchMedia: report reduced motion so lib/site.js skips canvas and animation work
window.matchMedia = window.matchMedia || ((query) => ({
  matches: query.includes('reduce'),
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
}));
