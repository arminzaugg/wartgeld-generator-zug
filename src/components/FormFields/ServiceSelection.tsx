import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ServiceSelectionProps {
  values: {
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  };
  onChange: (field: string, value: boolean) => void;
}

export const ServiceSelection = ({ values, onChange }: ServiceSelectionProps) => {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <Label className="text-base font-semibold">Dienstleistungen</Label>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="betreuungGeburt" 
            checked={values.betreuungGeburt}
            onCheckedChange={(checked) => onChange("betreuungGeburt", checked === true)}
          />
          <Label htmlFor="betreuungGeburt" className="text-sm">
            Betreuung der Gebärenden zuhause (CHF 1000)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="betreuungWochenbett" 
            checked={values.betreuungWochenbett}
            onCheckedChange={(checked) => onChange("betreuungWochenbett", checked === true)}
          />
          <Label htmlFor="betreuungWochenbett" className="text-sm">
            Pflege der Wöchnerin zuhause (CHF 400)
          </Label>
        </div>
      </div>
    </div>
  );
};