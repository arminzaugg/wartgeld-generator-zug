import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setScale(1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      return Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent, initialDistance: number) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const delta = distance / initialDistance;
      setScale(prev => Math.min(Math.max(prev * delta, 0.5), 3));
    }
  };

  return (
    <div className="relative w-full h-[80vh] border rounded-lg overflow-hidden bg-white">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleReset}
          className="h-8 w-8"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <iframe
        ref={iframeRef}
        className={cn(
          "w-full h-full transition-transform duration-200",
          scale !== 1 && "cursor-grab active:cursor-grabbing"
        )}
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'center'
        }}
        title="PDF Preview"
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchMove={(e) => {
          const initialDistance = handleTouchStart(e);
          if (initialDistance) handleTouchMove(e, initialDistance);
        }}
      />
    </div>
  );
};