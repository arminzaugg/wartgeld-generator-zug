import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoFieldsProps {
  values: {
    vorname: string;
    nachname: string;
  };
  errors?: {
    [key: string]: string;
  };
  onChange: (field: string, value: string) => void;
}

export const PersonalInfoFields = ({ values, errors = {}, onChange }: PersonalInfoFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vorname">Vorname</Label>
          <Input
            id="vorname"
            value={values.vorname}
            onChange={(e) => onChange("vorname", e.target.value)}
            className={errors.vorname ? "border-red-500" : ""}
          />
          {errors.vorname && (
            <p className="text-sm text-red-500">{errors.vorname}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nachname">Nachname</Label>
          <Input
            id="nachname"
            value={values.nachname}
            onChange={(e) => onChange("nachname", e.target.value)}
            className={errors.nachname ? "border-red-500" : ""}
          />
          {errors.nachname && (
            <p className="text-sm text-red-500">{errors.nachname}</p>
          )}
        </div>
      </div>
    </div>
  );
};