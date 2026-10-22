// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { contentTypeFor, entryScriptOf, uploadOrder } from '../siteFiles.mjs';

// @covers FR-01.11
describe('site upload helpers', () => {
  it('uploads assets first and index.html last, skipping hidden files', () => {
    expect(uploadOrder(['index.html', 'assets/index-a1.js', '.DS_Store', 'assets/.keep', 'zz-robots.txt', 'og-image.svg', 'assets/index-b2.css']))
      .toEqual(['assets/index-a1.js', 'assets/index-b2.css', 'og-image.svg', 'zz-robots.txt', 'index.html']);
  });

  it.each([
    ['index.html', 'text/html; charset=utf-8'],
    ['assets/index-a1.js', 'text/javascript; charset=utf-8'],
    ['assets/index-b2.css', 'text/css; charset=utf-8'],
    ['og-image.svg', 'image/svg+xml'],
    ['favicon.ico', 'image/x-icon'],
    ['assets/font.woff2', 'font/woff2'],
    ['manifest.webmanifest', 'application/manifest+json'],
    ['data.json', 'application/json'],
    ['logo.png', 'image/png'],
    ['robots.txt', 'text/plain; charset=utf-8'],
    ['unknown.bin', 'application/octet-stream'],
  ])('sends %s as %s', (file, type) => {
    expect(contentTypeFor(file)).toBe(type);
  });

  it('finds the entry script of a built page', () => {
    expect(entryScriptOf('<script type="module" crossorigin src="/assets/index-cJnU7mD6.js"></script>')).toBe('/assets/index-cJnU7mD6.js');
    expect(entryScriptOf('<html></html>')).toBeNull();
  });
});
