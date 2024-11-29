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
    gemeinde: string;
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Angaben</h2>

        <div className="grid gap-8">
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
            values={{
              geburtsdatum: values.geburtsdatum,
              gemeinde: values.gemeinde
            }}
            errors={errors}
            onChange={handleInputChange}
          />

          <ServiceSelectionFields
            values={values}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-background pt-4">
        <div className="container flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
          <Button 
            variant="outline" 
            onClick={onClear}
            className="w-full sm:w-1/2 h-11"
            type="button"
          >
            Formular Zurücksetzen
          </Button>
          <Button 
            className="w-full sm:w-1/2 h-11"
            type="submit"
          >
            Rechnung Generieren
          </Button>
        </div>
      </div>

      <FormValidation errors={errors} />
    </form>
  );
};