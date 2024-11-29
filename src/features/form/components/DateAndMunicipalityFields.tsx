import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateAndMunicipalityFieldsProps {
  values: {
    geburtsdatum: string;
  };
  errors?: {
    [key: string]: string;
  };
  onChange: (field: string, value: string) => void;
}

export const DateAndMunicipalityFields = ({ values, errors = {}, onChange }: DateAndMunicipalityFieldsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="geburtsdatum">Datum der Geburt</Label>
      <Input
        id="geburtsdatum"
        type="date"
        value={values.geburtsdatum}
        onChange={(e) => onChange("geburtsdatum", e.target.value)}
        className={errors.geburtsdatum ? "border-red-500" : ""}
      />
      {errors.geburtsdatum && (
        <p className="text-sm text-red-500">{errors.geburtsdatum}</p>
      )}
    </div>
  );
};