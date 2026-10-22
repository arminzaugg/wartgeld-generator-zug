import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getStoredSettings, replaceSettings } from "@/lib/presetStorage";
import {
  FIELD_LABELS, MAX_SETTINGS_FILE_BYTES, invalidFields, parseSettingsFile, serializeSettings, type StoredSettings,
} from "@/lib/settingsFile";

const FILE_NAME = "wartgeld-einstellungen.json";

const readText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const FIELDS = Object.keys(FIELD_LABELS) as (keyof StoredSettings)[];

/** Import replaces everything: fields missing from the file are reset to their defaults. */
const describeImport = (settings: StoredSettings) => {
  const replaced = FIELDS.filter(field => field in settings).map(field => FIELD_LABELS[field]);
  const reset = FIELDS.filter(field => !(field in settings)).map(field => FIELD_LABELS[field]);
  return [
    replaced.length > 0 && `Folgende Einstellungen werden ersetzt: ${replaced.join(", ")}.`,
    reset.length > 0 && `Nicht in der Datei und daher zurückgesetzt: ${reset.join(", ")}.`,
  ].filter(Boolean).join(" ");
};

interface SettingsTransferProps {
  /** Called after imported settings were stored, so the page can show them. */
  onImported: () => void;
}

/** Saves the stored settings to a file and loads them back, e.g. on a new web address. */
export const SettingsTransfer = ({ onImported }: SettingsTransferProps) => {
  const fileInput = useRef<HTMLInputElement>(null);
  // Only the most recently chosen file may show its result.
  const selection = useRef(0);
  const [pending, setPending] = useState<StoredSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = () => {
    // Fields the import would refuse are left out and named, so the rest still moves.
    const settings = getStoredSettings();
    const skipped = invalidFields(settings);
    for (const field of skipped) delete settings[field];
    setError(skipped.length > 0
      ? `Nicht gesichert, weil ungültig: ${skipped.map(field => FIELD_LABELS[field]).join(", ")}. ` +
        "Bitte diese Angaben nach dem Laden neu erfassen."
      : null);
    const blob = new Blob([serializeSettings(settings)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = FILE_NAME;
    document.body.append(link);
    link.click();
    link.remove();
    // Some browsers (Safari) start the download after this handler returns.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearPicker = () => {
    // Lets the same file be chosen again.
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleFile = async (file: File | undefined) => {
    const current = ++selection.current;
    setPending(null);
    setError(null);
    clearPicker();
    if (!file) return;
    if (file.size > MAX_SETTINGS_FILE_BYTES) {
      setError("Die Datei ist zu gross.");
      return;
    }
    let text: string;
    try {
      text = await readText(file);
    } catch {
      if (current === selection.current) setError("Die Datei konnte nicht gelesen werden.");
      return;
    }
    if (current !== selection.current) return;
    const result = parseSettingsFile(text);
    if (result.ok) setPending(result.settings);
    else setError(result.error);
  };

  const handleConfirm = () => {
    if (!pending) return;
    try {
      replaceSettings(pending);
    } catch {
      setError("Die Einstellungen konnten nicht gespeichert werden. Es wurde nichts geändert.");
      setPending(null);
      return;
    }
    setPending(null);
    toast({ title: "Geladen", description: "Die Einstellungen wurden übernommen." });
    onImported();
  };

  const handleCancel = () => {
    setPending(null);
    clearPicker();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-[21px] text-foreground-secondary">
        Sichern Sie Ihre Einstellungen in einer Datei, um sie auf einem anderen Gerät oder unter einer neuen
        Adresse wieder zu laden. Die Datei enthält Ihre Bankverbindung und Unterschrift – bewahren Sie sie sicher
        auf. Ungespeicherte Änderungen werden nicht mitgesichert.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={handleExport}>
          Einstellungen sichern
        </Button>
        <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
          Einstellungen laden
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          aria-label="Einstellungsdatei auswählen"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {pending && (
        <div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
          <p className="text-sm leading-[21px]">{describeImport(pending)} Tipp: Sichern Sie vorher Ihre aktuellen Einstellungen.</p>
          <div className="flex gap-2">
            <Button type="button" onClick={handleConfirm}>
              Übernehmen
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Abbrechen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
