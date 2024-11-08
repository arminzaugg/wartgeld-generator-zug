import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { Card } from './ui/card';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  initialSignature?: string;
}

export const SignaturePad = ({ onSave, initialSignature }: SignaturePadProps) => {
  const signaturePad = useRef<SignatureCanvas>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialSignature || null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  const clear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      setImagePreview(null);
    }
  };

  const save = () => {
    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      const dataUrl = signaturePad.current.toDataURL('image/png');
      setImagePreview(dataUrl);
      onSave(dataUrl);
      toast({
        title: "Unterschrift gespeichert",
        description: "Ihre Unterschrift wurde erfolgreich gespeichert.",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreview(dataUrl);
        onSave(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gray-50">
        <div 
          className={`border-2 rounded-lg overflow-hidden transition-all ${
            isDrawing ? 'border-blue-500 shadow-lg' : 'border-gray-200'
          }`}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
        >
          <SignatureCanvas
            ref={signaturePad}
            canvasProps={{
              className: "w-full h-40 bg-white cursor-crosshair",
              style: { 
                touchAction: 'none',
              }
            }}
            dotSize={1}
            minWidth={1}
            maxWidth={2.5}
            throttle={16}
            velocityFilterWeight={0.7}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Button 
            onClick={clear} 
            variant="outline" 
            size="sm"
            className="text-sm"
          >
            Löschen
          </Button>
          <Button 
            onClick={save}
            size="sm"
            className="text-sm"
          >
            Speichern
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Oder laden Sie eine PNG-Datei hoch:</p>
        <Input
          type="file"
          accept="image/png"
          onChange={handleFileUpload}
          className="text-sm"
        />
      </div>

      {imagePreview && (
        <Card className="p-4 bg-white">
          <p className="text-sm font-medium mb-2 text-muted-foreground">Aktuelle Unterschrift:</p>
          <div className="border rounded p-4 bg-white">
            <img 
              src={imagePreview} 
              alt="Signature Preview" 
              className="max-h-20 w-auto mx-auto"
            />
          </div>
        </Card>
      )}
    </div>
  );
};