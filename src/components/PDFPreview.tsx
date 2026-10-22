import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PDFPreviewProps {
  pdfUrl: string;
  className?: string;
}

/** The invoice is printed on white paper, so the preview stays white in dark mode too. */
export const PDFPreview = ({ pdfUrl, className }: PDFPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = pdfUrl;
    }
  }, [pdfUrl]);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-sm bg-white shadow-paper animate-in fade-in duration-200 motion-reduce:animate-none print:fixed print:inset-0 print:h-screen print:w-screen print:rounded-none print:shadow-none print:z-50", className)}>
      <iframe ref={iframeRef} className="h-full w-full" title="PDF Vorschau" />
    </div>
  );
};
