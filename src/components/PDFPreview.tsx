import { useEffect, useRef } from 'react';

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
    <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-white flex flex-col">
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        title="PDF Preview"
      />
    </div>
  );
};