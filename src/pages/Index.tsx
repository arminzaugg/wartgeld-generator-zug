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
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
      betreuungGeburt: false,
      betreuungWochenbett: false,
    });
    setPdfUrl("");
    setIsSheetOpen(false);
    toast({
      title: "Formular zurückgesetzt",
      description: "Alle Eingaben wurden gelöscht",
    });
  };

  const handleGeneratePDF = async () => {
    if (!formData.vorname || !formData.nachname || !formData.plz) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle erforderlichen Felder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: plzMapping, error } = await supabase
        .from('plz_mappings')
        .select('gemeinde')
        .eq('address_plz', formData.plz)
        .single();

      if (error || !plzMapping) {
        toast({
          title: "Fehler",
          description: "Die eingegebene PLZ wird nicht unterstützt",
          variant: "destructive",
        });
        return;
      }

      const pdfUrl = generatePDF({
        ...formData,
        gemeinde: plzMapping.gemeinde,
        betreuungGeburt: formData.betreuungGeburt,
        betreuungWochenbett: formData.betreuungWochenbett,
      });
      setPdfUrl(pdfUrl);
      setIsSheetOpen(true);
      
      toast({
        title: "Erfolgreich",
        description: "PDF wurde erfolgreich erstellt",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Hebammenwartgeld Kanton Zug</h1>
        <div className="flex gap-2">
          <Link to="/info">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Info className="h-5 w-5" />
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
              className="relative h-10 w-10"
            >
              <Settings className="h-5 w-5" />
              {!hasViewedSettings && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card className="p-4 md:p-6">
          <FormContainer
            values={formData}
            onChange={handleFieldChange}
            onAddressChange={handleAddressChange}
            onClear={handleClearForm}
          />
          
          <div className="mt-6">
            <Button onClick={handleGeneratePDF} className="w-full h-12 text-lg">
              Rechnung Generieren
            </Button>
          </div>
        </Card>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen} className="lg:hidden">
          <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh]">
            <div className="h-full pt-6">
              {pdfUrl && <PDFPreview pdfUrl={pdfUrl} />}
            </div>
          </SheetContent>
        </Sheet>

        <Card className="hidden lg:block p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Vorschau</h2>
          {pdfUrl ? (
            <PDFPreview pdfUrl={pdfUrl} />
          ) : (
            <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-gray-500 flex flex-col items-center space-y-2 px-4 text-center">
                <p className="text-lg">Bitte füllen Sie das Formular aus</p>
                <p className="text-sm">und klicken Sie auf "Rechnung Generieren"</p>
                <p className="text-sm">um eine Vorschau zu sehen.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;