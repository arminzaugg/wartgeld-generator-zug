import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { municipalities } from "@/config/addresses";

interface FormFieldsProps {
  values: {
    vorname: string;
    nachname: string;
    address: string;
    plz: string;
    ort: string;
    geburtsdatum: string;
    gemeinde: string;
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
}

export const FormFields = ({ values, onChange }: FormFieldsProps) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Angaben</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vorname">Vorname</Label>
            <Input
              id="vorname"
              value={values.vorname}
              onChange={(e) => onChange("vorname", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nachname">Nachname</Label>
            <Input
              id="nachname"
              value={values.nachname}
              onChange={(e) => onChange("nachname", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Strasse</Label>
          <Input
            id="address"
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plz">Postleitzahl</Label>
            <Input
              id="plz"
              value={values.plz}
              onChange={(e) => onChange("plz", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ort">Ort</Label>
            <Input
              id="ort"
              value={values.ort}
              onChange={(e) => onChange("ort", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="geburtsdatum">Datum der Geburt</Label>
          <Input
            id="geburtsdatum"
            type="date"
            value={values.geburtsdatum}
            onChange={(e) => onChange("geburtsdatum", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemeinde">Wahl der Gemeinde</Label>
          <Select value={values.gemeinde} onValueChange={(value) => onChange("gemeinde", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Wählen Sie eine Gemeinde" />
            </SelectTrigger>
            <SelectContent>
              {municipalities.map((municipality) => (
                <SelectItem key={municipality} value={municipality}>
                  {municipality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Dienstleistungen</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="betreuungGeburt" 
              checked={values.betreuungGeburt}
              onCheckedChange={(checked) => onChange("betreuungGeburt", checked === true)}
            />
            <Label htmlFor="betreuungGeburt">Betreuung der Gebärenden zuhause (CHF 400)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="betreuungWochenbett" 
              checked={values.betreuungWochenbett}
              onCheckedChange={(checked) => onChange("betreuungWochenbett", checked === true)}
            />
            <Label htmlFor="betreuungWochenbett">Pflege der Wöchnerin zuhause (CHF 400)</Label>
          </div>
        </div>
      </div>
    </>
  );
};
