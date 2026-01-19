import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormContainer } from "@/features/form/components/FormContainer";
import { PDFPreview } from "@/components/PDFPreview";
import { generatePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Info } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { pdfGenerationService } from "@/services/pdf/pdfGenerationService";

const Index = () => {
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    address: "",
    plz: "",
    ort: "",
    geburtsdatum: "",
    betreuungGeburt: false,
    betreuungWochenbett: false,
  });

  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfData, setPdfData] = useState<string>("");
  const { toast } = useToast();
  const hasViewedSettings = localStorage.getItem("settings-viewed") === "true";

  const handleFieldChange = async (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = async (street: string, zipCode?: string, city?: string) => {
    setFormData(prev => ({
      ...prev,
      address: street,
      // Only default to previous value if the new value is explicitly undefined.
      // Empty string should be respected to allow clearing.
      plz: zipCode !== undefined ? zipCode : prev.plz,
      ort: city !== undefined ? city : prev.ort
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
      betreuungGeburt: false,
      betreuungWochenbett: false,
    });
    setPdfUrl("");
    setPdfData("");
    toast({
      title: "Formular zurückgesetzt",
      description: "Alle Eingaben wurden gelöscht",
    });
  };

  const handleGeneratePDF = async () => {
    try {
      const pdfData = await pdfGenerationService.generatePDF(formData);
      setPdfData(pdfData);
      setPdfUrl(pdfData);
    } catch (error) {
      toast({
        title: "Error",
        description: "PDF konnte nicht generiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Wartgeld Generator</h1>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/info">
                  <Button variant="ghost" size="icon">
                    <Info className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Informationen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Einstellungen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <FormContainer
            values={formData}
            onChange={handleFieldChange}
            onAddressChange={handleAddressChange}
            onClear={handleClearForm}
            onSubmit={handleGeneratePDF}
            hasGeneratedPDF={!!pdfUrl}
            pdfData={pdfData}
          />
        </Card>

        <div className="w-full">
          {pdfUrl ? (
            <PDFPreview pdfUrl={pdfUrl} />
          ) : (
            <div className="h-[80vh] flex items-center justify-center bg-muted rounded-lg border">
              <div className="text-muted-foreground flex flex-col items-center space-y-2 px-4 text-center">
                <p className="text-lg">Bitte füllen Sie das Formular aus</p>
                <p className="text-sm">und klicken Sie auf "Rechnung Generieren"</p>
                <p className="text-sm">um eine Vorschau zu sehen.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
