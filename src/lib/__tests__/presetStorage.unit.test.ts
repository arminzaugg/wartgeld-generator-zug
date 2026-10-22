import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SETTINGS_CHANGED_EVENT, getSettings, getStoredSettings, replaceSettings, updateSettings } from '../presetStorage';

describe('presetStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default settings when none exist', () => {
    const settings = getSettings();
    expect(settings.senderInfo).toContain('Martina Mustermann');
    expect(settings.ortRechnungssteller).toBe('Kanton Zug');
    expect(settings.signature).toBeUndefined();
    expect(settings.rechnungsDatum).toBe('');
  });

  it('stores all settings fields', () => {
    updateSettings({
      senderInfo: 'Test Sender Info',
      ortRechnungssteller: 'Test Ort',
      signature: 'Test Signature',
      rechnungsDatum: '2025-03-01',
    });

    expect(getSettings()).toEqual({
      senderInfo: 'Test Sender Info',
      ortRechnungssteller: 'Test Ort',
      signature: 'Test Signature',
      rechnungsDatum: '2025-03-01',
    });
  });

  it('preserves existing fields when updating others', () => {
    updateSettings({ senderInfo: 'Initial Info', signature: 'Existing Signature' });
    updateSettings({ senderInfo: 'New Info', ortRechnungssteller: 'New Ort' });

    const settings = getSettings();
    expect(settings.senderInfo).toBe('New Info');
    expect(settings.ortRechnungssteller).toBe('New Ort');
    expect(settings.signature).toBe('Existing Signature');
  });

  it('removes the signature when null is passed', () => {
    updateSettings({ signature: 'Existing Signature' });
    updateSettings({ signature: null });
    expect(getSettings().signature).toBeUndefined();
  });

  it('keeps reading settings stored by older versions', () => {
    localStorage.setItem('form-settings', JSON.stringify({ senderInfo: 'Old', ortRechnungssteller: 'Zug' }));
    expect(getSettings()).toMatchObject({ senderInfo: 'Old', ortRechnungssteller: 'Zug', rechnungsDatum: '' });
  });
});

// @covers FR-01.06
describe('stored settings for export and import', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns only what the user saved, without placeholder defaults', () => {
    expect(getStoredSettings()).toEqual({});
    updateSettings({ senderInfo: 'Anna' });
    expect(getStoredSettings(), 'saving one field writes no defaults for the others').toEqual({ senderInfo: 'Anna' });
  });

  it('saving only a signature stores neither the example sender nor the default place', () => {
    updateSettings({ signature: 'data:image/png;base64,AAAA' });
    expect(getStoredSettings()).toEqual({ signature: 'data:image/png;base64,AAAA' });
    expect(getSettings().ortRechnungssteller, 'the PDF still falls back to the default place').toBe('Kanton Zug');
  });

  it('ignores stored placeholder text so it is never exported as real data', () => {
    updateSettings({ ortRechnungssteller: 'Zug' });
    expect(getStoredSettings().senderInfo).toBeUndefined();
  });

  it('falls back to the defaults when the stored settings are unreadable', () => {
    localStorage.setItem('form-settings', '{broken');
    expect(getSettings().ortRechnungssteller, 'the page still opens, so a backup can be loaded').toBe('Kanton Zug');
  });

  it('treats unreadable stored settings as nothing saved', () => {
    localStorage.setItem('form-settings', '{broken');
    expect(getStoredSettings()).toEqual({});
  });

  it('treats stored data that is not a settings object as nothing saved', () => {
    for (const raw of ['"abc"', '[1,2]', '42', 'null']) {
      localStorage.setItem('form-settings', raw);
      expect(getStoredSettings(), raw).toEqual({});
      updateSettings({ ortRechnungssteller: 'Zug' });
      expect(JSON.parse(localStorage.getItem('form-settings')!), `${raw}: no junk keys after a save`).toEqual({ ortRechnungssteller: 'Zug' });
    }
  });

  it('replaces all stored settings with the imported ones', () => {
    updateSettings({ senderInfo: 'Old', signature: 'old-signature' });
    replaceSettings({ senderInfo: 'New', ortRechnungssteller: 'Baar' });
    expect(getSettings()).toMatchObject({ senderInfo: 'New', ortRechnungssteller: 'Baar', signature: undefined });
  });

  it('leaves the stored settings unchanged when the browser refuses to store them', () => {
    updateSettings({ senderInfo: 'Old' });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => replaceSettings({ senderInfo: 'New' })).toThrow();
    setItem.mockRestore();
    expect(getSettings().senderInfo).toBe('Old');
  });
});

// @covers FR-01.06
describe('settings change notification', () => {
  beforeEach(() => localStorage.clear());

  it('announces a successful save and a successful import', () => {
    const listener = vi.fn();
    window.addEventListener(SETTINGS_CHANGED_EVENT, listener);
    updateSettings({ senderInfo: 'Anna' });
    replaceSettings({ senderInfo: 'Lea' });
    window.removeEventListener(SETTINGS_CHANGED_EVENT, listener);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('stays silent when the browser refuses to store the settings', () => {
    const listener = vi.fn();
    window.addEventListener(SETTINGS_CHANGED_EVENT, listener);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => replaceSettings({ senderInfo: 'New' })).toThrow();
    expect(() => updateSettings({ senderInfo: 'New' })).toThrow();
    setItem.mockRestore();
    window.removeEventListener(SETTINGS_CHANGED_EVENT, listener);
    expect(listener).not.toHaveBeenCalled();
  });
});
