import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ServiceSelectionProps {
  values: {
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  };
  onChange: (field: string, value: boolean) => void;
}

export const ServiceSelection = ({ values, onChange }: ServiceSelectionProps) => {
  return (
    <div className="space-y-6 border rounded-lg p-6 bg-gray-50">
      <Label className="text-base font-semibold">Dienstleistungen</Label>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Betreuung der Gebärenden zuhause</Label>
          <RadioGroup 
            defaultValue={values.betreuungGeburt ? "yes" : "no"}
            onValueChange={(value) => onChange("betreuungGeburt", value === "yes")}
            className="flex items-center gap-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="betreuungGeburt-yes" />
              <Label htmlFor="betreuungGeburt-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="betreuungGeburt-no" />
              <Label htmlFor="betreuungGeburt-no">Nein</Label>
            </div>
            <span className="text-sm text-gray-600">
              {values.betreuungGeburt ? "CHF 1000" : "CHF 0"}
            </span>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Pflege der Wöchnerin zuhause</Label>
          <RadioGroup 
            defaultValue={values.betreuungWochenbett ? "yes" : "no"}
            onValueChange={(value) => onChange("betreuungWochenbett", value === "yes")}
            className="flex items-center gap-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="betreuungWochenbett-yes" />
              <Label htmlFor="betreuungWochenbett-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="betreuungWochenbett-no" />
              <Label htmlFor="betreuungWochenbett-no">Nein</Label>
            </div>
            <span className="text-sm text-gray-600">
              {values.betreuungWochenbett ? "CHF 400" : "CHF 0"}
            </span>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};