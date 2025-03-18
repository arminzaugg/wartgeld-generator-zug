import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PDFPreviewProps {
  pdfUrl: string;
}

export const PDFPreview = ({ pdfUrl }: PDFPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = pdfUrl;
    }
  }, [pdfUrl]);

  return (
    <div className="relative w-full h-[80vh] border rounded-lg overflow-hidden bg-white print:fixed print:inset-0 print:h-screen print:w-screen print:border-0 print:rounded-none print:bg-white print:z-50">
      <iframe
        ref={iframeRef}
        className={cn(
          "w-full h-full"
        )}
        title="PDF Preview"
      />
    </div>
  );
};