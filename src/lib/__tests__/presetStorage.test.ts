import { describe, it, expect, beforeEach } from 'vitest';
import { savePreset, getPresets, deletePreset, getSettings, saveSenderInfo } from '../presetStorage';

describe('presetStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockPreset = {
    id: '123',
    name: 'Test Preset',
    fields: {
      companyName: 'Test Company',
      address: 'Test Street 1',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
    }
  };

  it('saves and retrieves presets', () => {
    savePreset(mockPreset);
    const presets = getPresets();
    expect(presets).toHaveLength(1);
    expect(presets[0]).toEqual(mockPreset);
  });

  it('deletes a preset', () => {
    savePreset(mockPreset);
    deletePreset(mockPreset.id);
    const presets = getPresets();
    expect(presets).toHaveLength(0);
  });

  it('manages sender info settings', () => {
    const mockInfo = 'Test Sender Info';
    const mockOrt = 'Test Ort';
    const mockSignature = 'Test Signature';

    saveSenderInfo(mockInfo, mockOrt, mockSignature);
    const settings = getSettings();

    expect(settings.senderInfo).toBe(mockInfo);
    expect(settings.ortRechnungssteller).toBe(mockOrt);
    expect(settings.signature).toBe(mockSignature);
  });
});