import { Input, Label } from 'wartgeld-generator-zug';

export const Default = () => (
  <div className="w-72 space-y-2">
    <Label htmlFor="vorname">Vorname</Label>
    <Input id="vorname" defaultValue="Laura" />
  </div>
);

export const Placeholder = () => (
  <div className="w-72 space-y-2">
    <Label htmlFor="strasse">Strasse</Label>
    <Input id="strasse" placeholder="Strasse und Hausnummer eingeben" />
  </div>
);

export const Types = () => (
  <div className="grid w-full max-w-md grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="plz">PLZ</Label>
      <Input id="plz" inputMode="numeric" defaultValue="6300" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="geb">Geburtsdatum</Label>
      <Input id="geb" type="date" defaultValue="2026-09-14" />
    </div>
  </div>
);

export const Error = () => (
  <div className="w-72 space-y-2">
    <Label htmlFor="nachname">Nachname</Label>
    <Input id="nachname" className="border-red-500" />
    <p className="text-sm text-red-500">Bitte Nachname eingeben</p>
  </div>
);

export const Disabled = () => (
  <div className="w-72 space-y-2">
    <Label htmlFor="gemeinde">Gemeinde</Label>
    <Input id="gemeinde" disabled defaultValue="Zug" />
  </div>
);
