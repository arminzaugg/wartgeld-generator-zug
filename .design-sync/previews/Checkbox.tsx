import { Checkbox, Label } from 'wartgeld-generator-zug';

export const ServiceSelection = () => (
  <div className="space-y-4">
    <Label>Dienstleistungen</Label>
    <div className="flex items-center space-x-2">
      <Checkbox id="geburt" defaultChecked />
      <Label htmlFor="geburt">Betreuung der Gebärenden zuhause (CHF 400)</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="wochenbett" />
      <Label htmlFor="wochenbett">Pflege der Wöchnerin zuhause (CHF 400)</Label>
    </div>
  </div>
);

export const States = () => (
  <div className="flex items-center gap-6">
    <div className="flex items-center space-x-2"><Checkbox id="a" /><Label htmlFor="a">Aus</Label></div>
    <div className="flex items-center space-x-2"><Checkbox id="b" defaultChecked /><Label htmlFor="b">An</Label></div>
    <div className="flex items-center space-x-2"><Checkbox id="c" disabled /><Label htmlFor="c">Deaktiviert</Label></div>
    <div className="flex items-center space-x-2"><Checkbox id="d" disabled defaultChecked /><Label htmlFor="d">Deaktiviert an</Label></div>
  </div>
);
