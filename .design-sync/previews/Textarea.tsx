import { Textarea, Label } from 'wartgeld-generator-zug';

export const Default = () => (
  <div className="w-full max-w-md space-y-2">
    <Label htmlFor="absender">Absender</Label>
    <Textarea id="absender" rows={4} defaultValue={"Anna Muster\nHebamme\nBahnhofstrasse 12\n6300 Zug"} />
  </div>
);

export const Placeholder = () => (
  <div className="w-full max-w-md space-y-2">
    <Label htmlFor="bem">Bemerkung</Label>
    <Textarea id="bem" placeholder="Optionale Bemerkung zur Rechnung" />
  </div>
);

export const Disabled = () => (
  <div className="w-full max-w-md space-y-2">
    <Label htmlFor="dis">Gemeindeadresse</Label>
    <Textarea id="dis" disabled defaultValue={"Einwohnergemeinde Baar\nRathausstrasse 2\n6340 Baar"} />
  </div>
);
