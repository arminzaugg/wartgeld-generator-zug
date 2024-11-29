import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateAndMunicipalityFieldsProps {
  values: {
    geburtsdatum: string;
  };
  errors: {[key: string]: string};
  onChange: (field: string, value: string) => void;
}

export const DateAndMunicipalityFields = ({ values, errors, onChange }: DateAndMunicipalityFieldsProps) => {
  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor="form-geburtsdatum" className="flex items-center gap-2">
          Datum der Geburt
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="form-geburtsdatum"
          type="date"
          value={values.geburtsdatum}
          onChange={(e) => onChange("geburtsdatum", e.target.value)}
          aria-invalid={!!errors.geburtsdatum}
          className={errors.geburtsdatum ? "border-destructive" : ""}
        />
        {errors.geburtsdatum && (
          <p className="text-sm text-destructive">{errors.geburtsdatum}</p>
        )}
      </div>
    </div>
  );
};