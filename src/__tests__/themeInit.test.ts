import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');
const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';

const setSystemDark = (dark: boolean) =>
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: dark && query === '(prefers-color-scheme: dark)', media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  }));

const run = () => new Function(inlineScript)();
const themeClass = () => document.documentElement.className;

// @covers FR-01.09
describe('theme applied before the app loads', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });
  afterEach(() => vi.restoreAllMocks());

  it('is a classic inline script in the head, before the app module', () => {
    const head = html.slice(0, html.indexOf('</head>'));
    expect(head, 'render-blocking, so it runs before first paint').toContain('<script>');
    expect(html.indexOf('<script>')).toBeLessThan(html.indexOf('type="module"'));
  });

  it('reads the same storage key as the theme provider in App.tsx', () => {
    const app = readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
    const key = app.match(/storageKey="([^"]+)"/)?.[1];
    expect(key).toBe('app-theme');
    expect(inlineScript).toContain(`"${key}"`);
  });

  it('applies a stored light or dark choice', () => {
    setSystemDark(true);
    localStorage.setItem('app-theme', 'light');
    run();
    expect(themeClass()).toBe('light');
    localStorage.setItem('app-theme', 'dark');
    run();
    expect(themeClass()).toBe('dark');
  });

  it('follows the system for "system", nothing stored or an unknown value', () => {
    setSystemDark(true);
    for (const stored of ['system', null, 'purple']) {
      localStorage.clear();
      if (stored) localStorage.setItem('app-theme', stored);
      run();
      expect(themeClass(), String(stored)).toBe('dark');
    }
  });

  it('still follows the system when storage cannot be read', () => {
    setSystemDark(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
    expect(run).not.toThrow();
    expect(themeClass()).toBe('dark');
  });

  it('marks the page as German', () => {
    expect(html).toMatch(/<html lang="de">/);
  });
});
