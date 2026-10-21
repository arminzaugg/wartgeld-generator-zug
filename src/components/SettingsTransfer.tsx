import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getStoredSettings, replaceSettings } from "@/lib/presetStorage";
import { MAX_SETTINGS_FILE_BYTES, parseSettingsFile, serializeSettings, type StoredSettings } from "@/lib/settingsFile";

const FILE_NAME = "wartgeld-einstellungen.json";

const readText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const FIELD_LABELS: Record<keyof StoredSettings, string> = {
  senderInfo: "Angaben Rechnungsstellerin",
  ortRechnungssteller: "Ort",
  rechnungsDatum: "Rechnungsdatum",
  signature: "Unterschrift",
};

interface SettingsTransferProps {
  /** Called after imported settings were stored, so the page can show them. */
  onImported: () => void;
}

/** Saves the stored settings to a file and loads them back, e.g. on a new web address. */
export const SettingsTransfer = ({ onImported }: SettingsTransferProps) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<StoredSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = () => {
    const blob = new Blob([serializeSettings(getStoredSettings())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = FILE_NAME;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File | undefined) => {
    setPending(null);
    setError(null);
    if (!file) return;
    if (file.size > MAX_SETTINGS_FILE_BYTES) {
      setError("Die Datei ist zu gross.");
      return;
    }
    let text: string;
    try {
      text = await readText(file);
    } catch {
      setError("Die Datei konnte nicht gelesen werden.");
      return;
    }
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
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
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
        <div className="rounded-md border p-4 space-y-3">
          <p className="text-sm">
            Folgende Einstellungen werden ersetzt:{" "}
            {Object.keys(pending).length > 0
              ? (Object.keys(pending) as (keyof StoredSettings)[]).map(field => FIELD_LABELS[field]).join(", ")
              : "alle (die Datei ist leer)"}
            . Tipp: Sichern Sie vorher Ihre aktuellen Einstellungen.
          </p>
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
