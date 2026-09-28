import { describe, it, expect, beforeEach } from 'vitest';
import { getSettings, updateSettings } from '../presetStorage';

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
