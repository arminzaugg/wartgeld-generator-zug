import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { municipalities } from "@/config/addresses";
import { ZipCityLookup } from "@/components/ZipCityLookup";

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
  const handleZipCityChange = (plz: string, ort: string) => {
    onChange("plz", plz);
    onChange("ort", ort);
  };

  const handleInputChange = (field: string, value: string) => {
    // Allow alphanumeric characters and spaces
    const sanitizedValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
    onChange(field, sanitizedValue);
  };

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
              onChange={(e) => handleInputChange("vorname", e.target.value)}
              pattern="[a-zA-Z0-9\s]*"
              title="Nur Buchstaben und Zahlen sind erlaubt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nachname">Nachname</Label>
            <Input
              id="nachname"
              value={values.nachname}
              onChange={(e) => handleInputChange("nachname", e.target.value)}
              pattern="[a-zA-Z0-9\s]*"
              title="Nur Buchstaben und Zahlen sind erlaubt"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Strasse</Label>
          <Input
            id="address"
            value={values.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            pattern="[a-zA-Z0-9\s]*"
            title="Nur Buchstaben und Zahlen sind erlaubt"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ZipCityLookup 
            plz={values.plz}
            ort={values.ort}
            onChange={handleZipCityChange}
          />
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
            <Label htmlFor="betreuungGeburt">Betreuung der Gebärenden zuhause (CHF 1000)</Label>
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