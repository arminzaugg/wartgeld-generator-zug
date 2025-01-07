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

export interface Settings {
  senderInfo: string;
  ortRechnungssteller: string;
  signature?: string;
}

const STORAGE_KEY = 'form-presets';
const SETTINGS_KEY = 'form-settings';

const DEFAULT_SENDER_INFO = `Martina Mustermann
Strasse
PLZ Ort
Email
Mobile
IBAN
QR IBAN`;

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

export const saveSenderInfo = (info: string, ortRechnungssteller: string, signature?: string): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ 
    senderInfo: info, 
    ortRechnungssteller,
    signature
  }));
};

export const getSettings = (): Settings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return { senderInfo: DEFAULT_SENDER_INFO, ortRechnungssteller: 'Kanton Zug' };
  const settings: Settings = JSON.parse(stored);
  return {
    senderInfo: settings.senderInfo || DEFAULT_SENDER_INFO,
    ortRechnungssteller: settings.ortRechnungssteller || 'Kanton Zug',
    signature: settings.signature
  };
};