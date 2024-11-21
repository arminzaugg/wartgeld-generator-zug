import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { municipalities } from "@/config/addresses";
import { AddressFields } from "@/components/AddressFields";
import { FormValidation } from "@/components/FormValidation";
import { FormProgress } from "@/components/FormProgress";
import { Info } from "lucide-react";
import { useState, useEffect } from "react";

interface FormFieldsProps {
  values: {
    vorname: string;
    nachname: string;
    address: string;
    plz: string;
    ort: string;
    geburtsdatum: string;
    gemeinde: string;
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
  onAddressChange: (street: string, zipCode?: string, city?: string) => void;
  onClear: () => void;
}

export const FormFields = ({ values, onChange, onAddressChange, onClear }: FormFieldsProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [completedFields, setCompletedFields] = useState(0);
  const totalFields = 7;

  const validateField = (field: string, value: string | boolean) => {
    switch (field) {
      case 'vorname':
      case 'nachname':
        return typeof value === 'string' && value.length >= 2 ? '' : 'Mindestens 2 Zeichen erforderlich';
      case 'geburtsdatum':
        return value ? '' : 'Bitte geben Sie ein Datum ein';
      case 'gemeinde':
        return value ? '' : 'Bitte wählen Sie eine Gemeinde';
      default:
        return '';
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    const error = validateField(field, value);
    
    // Only update errors if there's an actual error
    if (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    } else {
      // Remove the error for this field if it exists
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    onChange(field, value);
  };

  useEffect(() => {
    const completed = Object.entries(values).filter(([key, value]) => {
      if (key === 'betreuungGeburt' || key === 'betreuungWochenbett') return true;
      return value !== '';
    }).length;
    setCompletedFields(completed);
  }, [values]);

  // ... keep existing code (JSX for form fields and validation)

  return (
    <div className="space-y-6">
      <FormProgress completedFields={completedFields} totalFields={totalFields} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="form-vorname" className="flex items-center gap-2">
            Vorname
            <span className="text-red-500">*</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
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
            onChange={(e) => handleInputChange("vorname", e.target.value)}
            aria-invalid={!!errors.vorname}
            aria-describedby={errors.vorname ? "vorname-error" : undefined}
            className={errors.vorname ? "border-red-500" : ""}
          />
          {errors.vorname && (
            <p id="vorname-error" className="text-sm text-red-500">{errors.vorname}</p>
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
            onChange={(e) => handleInputChange("nachname", e.target.value)}
            aria-invalid={!!errors.nachname}
            aria-describedby={errors.nachname ? "nachname-error" : undefined}
            className={errors.nachname ? "border-red-500" : ""}
          />
          {errors.nachname && (
            <p id="nachname-error" className="text-sm text-red-500">{errors.nachname}</p>
          )}
        </div>
      </div>

      <AddressFields 
        values={values}
        onChange={onAddressChange}
      />

      <div className="space-y-2">
        <Label htmlFor="form-geburtsdatum" className="flex items-center gap-2">
          Datum der Geburt
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="form-geburtsdatum"
          type="date"
          value={values.geburtsdatum}
          onChange={(e) => handleInputChange("geburtsdatum", e.target.value)}
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
          onValueChange={(value) => handleInputChange("gemeinde", value)}
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

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={onClear}
          className="w-full"
          type="button"
        >
          Formular Zurücksetzen
        </Button>
      </div>

      <FormValidation errors={errors} />
    </div>
  );
};
