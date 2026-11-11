import { Button } from 'wartgeld-generator-zug';
import { Printer, Download, Settings, Loader2 } from 'lucide-react';

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>PDF erstellen</Button>
    <Button variant="outline">Zurücksetzen</Button>
    <Button variant="secondary">Drucken</Button>
    <Button variant="destructive">Signatur löschen</Button>
    <Button variant="ghost">Abbrechen</Button>
    <Button variant="link">Mehr erfahren</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="sm">Klein</Button>
    <Button>Standard</Button>
    <Button size="lg">Gross</Button>
    <Button variant="ghost" size="icon" aria-label="Einstellungen">
      <Settings className="h-5 w-5" />
    </Button>
  </div>
);

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button variant="secondary">
      <Printer className="mr-2 h-4 w-4" /> Drucken
    </Button>
    <Button variant="secondary">
      <Download className="mr-2 h-4 w-4" /> Speichern
    </Button>
  </div>
);

export const States = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird erstellt…
    </Button>
    <Button variant="outline" disabled>Datum zurücksetzen</Button>
  </div>
);

export const FormActions = () => (
  <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
    <Button variant="outline" className="w-full sm:w-1/2 h-11" type="button">Zurücksetzen</Button>
    <Button className="w-full sm:w-1/2 h-11" type="submit">PDF erstellen</Button>
  </div>
);
