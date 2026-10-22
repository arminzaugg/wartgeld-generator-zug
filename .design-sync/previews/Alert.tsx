import { Alert, AlertTitle, AlertDescription } from 'wartgeld-generator-zug';
import { Info, AlertCircle } from 'lucide-react';

export const Default = () => (
  <Alert className="max-w-md">
    <Info className="h-4 w-4" />
    <AlertTitle>Hinweis</AlertTitle>
    <AlertDescription>Das Rechnungsdatum wird aus den Einstellungen übernommen.</AlertDescription>
  </Alert>
);

export const Destructive = () => (
  <Alert variant="destructive" className="max-w-md">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Bitte Angaben prüfen</AlertTitle>
    <AlertDescription>
      <ul className="list-disc pl-4">
        <li>Vorname fehlt</li>
        <li>Mindestens eine Dienstleistung auswählen</li>
      </ul>
    </AlertDescription>
  </Alert>
);

export const TextOnly = () => (
  <Alert className="max-w-md">
    <AlertDescription>Keine Gemeinde für diese Postleitzahl gefunden.</AlertDescription>
  </Alert>
);
