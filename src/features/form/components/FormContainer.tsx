import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { DateAndMunicipalityFields } from "./DateAndMunicipalityFields";
import { ServiceSelectionFields } from "./ServiceSelectionFields";
import { FormValidation } from "@/components/FormValidation";

interface FormContainerProps {
  values: {
    vorname: string;
    nachname: string;
    address: string;
    plz: string;
    ort: string;
    geburtsdatum: string;
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
  onAddressChange: (street: string, zipCode?: string, city?: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export const FormContainer = ({ values, onChange, onAddressChange, onClear, onSubmit }: FormContainerProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateField = (field: string, value: string | boolean) => {
    switch (field) {
      case 'vorname':
      case 'nachname':
        return typeof value === 'string' && value.length >= 2 ? '' : 'Mindestens 2 Zeichen erforderlich';
      case 'geburtsdatum':
        return value ? '' : 'Bitte geben Sie ein Datum ein';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
      <h2 className="text-xl font-semibold">Angaben</h2>

      <div className="space-y-6 md:space-y-8">
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

        <ServiceSelectionFields
          values={values}
          onChange={handleInputChange}
        />
      </div>

      <div className="pt-4 grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={onClear}
          className="h-12"
          type="button"
        >
          Formular Zurücksetzen
        </Button>
        <Button 
          className="h-12 text-lg"
          type="submit"
        >
          Rechnung Generieren
        </Button>
      </div>

      <FormValidation errors={errors} />
    </form>
  );
};
