import { Label, Input, Checkbox } from 'wartgeld-generator-zug';

export const WithInput = () => (
  <div className="w-72 space-y-2">
    <Label htmlFor="ort">Ausstellungsort</Label>
    <Input id="ort" defaultValue="Zug" />
  </div>
);

export const WithCheckbox = () => (
  <div className="flex items-center space-x-2">
    <Checkbox id="wb" />
    <Label htmlFor="wb">Pflege der Wöchnerin zuhause (CHF 400)</Label>
  </div>
);

export const SectionLabel = () => <Label>Dienstleistungen</Label>;
