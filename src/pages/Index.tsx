import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormContainer } from "@/features/form/components/FormContainer";
import { PDFPreview } from "@/components/PDFPreview";
import { generatePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    address: "",
    plz: "",
    ort: "",
    geburtsdatum: "",
    gemeinde: "",
    betreuungGeburt: false,
    betreuungWochenbett: false,
  });
  
  const [pdfUrl, setPdfUrl] = useState("");
  const { toast } = useToast();

  const hasViewedSettings = localStorage.getItem("settings-viewed") === "true";

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (street: string, zipCode?: string, city?: string) => {
    setFormData(prev => ({
      ...prev,
      address: street,
      plz: zipCode || prev.plz,
      ort: city || prev.ort
    }));
  };

  const handleClearForm = () => {
    setFormData({
      vorname: "",
      nachname: "",
      address: "",
      plz: "",
      ort: "",
      geburtsdatum: "",
      gemeinde: "",
      betreuungGeburt: false,
      betreuungWochenbett: false,
    });
    setPdfUrl("");
    toast({
      title: "Formular zurückgesetzt",
      description: "Alle Eingaben wurden gelöscht",
    });
  };

  const handleGeneratePDF = () => {
    if (!formData.vorname || !formData.nachname || !formData.gemeinde) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle erforderlichen Felder aus",
        variant: "destructive",
      });
      return;
    }

    const pdfUrl = generatePDF({
      ...formData,
      betreuungGeburt: formData.betreuungGeburt,
      betreuungWochenbett: formData.betreuungWochenbett,
    });
    setPdfUrl(pdfUrl);
    
    toast({
      title: "Erfolgreich",
      description: "PDF wurde erfolgreich erstellt",
    });
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hebammenwartgeld Kanton Zug</h1>
        <div className="flex gap-2">
          <Link to="/info">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hier können Sie eine Rechnung für das Hebammenwartgeld erstellen.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
          <Link to="/settings">
            <Button 
              variant="outline" 
              size="icon"
              className="relative"
            >
              <Settings className="h-4 w-4" />
              {!hasViewedSettings && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <FormContainer
            values={formData}
            onChange={handleFieldChange}
            onAddressChange={handleAddressChange}
            onClear={handleClearForm}
          />
          
          <div className="mt-6">
            <Button onClick={handleGeneratePDF} className="w-full">
              Rechnung Generieren
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vorschau</h2>
          {pdfUrl ? (
            <PDFPreview pdfUrl={pdfUrl} />
          ) : (
            <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-gray-500 flex flex-col items-center space-y-1">
                <p>Bitte füllen Sie das Formular aus</p>
                <p>und klicken Sie auf "Rechnung Generieren"</p>
                <p>um eine Vorschau zu sehen.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;
