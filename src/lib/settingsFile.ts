import type { Settings } from './presetStorage';

/** Settings as stored in the browser: only the fields the user has saved. */
export type StoredSettings = Partial<Settings>;

export type ParsedSettingsFile =
  | { ok: true; settings: StoredSettings }
  | { ok: false; error: string };

export const MAX_SETTINGS_FILE_BYTES = 1_000_000;
const FORMAT = 'wartgeld-einstellungen';
const VERSION = 1;
const MAX_SENDER_INFO = 2000;
const MAX_ORT = 100;
const MAX_SIGNATURE = 900_000;

// A PNG data URL whose content starts with the PNG file signature.
const PNG_DATA_URL = /^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isRealDate = (value: string) => {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

type FieldCheck = (value: string) => boolean;

const FIELDS: Record<keyof Settings, FieldCheck> = {
  senderInfo: value => value.length <= MAX_SENDER_INFO,
  ortRechnungssteller: value => value.length <= MAX_ORT,
  rechnungsDatum: value => value === '' || isRealDate(value),
  signature: value => value.length <= MAX_SIGNATURE && PNG_DATA_URL.test(value),
};

const invalid = (error: string): ParsedSettingsFile => ({ ok: false, error });

export const serializeSettings = (settings: StoredSettings): string => {
  const known: StoredSettings = {};
  for (const field of Object.keys(FIELDS) as (keyof Settings)[]) {
    if (typeof settings[field] === 'string') known[field] = settings[field];
  }
  return JSON.stringify({ format: FORMAT, version: VERSION, settings: known }, null, 2);
};

/** Validates a settings file; untrusted input, so only the known fields are copied over. */
export const parseSettingsFile = (text: string): ParsedSettingsFile => {
  if (new TextEncoder().encode(text).byteLength > MAX_SETTINGS_FILE_BYTES) {
    return invalid('Die Datei ist zu gross.');
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return invalid('Die Datei ist keine gültige Einstellungsdatei.');
  }

  if (!isPlainObject(data) || data.format !== FORMAT || data.version !== VERSION ||
      Object.keys(data).some(key => !['format', 'version', 'settings'].includes(key))) {
    return invalid('Die Datei ist keine Einstellungsdatei des Wartgeld Generators.');
  }
  if (!isPlainObject(data.settings)) {
    return invalid('Die Datei enthält keine Einstellungen.');
  }

  const settings: StoredSettings = {};
  for (const [key, value] of Object.entries(data.settings)) {
    if (!Object.prototype.hasOwnProperty.call(FIELDS, key)) {
      return invalid('Die Datei enthält unbekannte Angaben.');
    }
    const field = key as keyof Settings;
    if (typeof value !== 'string' || !FIELDS[field](value)) {
      return invalid('Die Datei enthält ungültige Angaben.');
    }
    settings[field] = value;
  }
  return { ok: true, settings };
};
