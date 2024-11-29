import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ServiceSelectionFieldsProps {
  values: {
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  };
  onChange: (field: string, value: boolean) => void;
}

export const ServiceSelectionFields = ({ values, onChange }: ServiceSelectionFieldsProps) => {
  return (
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
  );
};