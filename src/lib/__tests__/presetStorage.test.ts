import { savePreset, loadPreset, deletePreset, listPresets } from '../presetStorage';

describe('presetStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockPresetData = {
    name: 'Test Preset',
    data: {
      vorname: 'John',
      nachname: 'Doe',
      address: 'Test Street 1',
      plz: '6300',
      ort: 'Zug',
      geburtsdatum: '2024-01-01',
      gemeinde: 'Zug',
      betreuungGeburt: true,
      betreuungWochenbett: false,
    }
  };

  it('saves and loads a preset', () => {
    savePreset(mockPresetData.name, mockPresetData.data);
    const loaded = loadPreset(mockPresetData.name);
    expect(loaded).toEqual(mockPresetData.data);
  });

  it('deletes a preset', () => {
    savePreset(mockPresetData.name, mockPresetData.data);
    deletePreset(mockPresetData.name);
    const loaded = loadPreset(mockPresetData.name);
    expect(loaded).toBeNull();
  });

  it('lists all presets', () => {
    savePreset('Preset 1', mockPresetData.data);
    savePreset('Preset 2', mockPresetData.data);

    const presets = listPresets();
    expect(presets).toHaveLength(2);
    expect(presets).toContain('Preset 1');
    expect(presets).toContain('Preset 2');
  });
});