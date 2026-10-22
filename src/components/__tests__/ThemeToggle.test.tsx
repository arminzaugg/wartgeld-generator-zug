import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

// System appearance boundary: a matchMedia fake whose answer can change while the app is open.
let systemDark = false;
let listeners: (() => void)[] = [];
const fakeSystem = (dark: boolean) => {
  systemDark = dark;
  listeners = [];
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    get matches() { return systemDark && query === '(prefers-color-scheme: dark)'; }, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    addEventListener: vi.fn((_: string, l: () => void) => { listeners.push(l); }),
    removeEventListener: vi.fn((_: string, l: () => void) => { listeners = listeners.filter(x => x !== l); }),
  }));
};

const renderToggle = () => render(<ThemeProvider defaultTheme="system" storageKey="app-theme"><ThemeToggle /></ThemeProvider>);
const openMenu = async () => {
  screen.getByRole('button', { name: 'Darstellung' }).focus();
  await userEvent.keyboard('{Enter}');
};
const isDark = () => document.documentElement.classList.contains('dark');

// @covers FR-01.09
describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    fakeSystem(false);
  });
  afterEach(() => vi.restoreAllMocks());

  it('offers Hell, Dunkel and System under "Darstellung", with the current choice checked', async () => {
    localStorage.setItem('app-theme', 'dark');
    renderToggle();
    await openMenu();
    expect(screen.getByText('Darstellung', { selector: '[role=menu] *' })).toBeInTheDocument();
    expect(screen.getAllByRole('menuitemradio').map(item => item.textContent)).toEqual(['Hell', 'Dunkel', 'System']);
    expect(screen.getByRole('menuitemradio', { name: 'Dunkel' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Hell' })).toHaveAttribute('aria-checked', 'false');
  });

  it('switches to dark and remembers the choice', async () => {
    renderToggle();
    await openMenu();
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Dunkel' }));
    expect(isDark()).toBe(true);
    expect(localStorage.getItem('app-theme')).toBe('dark');
  });

  it('with System, follows the operating system, also when it changes while open', async () => {
    fakeSystem(true);
    renderToggle();
    expect(isDark(), 'nothing stored means System').toBe(true);

    act(() => { systemDark = false; listeners.forEach(l => l()); });

    expect(isDark()).toBe(false);
  });

  it('stops following the operating system after choosing Hell', async () => {
    renderToggle();
    await openMenu();
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Hell' }));
    expect(listeners, 'listener removed when leaving System').toHaveLength(0);
  });

  it('treats an unknown stored value as System instead of adding it as a class', () => {
    fakeSystem(true);
    localStorage.setItem('app-theme', 'purple');
    renderToggle();
    expect(document.documentElement.className).toBe('dark');
  });

  it('still opens when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
    renderToggle();
    expect(screen.getByRole('button', { name: 'Darstellung' })).toBeInTheDocument();
  });
});
