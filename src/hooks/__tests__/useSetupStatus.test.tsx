import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSetupStatus } from '../useSetupStatus';
import { SETTINGS_CHANGED_EVENT, updateSettings } from '@/lib/presetStorage';

// @covers FR-01.06
describe('useSetupStatus', () => {
  beforeEach(() => localStorage.clear());

  it('reports the missing items from the stored settings, ignoring the stored example sender', () => {
    localStorage.setItem('form-settings', JSON.stringify({
      senderInfo: 'Martina Mustermann\nStrasse\nPLZ Ort\nEmail\nMobile\nIBAN\nQR IBAN', ortRechnungssteller: 'Zug',
    }));
    const { result } = renderHook(() => useSetupStatus());
    expect(result.current).toEqual(['Rechnungsstellerin', 'Unterschrift']);
  });

  it('treats unreadable stored settings as nothing saved', () => {
    localStorage.setItem('form-settings', '{broken');
    const { result } = renderHook(() => useSetupStatus());
    expect(result.current).toHaveLength(3);
  });

  it('updates as soon as this tab saves a setting', () => {
    const { result } = renderHook(() => useSetupStatus());
    act(() => updateSettings({ signature: 'data:image/png;base64,AA' }));
    expect(result.current).toEqual(['Rechnungsstellerin', 'Ort der Ausstellung']);
  });

  it('updates when another tab changes the settings', () => {
    const { result } = renderHook(() => useSetupStatus());
    act(() => {
      localStorage.setItem('form-settings', JSON.stringify({ senderInfo: 'Anna', ortRechnungssteller: 'Zug', signature: 'x' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'form-settings' }));
    });
    expect(result.current).toEqual([]);
  });

  it('keeps the same answer between unrelated renders', () => {
    const { result, rerender } = renderHook(() => useSetupStatus());
    const first = result.current;
    rerender();
    expect(result.current, 'stable snapshot, no render loop').toBe(first);
  });

  it('stops listening when unmounted', () => {
    let renders = 0;
    const { unmount } = renderHook(() => { renders += 1; return useSetupStatus(); });
    unmount();
    const before = renders;
    act(() => {
      updateSettings({ ortRechnungssteller: 'Zug' });
      window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
      window.dispatchEvent(new StorageEvent('storage', { key: 'form-settings' }));
    });
    expect(renders, 'no render after unmount').toBe(before);
  });

  it('notices a change even when the stored text is read again without an event', () => {
    const { result, rerender } = renderHook(() => useSetupStatus());
    localStorage.setItem('form-settings', JSON.stringify({ senderInfo: 'Anna', ortRechnungssteller: 'Zug', signature: 'x' }));
    rerender();
    expect(result.current).toEqual([]);
  });
});
