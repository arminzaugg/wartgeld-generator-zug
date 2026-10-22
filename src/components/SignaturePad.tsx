import React, { useId, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';

interface SignaturePadProps {
  onSave: (signature: string | null) => void;
  initialSignature?: string;
}

export const SignaturePad = ({ onSave, initialSignature }: SignaturePadProps) => {
  const signaturePad = useRef<SignatureCanvas>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialSignature || null);
  const { toast } = useToast();
  const uploadId = useId();

  // Shows the signature as saved only once the browser has actually stored it (it can refuse, e.g. when full).
  const store = (dataUrl: string) => {
    try {
      onSave(dataUrl);
    } catch {
      toast({
        title: "Unterschrift nicht gespeichert",
        description: "Der Browser konnte die Unterschrift nicht speichern. Bitte ein kleineres Bild verwenden.",
        variant: "destructive",
      });
      return false;
    }
    setImagePreview(dataUrl);
    return true;
  };

  const clear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      setImagePreview(null);
      onSave(null); // Pass null to remove signature from storage
      toast({
        title: "Unterschrift gelöscht",
        description: "Ihre Unterschrift wurde erfolgreich gelöscht.",
      });
    }
  };

  const save = () => {
    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      const dataUrl = signaturePad.current.toDataURL('image/png');
      if (!store(dataUrl)) return;
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
        store(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* The drawing surface stays white like the paper the signature ends up on, also in dark mode. */}
      <div className="relative h-[180px] overflow-hidden rounded-lg border-[1.5px] border-dashed border-input bg-white">
        <SignatureCanvas
          ref={signaturePad}
          canvasProps={{
            className: "absolute inset-0 h-full w-full cursor-crosshair",
            style: {
              touchAction: 'none',
            },
            'aria-label': 'Unterschriftsfeld',
          }}
          dotSize={1}
          minWidth={1}
          maxWidth={2.5}
          throttle={16}
          velocityFilterWeight={0.7}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 bottom-10 h-px bg-border" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-[46px] left-6 text-base text-muted-foreground">×</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={clear} variant="ghost" className="h-11 px-4">
          <Trash2 className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
          Löschen
        </Button>
        <Button onClick={save} className="h-11 px-5">
          Unterschrift speichern
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={uploadId}>Oder PNG-Datei hochladen</Label>
        <Input
          id={uploadId}
          type="file"
          accept="image/png"
          onChange={handleFileUpload}
          className="h-auto py-2.5 text-sm"
        />
      </div>

      <div data-testid="signature-status" className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border bg-background p-4">
        {imagePreview ? (
          <>
            {/* White like the paper, so the signature looks as it will on the invoice. */}
            <div className="flex h-16 w-40 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white p-1">
              <img src={imagePreview} alt="Gespeicherte Unterschrift" className="max-h-full max-w-full" />
            </div>
            <div className="flex min-w-[10rem] flex-1 flex-col gap-0.5">
              <span className="text-sm font-semibold">Gespeicherte Unterschrift</span>
              <span className="text-[13px] text-muted-foreground">Neu zeichnen und speichern, um sie zu ersetzen.</span>
            </div>
          </>
        ) : (
          <>
            <div aria-hidden="true" className="h-16 w-40 shrink-0 rounded-md border border-dashed border-input" />
            <span className="min-w-[10rem] flex-1 text-sm text-muted-foreground">Noch keine Unterschrift gespeichert.</span>
          </>
        )}
      </div>
    </div>
  );
};
