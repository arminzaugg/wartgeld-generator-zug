import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PersonalInfoFieldsProps {
  values: {
    vorname: string;
    nachname: string;
  };
  errors: {[key: string]: string};
  onChange: (field: string, value: string) => void;
}

export const PersonalInfoFields = ({ values, errors, onChange }: PersonalInfoFieldsProps) => {
  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="form-vorname" className="flex items-center gap-2">
            Vorname
            <span className="text-red-500">*</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bitte geben Sie Ihren Vornamen ein</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="form-vorname"
            value={values.vorname}
            onChange={(e) => onChange("vorname", e.target.value)}
            aria-invalid={!!errors.vorname}
            aria-describedby={errors.vorname ? "vorname-error" : undefined}
            className={errors.vorname ? "border-destructive" : ""}
          />
          {errors.vorname && (
            <p id="vorname-error" className="text-sm text-destructive">{errors.vorname}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-nachname" className="flex items-center gap-2">
            Nachname
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="form-nachname"
            value={values.nachname}
            onChange={(e) => onChange("nachname", e.target.value)}
            aria-invalid={!!errors.nachname}
            aria-describedby={errors.nachname ? "nachname-error" : undefined}
            className={errors.nachname ? "border-destructive" : ""}
          />
          {errors.nachname && (
            <p id="nachname-error" className="text-sm text-destructive">{errors.nachname}</p>
          )}
        </div>
      </div>
    </div>
  );
};