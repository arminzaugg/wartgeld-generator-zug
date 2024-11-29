import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormContainer } from "@/features/form/components/FormContainer";
import { PDFPreview } from "@/components/PDFPreview";
import { generatePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Info, Menu, Download, Share2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

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

  const handleShare = async () => {
    if (navigator.share && pdfUrl) {
      try {
        await navigator.share({
          title: 'Hebammenwartgeld Rechnung',
          url: pdfUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="container py-4 md:py-8">
      {/* Mobile Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl md:text-3xl font-bold">Hebammenwartgeld Kanton Zug</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/info" className="hidden md:block">
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
              className="relative hidden md:flex"
            >
              <Settings className="h-4 w-4" />
              {!hasViewedSettings && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
        <div className="flex justify-around p-3">
          <Link to="/info">
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleGeneratePDF}
            className="text-primary"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="relative">
              <Settings className="h-5 w-5" />
              {!hasViewedSettings && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 pb-20 md:pb-0">
        <Card className="p-4 md:p-6">
          <FormContainer
            values={formData}
            onChange={handleFieldChange}
            onAddressChange={handleAddressChange}
            onClear={handleClearForm}
          />
          
          <div className="mt-6 hidden md:block">
            <Button onClick={handleGeneratePDF} className="w-full">
              Rechnung Generieren
            </Button>
          </div>
        </Card>

        {/* PDF Preview with mobile optimization */}
        <div className="hidden lg:block">
          <Card className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Vorschau</h2>
              {pdfUrl && (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={pdfUrl} download="rechnung.pdf">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
            {pdfUrl ? (
              <PDFPreview pdfUrl={pdfUrl} />
            ) : (
              <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-gray-500 flex flex-col items-center space-y-1 px-4 text-center">
                  <p>Bitte füllen Sie das Formular aus</p>
                  <p>und klicken Sie auf "Rechnung Generieren"</p>
                  <p>um eine Vorschau zu sehen.</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Mobile PDF Preview Sheet */}
        {pdfUrl && (
          <Sheet>
            <SheetTrigger asChild>
              <Button className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg lg:hidden">
                Vorschau
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>PDF Vorschau</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <PDFPreview pdfUrl={pdfUrl} />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};

export default Index;