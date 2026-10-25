import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} })) });
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
Element.prototype.scrollIntoView = vi.fn();
const computedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = element => computedStyle(element);
// JSDOM has no layout engine; PrimeReact uses nonzero dimensions to place overlays.
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 40 });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 160 });
Object.defineProperty(HTMLElement.prototype, 'offsetParent', { configurable: true, get() { return this.parentElement; } });
