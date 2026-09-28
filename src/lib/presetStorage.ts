export interface Settings {
  senderInfo: string;
  ortRechnungssteller: string;
  signature?: string;
}

const SETTINGS_KEY = 'form-settings';

const DEFAULT_SENDER_INFO = `Martina Mustermann
Strasse
PLZ Ort
Email
Mobile
IBAN
QR IBAN`;

/**
 * Persists the invoice sender settings.
 * `signature`: a data URL replaces it, `null` removes it, `undefined` keeps the stored one.
 */
export const saveSenderInfo = (info: string, ortRechnungssteller: string, signature?: string | null): void => {
  const nextSignature = signature === undefined ? getSettings().signature : signature ?? undefined;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    senderInfo: info,
    ortRechnungssteller,
    signature: nextSignature
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