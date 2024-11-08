export interface Preset {
  id: string;
  name: string;
  fields: {
    companyName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    additionalNotes?: string;
  };
}

const STORAGE_KEY = 'form-presets';

export const savePreset = (preset: Preset): void => {
  const presets = getPresets();
  presets.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
};

export const getPresets = (): Preset[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deletePreset = (id: string): void => {
  const presets = getPresets().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
};