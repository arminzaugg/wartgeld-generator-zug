import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormFields } from "@/components/FormFields";
import { PDFPreview } from "@/components/PDFPreview";
import { generatePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/components/ui/use-toast";
import { Settings } from "lucide-react";

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

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

    const pdfUrl = generatePDF(formData);
    setPdfUrl(pdfUrl);
    
    toast({
      title: "Erfolg",
      description: "PDF wurde erfolgreich generiert",
    });
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hebammenwartgeld Kanton Zug</h1>
        <Link to="/settings">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <FormFields
            values={formData}
            onChange={handleFieldChange}
          />
          
          <div className="mt-6">
            <Button onClick={handleGeneratePDF} className="w-full">
              PDF Generieren
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
                <p>Füllen Sie das Formular aus</p>
                <p>und klicken Sie auf "PDF Generieren"</p>
                <p>um eine Vorschau zu sehen</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;