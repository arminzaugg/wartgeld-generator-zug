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

  describe('preset management', () => {
    it('saves and retrieves presets', () => {
      savePreset(mockPreset);
      const presets = getPresets();
      expect(presets).toHaveLength(1);
      expect(presets[0]).toEqual(mockPreset);
    });

    it('handles multiple presets', () => {
      const secondPreset = { ...mockPreset, id: '456', name: 'Second Preset' };
      savePreset(mockPreset);
      savePreset(secondPreset);
      
      const presets = getPresets();
      expect(presets).toHaveLength(2);
      expect(presets).toContainEqual(mockPreset);
      expect(presets).toContainEqual(secondPreset);
    });

    it('deletes a preset', () => {
      savePreset(mockPreset);
      deletePreset(mockPreset.id);
      const presets = getPresets();
      expect(presets).toHaveLength(0);
    });

    it('handles deleting non-existent preset', () => {
      savePreset(mockPreset);
      deletePreset('non-existent-id');
      const presets = getPresets();
      expect(presets).toHaveLength(1);
    });
  });

  describe('settings management', () => {
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

    it('provides default settings when none exist', () => {
      const settings = getSettings();
      expect(settings.senderInfo).toContain('Martina Mustermann');
      expect(settings.ortRechnungssteller).toBe('Kanton Zug');
      expect(settings.signature).toBeUndefined();
    });

    it('preserves existing signature when updating other fields', () => {
      const mockSignature = 'Existing Signature';
      saveSenderInfo('Initial Info', 'Initial Ort', mockSignature);
      
      saveSenderInfo('New Info', 'New Ort');
      const settings = getSettings();
      
      expect(settings.senderInfo).toBe('New Info');
      expect(settings.ortRechnungssteller).toBe('New Ort');
      expect(settings.signature).toBe(mockSignature);
    });
  });
});