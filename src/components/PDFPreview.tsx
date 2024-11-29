import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface PDFPreviewProps {
  pdfUrl: string;
}

export const PDFPreview = ({ pdfUrl }: PDFPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = pdfUrl;
    }
  }, [pdfUrl]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-full h-[600px] border rounded-lg overflow-hidden touch-pan-y">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', height: '100%' }}>
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
};