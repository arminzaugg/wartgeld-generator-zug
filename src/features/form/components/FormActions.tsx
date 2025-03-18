import { Button } from "@/components/ui/button";

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

    // Convert base64 to blob
    const base64Data = pdfData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'application/pdf' });
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

      // Add event listeners for print events
      iframeWindow.addEventListener('beforeprint', () => {
        // Print dialog is about to open
        console.log('Print dialog opening...');
      });

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

    // Convert base64 to blob
    const base64Data = pdfData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'application/pdf' });
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