import { Button } from "@/components/ui/button";
import { dataUriToBlob } from "@/lib/pdf";

interface FormActionsProps {
  onClear: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting?: boolean;
  hasGeneratedPDF?: boolean;
  pdfData?: string;
  values?: {
    vorname: string;
    nachname: string;
  };
}

export const FormActions = ({ 
  onClear, 
  onSubmit, 
  isSubmitting = false, 
  hasGeneratedPDF = false, 
  pdfData,
  values 
}: FormActionsProps) => {
  const handlePrint = () => {
    if (!pdfData) return;

    const blob = dataUriToBlob(pdfData);
    const url = URL.createObjectURL(blob);
    
    // Create an iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    const cleanup = () => {
      document.body.removeChild(printFrame);
      URL.revokeObjectURL(url);
    };

    printFrame.onload = () => {
      const iframeWindow = printFrame.contentWindow;
      if (!iframeWindow) return;

      iframeWindow.addEventListener('afterprint', () => {
        // Print dialog has been closed after printing
        cleanup();
      });

      iframeWindow.addEventListener('printcancel', () => {
        // Print dialog has been cancelled
        cleanup();
      });

      // Trigger print
      iframeWindow.print();
    };
    
    printFrame.src = url;
  };

  const handleDownload = () => {
    if (!pdfData || !values?.vorname || !values?.nachname) return;

    const blob = dataUriToBlob(pdfData);
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${values.vorname}_${values.nachname}.pdf`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sticky bottom-0 bg-background pt-4">
      <div className="container flex flex-col gap-3 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onClear}
            className="w-full sm:w-1/2 h-11"
            type="button"
          >
            Formular Zurücksetzen
          </Button>
          <Button 
            className="w-full sm:w-1/2 h-11"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wird generiert...' : 'Rechnung Generieren'}
          </Button>
        </div>
        {hasGeneratedPDF && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-1/2 h-11"
              type="button"
              onClick={handlePrint}
              disabled={isSubmitting}
            >
              Drucken
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-1/2 h-11"
              type="button"
              onClick={handleDownload}
              disabled={isSubmitting}
            >
              Speichern
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};