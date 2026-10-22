import type { Settings } from "@/lib/presetStorage";

/** What a midwife has to save once before her invoices carry her own details. */
const SETUP_ITEMS = [
  { label: "Rechnungsstellerin", isSet: (s: Partial<Settings>) => !!s.senderInfo?.trim() },
  { label: "Ort der Ausstellung", isSet: (s: Partial<Settings>) => !!s.ortRechnungssteller?.trim() },
  { label: "Unterschrift", isSet: (s: Partial<Settings>) => !!s.signature },
] as const;

export const SETUP_LABELS = SETUP_ITEMS.map(item => item.label);

/** Labels of the items not yet saved, given the raw stored settings (`getStoredSettings()`, never the defaults). */
export const missingSetupItems = (stored: Partial<Settings>): string[] =>
  SETUP_ITEMS.filter(item => !item.isSet(stored)).map(item => item.label);

/** "A", "A und B", "A, B und C". */
export const joinItems = (items: string[]): string =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} und ${items[items.length - 1]}`;

export const remainingLabel = (count: number): string => `${count} ${count === 1 ? "Angabe" : "Angaben"}`;
