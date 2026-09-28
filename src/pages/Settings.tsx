import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { updateSettings, getSettings } from "@/lib/presetStorage";
import { SignaturePad } from "@/components/SignaturePad";

const Settings = () => {
  const [initialSettings] = useState(getSettings);
  const [senderInfo, setSenderInfo] = useState(initialSettings.senderInfo);
  const [ortRechnungssteller, setOrtRechnungssteller] = useState(initialSettings.ortRechnungssteller);
  const [rechnungsDatum, setRechnungsDatum] = useState(initialSettings.rechnungsDatum);
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

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/">
          <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Zurück">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-2xl space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Rechnungsstellerin</h2>
          <div className="space-y-4">
            <Textarea
              aria-label="Angaben Rechnungsstellerin"
              placeholder={`Martina Mustermann\nBahnhofstrasse 23\n6300 Zug\ninfo@hebamme.ch\n+41 79 345 45 45\nIBAN CH33 0033 0033 0033 0033 3\nQR IBAN CH44 0044 0044 0044 0044 4`}
              value={senderInfo}
              onChange={(e) => setSenderInfo(e.target.value)}
              className="min-h-[200px] font-mono"
            />
            <Button onClick={handleSaveSettings}>Speichern</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ort & Datum</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ortRechnungssteller">Ort Rechnungsstellerin</Label>
              <Input
                id="ortRechnungssteller"
                value={ortRechnungssteller}
                onChange={(e) => setOrtRechnungssteller(e.target.value)}
                placeholder="Kanton Zug"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rechnungsDatum">Rechnungsdatum</Label>
              <div className="flex gap-2">
                <Input
                  id="rechnungsDatum"
                  type="date"
                  value={rechnungsDatum}
                  onChange={(e) => setRechnungsDatum(e.target.value)}
                  className="bg-background"
                  aria-describedby="rechnungsDatum-hint"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRechnungsDatum("")}
                  disabled={!rechnungsDatum}
                >
                  Heute verwenden
                </Button>
              </div>
              <p id="rechnungsDatum-hint" className="text-sm text-muted-foreground">
                Leer lassen, um jeweils das aktuelle Datum zu verwenden.
              </p>
            </div>
            <Button onClick={handleSaveSettings}>Speichern</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Unterschrift</h2>
          <SignaturePad
            onSave={handleSaveSignature}
            initialSignature={initialSettings.signature}
          />
        </Card>
      </div>
    </div>
  );
};

export default Settings;
