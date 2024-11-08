import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Preset, savePreset, getPresets, deletePreset, saveSenderInfo, getSettings } from "@/lib/presetStorage";
import { Trash2 } from "lucide-react";

const Settings = () => {
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState<Preset[]>(getPresets());
  const settings = getSettings();
  const [senderInfo, setSenderInfo] = useState(settings.senderInfo);
  const [ortRechnungssteller, setOrtRechnungssteller] = useState(settings.ortRechnungssteller);
  const { toast } = useToast();

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a preset name",
        variant: "destructive",
      });
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      fields: {
        companyName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        additionalNotes: "",
      },
    };

    savePreset(newPreset);
    setPresets(getPresets());
    setPresetName("");
    
    toast({
      title: "Success",
      description: "Preset saved successfully",
    });
  };

  const handleDeletePreset = (id: string) => {
    deletePreset(id);
    setPresets(getPresets());
    
    toast({
      title: "Success",
      description: "Preset deleted successfully",
    });
  };

  const handleSaveSettings = () => {
    saveSenderInfo(senderInfo, ortRechnungssteller);
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>
      
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
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Presets</h2>
          
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Enter preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
            <Button onClick={handleSavePreset}>Save Preset</Button>
          </div>
          
          <div className="space-y-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="font-medium">{preset.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePreset(preset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;