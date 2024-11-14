import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock canvas and its context for SignaturePad
const mockContext = {
  canvas: document.createElement('canvas'),
  fillStyle: '#000000',
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8Array([]) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  getContextAttributes: vi.fn(() => ({})),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over'
} as unknown as CanvasRenderingContext2D;

// Mock getContext to return our mock context
global.HTMLCanvasElement.prototype.getContext = function(contextType: string) {
  if (contextType === '2d') {
    return mockContext;
  }
  return null;
};

global.HTMLCanvasElement.prototype.toDataURL = function() {
  return '';
};

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});