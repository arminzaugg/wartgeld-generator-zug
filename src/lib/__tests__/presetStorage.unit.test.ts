import { describe, it, expect, beforeEach } from 'vitest';
import { getSettings, saveSenderInfo } from '../presetStorage';

describe('presetStorage', () => {
  beforeEach(() => {
    localStorage.clear();
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

    it('removes the signature when null is passed', () => {
      saveSenderInfo('Info', 'Ort', 'Existing Signature');
      saveSenderInfo('Info', 'Ort', null);
      expect(getSettings().signature).toBeUndefined();
    });
  });
});