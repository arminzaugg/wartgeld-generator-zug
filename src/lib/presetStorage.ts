export interface Settings {
  senderInfo: string;
  ortRechnungssteller: string;
  signature?: string;
  /** Fixed invoice date (`YYYY-MM-DD`); empty means "today". */
  rechnungsDatum: string;
}

/** Fields to change; `signature: null` removes the stored signature. */
export type SettingsUpdate = Partial<Omit<Settings, 'signature'>> & { signature?: string | null };

export const SETTINGS_KEY = 'form-settings';

/** Fired on `window` after settings were stored successfully in this tab. */
export const SETTINGS_CHANGED_EVENT = 'settings-changed';

const writeStored = (settings: Partial<Settings>): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
};

const DEFAULT_SENDER_INFO = `Martina Mustermann
Strasse
PLZ Ort
Email
Mobile
IBAN
QR IBAN`;

const DEFAULT_ORT = 'Kanton Zug';

/** The parsed stored value; unreadable data, or data that is not a settings object, counts as nothing saved. */
const readStored = (): Partial<Settings> => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const getSettings = (): Settings => {
  const settings = readStored();
  return {
    senderInfo: settings.senderInfo || DEFAULT_SENDER_INFO,
    ortRechnungssteller: settings.ortRechnungssteller || DEFAULT_ORT,
    signature: settings.signature,
    rechnungsDatum: settings.rechnungsDatum || '',
  };
};

/**
 * Merges `update` into the stored settings; omitted fields keep their current value.
 * Merges onto what is stored, not onto the defaults, so a partial save never stores a default as if chosen.
 */
export const updateSettings = (update: SettingsUpdate): void => {
  const { signature, ...rest } = update;
  const current = readStored();
  const next: Partial<Settings> = {
    ...current,
    ...rest,
    signature: signature === undefined ? current.signature : signature ?? undefined,
  };
  writeStored(next);
};

/** The settings as saved, without filled-in defaults; the placeholder sender block counts as unsaved. */
export const getStoredSettings = (): Partial<Settings> => {
  const settings = readStored();
  const result: Partial<Settings> = {};
  for (const field of ['senderInfo', 'ortRechnungssteller', 'rechnungsDatum', 'signature'] as const) {
    if (typeof settings[field] === 'string') result[field] = settings[field];
  }
  if (result.senderInfo === DEFAULT_SENDER_INFO) delete result.senderInfo;
  return result;
};

/** Replaces all stored settings (import). Throws if the browser refuses to store them. */
export const replaceSettings = (settings: Partial<Settings>): void => {
  writeStored(settings);
};
