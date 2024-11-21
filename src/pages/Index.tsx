import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormFields } from "@/components/FormFields";
import { PDFPreview } from "@/components/PDFPreview";
import { generatePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Info, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { debounce } from "lodash";

const initialFormData = {
  vorname: "",
  nachname: "",
  address: "",
  plz: "",
  ort: "",
  geburtsdatum: "",
  gemeinde: "",
  betreuungGeburt: false,
  betreuungWochenbett: false,
};

const Index = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const hasViewedSettings = localStorage.getItem("settings-viewed") === "true";

  const handleFieldChange = useCallback(
    debounce((field: string, value: string | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }, 300),
    []
  );

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.vorname) errors.push("Vorname ist erforderlich");
    if (!formData.nachname) errors.push("Nachname ist erforderlich");
    if (!formData.gemeinde) errors.push("Gemeinde ist erforderlich");
    if (!formData.geburtsdatum) errors.push("Geburtsdatum ist erforderlich");
    return errors;
  };

  const handleGeneratePDF = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Fehler",
        description: (
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const pdfUrl = generatePDF(formData);
      setPdfUrl(pdfUrl);
      toast({
        title: "Erfolgreich",
        description: "PDF wurde erfolgreich erstellt",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "PDF konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearForm = () => {
    setFormData(initialFormData);
    setPdfUrl("");
    toast({
      title: "Formular zurückgesetzt",
      description: "Alle Eingaben wurden gelöscht",
    });
  };

  return (
    <div className="container py-8 animate-in fade-in slide-in-from-bottom-4">
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
          <FormFields
            values={formData}
            onChange={handleFieldChange}
            onClear={handleClearForm}
          />
          
          <div className="mt-6">
            <Button 
              onClick={handleGeneratePDF} 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generiere PDF...
                </>
              ) : (
                "Rechnung Generieren"
              )}
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