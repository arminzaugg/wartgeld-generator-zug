import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormProgress } from "./FormProgress";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { DateAndMunicipalityFields } from "./DateAndMunicipalityFields";
import { FormValidation } from "@/components/FormValidation";
import { PDFPreview } from "@/components/PDFPreview";
import { Database } from "@/integrations/supabase/types";

type FormData = Database['public']['Tables']['form_data']['Row'];

interface FormContainerProps {
  values: FormData;
  onChange: (field: string, value: string | boolean) => void;
  onAddressChange: (street: string, zipCode?: string, city?: string) => void;
  onClear: () => void;
}

export const FormContainer = ({ values, onChange, onAddressChange, onClear }: FormContainerProps) => {
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
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
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
      if (key === 'betreuunggeburt' || key === 'betreuungwochenbett') return true;
      if (key === 'id' || key === 'created_at' || key === 'updated_at') return false;
      return value !== '';
    }).length;
    setCompletedFields(completed);
  }, [values]);

  return (
    <div className="space-y-6">
      <FormProgress completedFields={completedFields} totalFields={totalFields} />

      <PersonalInfoFields
        values={values}
        errors={errors}
        onChange={handleInputChange}
      />

      <AddressFields 
        values={values}
        onChange={onAddressChange}
      />

      <DateAndMunicipalityFields
        values={values}
        errors={errors}
        onChange={handleInputChange}
      />

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