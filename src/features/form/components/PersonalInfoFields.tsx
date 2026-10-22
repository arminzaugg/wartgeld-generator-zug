import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "./FieldError";

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

const NAME_FIELDS = [
  { id: "vorname", label: "Vorname" },
  { id: "nachname", label: "Nachname" },
] as const;

export const PersonalInfoFields = ({ values, errors = {}, onChange }: PersonalInfoFieldsProps) => (
  <div className="grid gap-5 md:grid-cols-2 md:gap-4">
    {NAME_FIELDS.map(({ id, label }) => (
      <div key={id} className="flex min-w-0 flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          value={values[id]}
          onChange={(e) => onChange(id, e.target.value)}
          aria-invalid={Boolean(errors[id])}
          aria-describedby={errors[id] ? `${id}-error` : undefined}
        />
        <FieldError id={`${id}-error`} message={errors[id]} />
      </div>
    ))}
  </div>
);
