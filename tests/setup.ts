import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { clipStore } from '@/state/clips';

afterEach(() => {
  cleanup();
  // the shared clip store outlives a test: put it back to the designed night
  clipStore.reset();
});

// jsdom lacks these; Base UI and the components touch them.
if (!('ResizeObserver' in globalThis)) {
  class RO { observe() {} unobserve() {} disconnect() {} }
  (globalThis as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO;
}
if (!window.matchMedia) {
  window.matchMedia = (q: string) => ({ matches: false, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList;
}
if (!HTMLElement.prototype.scrollIntoView) HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = function setPointerCapture() {};
  HTMLElement.prototype.releasePointerCapture = function releasePointerCapture() {};
  HTMLElement.prototype.hasPointerCapture = function hasPointerCapture() { return false; };
}
