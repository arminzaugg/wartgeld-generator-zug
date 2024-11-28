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
      <h3 className="text-lg font-medium">Erbrachte Leistungen</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="betreuungGeburt"
            checked={values.betreuungGeburt}
            onCheckedChange={(checked) => onChange("betreuungGeburt", checked as boolean)}
          />
          <Label htmlFor="betreuungGeburt">Betreuung Geburt</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="betreuungWochenbett"
            checked={values.betreuungWochenbett}
            onCheckedChange={(checked) => onChange("betreuungWochenbett", checked as boolean)}
          />
          <Label htmlFor="betreuungWochenbett">Betreuung Wochenbett</Label>
        </div>
      </div>
    </div>
  );
};