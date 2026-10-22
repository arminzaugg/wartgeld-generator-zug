import { useSyncExternalStore } from "react";
import { SETTINGS_CHANGED_EVENT, SETTINGS_KEY, getStoredSettings } from "@/lib/presetStorage";
import { missingSetupItems } from "@/lib/setupStatus";

const subscribe = (onChange: () => void) => {
  // `key === null` means the whole storage was cleared in another tab.
  const onStorage = (event: StorageEvent) => {
    if (event.key === SETTINGS_KEY || event.key === null) onChange();
  };
  window.addEventListener(SETTINGS_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SETTINGS_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
};

const readRaw = () => {
  try {
    return localStorage.getItem(SETTINGS_KEY);
  } catch {
    return null;
  }
};

// The snapshot must be stable between calls, so it is a string; the array is derived from it.
// React reads it on every render, so the stored settings (with the signature image) are parsed only when they change.
let lastRaw: string | null | undefined;
let lastSnapshot = "";
const getSnapshot = () => {
  const raw = readRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastSnapshot = missingSetupItems(getStoredSettings()).join("|");
  }
  return lastSnapshot;
};

const cache = new Map<string, string[]>();
const toItems = (key: string) => {
  if (!cache.has(key)) cache.set(key, key ? key.split("|") : []);
  return cache.get(key)!;
};

/** Labels of the setup items still missing; updates on saves in this tab and changes in other tabs. */
export const useSetupStatus = (): string[] => toItems(useSyncExternalStore(subscribe, getSnapshot));
