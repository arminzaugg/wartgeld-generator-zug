import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFPreviewProps {
  pdfUrl: string;
}

export const PDFPreview = ({ pdfUrl }: PDFPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = pdfUrl;
    }
  }, [pdfUrl]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      return distance;
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
      setScale(Math.min(Math.max(scale * delta, 0.5), 3));
    }
  };

  return (
    <div className="relative w-full">
      {/* Mobile floating button */}
      <Button
        variant="secondary"
        size="lg"
        className="fixed bottom-4 right-4 z-50 lg:hidden shadow-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Eye className="mr-2 h-4 w-4" />
        {isCollapsed ? 'Show Preview' : 'Hide Preview'}
      </Button>

      {/* Preview container */}
      <div
        className={cn(
          "w-full transition-all duration-300 ease-in-out bg-white flex flex-col rounded-lg overflow-hidden border",
          isCollapsed ? "h-0" : "h-[50vh] lg:h-[80vh]"
        )}
      >
        <iframe
          ref={iframeRef}
          className={cn(
            "w-full h-full transition-transform",
            `scale-${scale}`
          )}
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          title="PDF Preview"
          onTouchStart={(e) => handleTouchStart(e)}
          onTouchMove={(e) => {
            const initialDistance = handleTouchStart(e);
            if (initialDistance) handleTouchMove(e, initialDistance);
          }}
        />
      </div>
    </div>
  );
};