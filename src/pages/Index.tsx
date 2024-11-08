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
    companyName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    additionalNotes: "",
  });
  
  const [pdfUrl, setPdfUrl] = useState("");
  const { toast } = useToast();

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressSelect = (address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...address,
    }));
  };

  const handleGeneratePDF = () => {
    if (!formData.companyName || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const pdfUrl = generatePDF(formData);
    setPdfUrl(pdfUrl);
    
    toast({
      title: "Success",
      description: "PDF generated successfully",
    });
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Form to PDF</h1>
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
            onAddressSelect={handleAddressSelect}
          />
          
          <div className="mt-6">
            <Button onClick={handleGeneratePDF} className="w-full">
              Generate PDF
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">PDF Preview</h2>
          {pdfUrl ? (
            <PDFPreview pdfUrl={pdfUrl} />
          ) : (
            <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Fill the form and click "Generate PDF" to see the preview
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;