import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { municipalities } from "@/config/addresses";

interface DateAndMunicipalityProps {
  values: {
    geburtsdatum: string;
    gemeinde: string;
  };
  errors: {[key: string]: string};
  onChange: (field: string, value: string) => void;
}

export const DateAndMunicipality = ({ values, errors, onChange }: DateAndMunicipalityProps) => {
  return (
    <>
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
          className={errors.geburtsdatum ? "border-red-500" : ""}
        />
        {errors.geburtsdatum && (
          <p className="text-sm text-red-500">{errors.geburtsdatum}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="form-gemeinde" className="flex items-center gap-2">
          Wahl der Gemeinde
          <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={values.gemeinde} 
          onValueChange={(value) => onChange("gemeinde", value)}
        >
          <SelectTrigger id="form-gemeinde" className={errors.gemeinde ? "border-red-500" : ""}>
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
        {errors.gemeinde && (
          <p className="text-sm text-red-500">{errors.gemeinde}</p>
        )}
      </div>
    </>
  );
};