import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { saveSenderInfo, getSettings } from "@/lib/presetStorage";
import { SignaturePad } from "@/components/SignaturePad";

const Settings = () => {
  const settings = getSettings();
  const [senderInfo, setSenderInfo] = useState(settings.senderInfo);
  const [ortRechnungssteller, setOrtRechnungssteller] = useState(settings.ortRechnungssteller);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const handleSaveSettings = () => {
    saveSenderInfo(senderInfo, ortRechnungssteller, settings.signature);
    localStorage.setItem("settings-viewed", "true");
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
  };

  const handleSaveSignature = (signature: string | null) => {
    saveSenderInfo(senderInfo, ortRechnungssteller, signature || undefined);
    localStorage.setItem("settings-viewed", "true");
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
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
              <label htmlFor="ortRechnungssteller" className="block text-sm font-medium text-gray-700">
                Ort Rechnungsstellerin
              </label>
              <Input
                id="ortRechnungssteller"
                value={ortRechnungssteller}
                onChange={(e) => setOrtRechnungssteller(e.target.value)}
                placeholder="Kanton Zug"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="currentDate" className="block text-sm font-medium text-gray-700">
                Datum
              </label>
              <Input
                id="currentDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="heute"
                className="bg-background"
              />
            </div>
            <Button onClick={handleSaveSettings}>Speichern</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Unterschrift</h2>
          <SignaturePad 
            onSave={handleSaveSignature}
            initialSignature={settings.signature}
          />
        </Card>
      </div>
    </div>
  );
};

export default Settings;