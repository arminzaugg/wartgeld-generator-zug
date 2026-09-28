export interface Settings {
  senderInfo: string;
  ortRechnungssteller: string;
  signature?: string;
  /** Fixed invoice date (`YYYY-MM-DD`); empty means "today". */
  rechnungsDatum: string;
}

/** Fields to change; `signature: null` removes the stored signature. */
export type SettingsUpdate = Partial<Omit<Settings, 'signature'>> & { signature?: string | null };

const SETTINGS_KEY = 'form-settings';

const DEFAULT_SENDER_INFO = `Martina Mustermann
Strasse
PLZ Ort
Email
Mobile
IBAN
QR IBAN`;

const DEFAULT_ORT = 'Kanton Zug';

export const getSettings = (): Settings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const settings: Partial<Settings> = stored ? JSON.parse(stored) : {};
  return {
    senderInfo: settings.senderInfo || DEFAULT_SENDER_INFO,
    ortRechnungssteller: settings.ortRechnungssteller || DEFAULT_ORT,
    signature: settings.signature,
    rechnungsDatum: settings.rechnungsDatum || '',
  };
};

/** Merges `update` into the stored settings; omitted fields keep their current value. */
export const updateSettings = (update: SettingsUpdate): void => {
  const { signature, ...rest } = update;
  const current = getSettings();
  const next: Settings = {
    ...current,
    ...rest,
    signature: signature === undefined ? current.signature : signature ?? undefined,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
};
