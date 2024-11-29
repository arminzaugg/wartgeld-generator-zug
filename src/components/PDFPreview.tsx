import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

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
      {/* Desktop view */}
      <div className="hidden lg:block w-full h-[80vh] border rounded-lg overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          title="PDF Preview"
          onTouchStart={(e) => handleTouchStart(e)}
          onTouchMove={(e) => {
            const initialDistance = handleTouchStart(e);
            if (initialDistance) handleTouchMove(e, initialDistance);
          }}
        />
      </div>

      {/* Mobile view with Sheet component */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="secondary" 
              size="lg" 
              className="fixed bottom-4 right-4 z-50 shadow-lg"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview PDF
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] p-0">
            <SheetHeader className="px-4 py-2 border-b">
              <SheetTitle>PDF Preview</SheetTitle>
            </SheetHeader>
            <div className="h-full bg-white">
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
                title="PDF Preview"
                onTouchStart={(e) => handleTouchStart(e)}
                onTouchMove={(e) => {
                  const initialDistance = handleTouchStart(e);
                  if (initialDistance) handleTouchMove(e, initialDistance);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};