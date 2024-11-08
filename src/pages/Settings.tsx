import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Preset, savePreset, getPresets, deletePreset } from "@/lib/presetStorage";
import { Trash2 } from "lucide-react";

const Settings = () => {
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState<Preset[]>(getPresets());
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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="max-w-2xl">
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