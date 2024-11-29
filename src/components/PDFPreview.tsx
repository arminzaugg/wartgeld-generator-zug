import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface PDFPreviewProps {
  pdfUrl: string;
}

export const PDFPreview = ({ pdfUrl }: PDFPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = pdfUrl;
    }
  }, [pdfUrl]);

  const handleDownload = () => {
    if (isIOS) {
      // For iOS, open in new tab which allows using the native share sheet
      window.open(pdfUrl, '_blank');
    } else {
      // For other devices, use the download attribute
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'rechnung.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (isIOS) {
      // For iOS, open in new tab which gives access to the native share/print menu
      window.open(pdfUrl, '_blank');
    } else {
      // For other devices, try to use the print dialog
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-white flex flex-col">
      <div className="p-2 border-b flex gap-2 bg-gray-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{isIOS ? 'Share' : 'Download'}</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print</span>
        </Button>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        title="PDF Preview"
      />
    </div>
  );
};