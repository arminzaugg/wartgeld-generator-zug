import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { updateSettings, getStoredSettings } from "@/lib/presetStorage";
import { SETUP_LABELS, remainingLabel } from "@/lib/setupStatus";
import { useSetupStatus } from "@/hooks/useSetupStatus";
import { SignaturePad } from "@/components/SignaturePad";
import { SettingsTransfer } from "@/components/SettingsTransfer";
import { SettingsSection } from "@/components/SettingsSection";
import { cn } from "@/lib/utils";

const SENDER_PLACEHOLDER = "Vorname Name, Hebamme\nStrasse Nr.\nPLZ Ort\nE-Mail\nTelefon\nIBAN\nQR-IBAN";

/** Shows saved settings only, so it updates on every save and import (not on unsaved typing). */
const SetupStatus = () => {
  const missing = useSetupStatus();
  const titleId = useId();

  if (missing.length === 0) {
    return (
      <p className="flex items-center gap-3 rounded-lg bg-accent px-5 py-3.5 text-[15px] text-accent-foreground">
        <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span><b className="font-semibold">Alles eingerichtet.</b> Ihre Rechnungen sind startklar.</span>
      </p>
    );
  }

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 rounded-xl bg-warning-soft px-5 py-5 text-warning-foreground md:px-6">
      <div className="flex flex-col gap-0.5">
        <p id={titleId} className="text-base font-semibold">
          Einrichtung: noch {remainingLabel(missing.length)} bis zur ersten Rechnung
        </p>
        <p className="text-sm leading-5">Danach können Sie direkt Rechnungen erstellen.</p>
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
        {SETUP_LABELS.map(label => {
          const done = !missing.includes(label);
          return (
            <li key={label} data-done={done} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-current",
                  done && "border-transparent bg-warning-foreground text-warning-soft",
                )}
              >
                {done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              {label}
              <span className="sr-only">{done ? " (erledigt)" : " (fehlt)"}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const SettingsForm = () => {
  // Saved values only: an unsaved field starts empty and shows an example, the PDF keeps its own fallbacks.
  const [initialSettings] = useState(getStoredSettings);
  const [senderInfo, setSenderInfo] = useState(initialSettings.senderInfo ?? "");
  const [ortRechnungssteller, setOrtRechnungssteller] = useState(initialSettings.ortRechnungssteller ?? "");
  const [rechnungsDatum, setRechnungsDatum] = useState(initialSettings.rechnungsDatum ?? "");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    updateSettings({ senderInfo, ortRechnungssteller, rechnungsDatum });
    toast({
      title: "Gespeichert",
      description: "Die Einstellungen wurden gespeichert.",
    });
  };

  const handleSaveSignature = (signature: string | null) => {
    updateSettings({ signature });
  };

  const saveButton = <Button onClick={handleSaveSettings} className="h-11 px-5">Speichern</Button>;

  return (
    <>
      <SettingsSection
        title="Rechnungsstellerin"
        description="Ihr Absenderblock oben links auf der Rechnung, inklusive Zahlungsangaben."
        footer={saveButton}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="senderInfo">Absender</Label>
          <Textarea
            id="senderInfo"
            placeholder={SENDER_PLACEHOLDER}
            value={senderInfo}
            onChange={(e) => setSenderInfo(e.target.value)}
            aria-describedby="senderInfo-hint"
            className="min-h-[200px] leading-[26px] tabular-nums"
          />
          <p id="senderInfo-hint" className="text-[13px] leading-[18px] text-muted-foreground">
            Eine Angabe pro Zeile, in dieser Reihenfolge.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Ort & Datum"
        description="Erscheint als «Ort, Datum» über der Rechnung."
        footer={saveButton}
      >
        <div className="flex flex-wrap gap-5">
          <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-2">
            <Label htmlFor="ortRechnungssteller">Ort der Ausstellung</Label>
            <Input
              id="ortRechnungssteller"
              value={ortRechnungssteller}
              onChange={(e) => setOrtRechnungssteller(e.target.value)}
              placeholder="z. B. Zug"
            />
          </div>
          <div className="flex min-w-0 flex-[1.3_1_300px] flex-col gap-2">
            <Label htmlFor="rechnungsDatum">
              Rechnungsdatum <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="rechnungsDatum"
                type="date"
                value={rechnungsDatum}
                onChange={(e) => setRechnungsDatum(e.target.value)}
                className="min-w-0 flex-[1_1_10rem]"
                aria-describedby="rechnungsDatum-hint"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setRechnungsDatum("")}
                disabled={!rechnungsDatum}
                className="px-3.5"
              >
                Heute verwenden
              </Button>
            </div>
            <p id="rechnungsDatum-hint" className="text-[13px] leading-[18px] text-muted-foreground">
              Leer lassen, um jeweils das aktuelle Datum zu verwenden.
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Unterschrift"
        description="Mit Maus, Trackpad oder Finger. Wird unten auf jede Rechnung gesetzt."
      >
        <SignaturePad
          onSave={handleSaveSignature}
          initialSignature={initialSettings.signature}
        />
      </SettingsSection>
    </>
  );
};

const Settings = () => {
  // Remounting the form after an import makes it show the newly stored values.
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="min-h-screen">
      <AppHeader current="einstellungen" />
      <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-5 pb-12 pt-4 md:gap-10 md:px-10 md:pb-24 md:pt-10 lg:px-20">
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="-ml-1 flex h-11 w-fit items-center gap-1.5 rounded-md px-1 text-[15px] font-medium text-foreground-secondary hover:text-foreground focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsl(var(--primary))]"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
            Zur Rechnung
          </Link>
          <h1 className="text-[30px] leading-[34px] tracking-[-0.01em] md:text-[40px] md:leading-[44px] md:tracking-[-0.015em]">Einstellungen</h1>
          <p className="max-w-[620px] text-base text-foreground-secondary">
            Einmal erfassen, erscheint auf jeder Rechnung. Alles wird nur in diesem Browser gespeichert.
          </p>
        </div>

        <SetupStatus />

        <SettingsForm key={formKey} />

        <SettingsSection
          title="Sichern & Laden"
          description="Für ein neues Gerät oder eine neue Adresse der Anwendung: Einstellungen in eine Datei sichern und dort wieder laden."
        >
          <SettingsTransfer onImported={() => setFormKey(key => key + 1)} />
        </SettingsSection>
      </main>
    </div>
  );
};

export default Settings;
