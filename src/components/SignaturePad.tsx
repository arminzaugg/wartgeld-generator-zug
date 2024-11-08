import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  initialSignature?: string;
}

export const SignaturePad = ({ onSave, initialSignature }: SignaturePadProps) => {
  const signaturePad = useRef<SignatureCanvas>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialSignature || null);
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
      <div className="border rounded-lg p-4">
        <SignatureCanvas
          ref={signaturePad}
          canvasProps={{
            className: "w-full h-40 border rounded cursor-crosshair",
            style: { background: 'white' }
          }}
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={clear} variant="outline">Löschen</Button>
        <Button onClick={save}>Speichern</Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Oder laden Sie eine PNG-Datei hoch:</p>
        <Input
          type="file"
          accept="image/png"
          onChange={handleFileUpload}
        />
      </div>

      {imagePreview && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Aktuelle Unterschrift:</p>
          <img 
            src={imagePreview} 
            alt="Signature Preview" 
            className="max-h-20 border rounded p-2"
          />
        </div>
      )}
    </div>
  );
};