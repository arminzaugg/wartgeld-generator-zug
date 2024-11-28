import { Button } from "@/components/ui/button";
import { AddressFields } from "@/components/AddressFields";
import { FormValidation } from "@/components/FormValidation";
import { FormProgress } from "@/components/FormProgress";
import { PersonalInfo } from "./PersonalInfo";
import { DateAndMunicipality } from "./DateAndMunicipality";
import { ServiceSelection } from "./ServiceSelection";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
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
      if (key === 'betreuungGeburt' || key === 'betreuungWochenbett') return true;
      return value !== '';
    }).length;
    setCompletedFields(completed);
  }, [values]);

  return (
    <div className="space-y-6">
      <FormProgress completedFields={completedFields} totalFields={totalFields} />
      
      <PersonalInfo 
        values={{ vorname: values.vorname, nachname: values.nachname }}
        errors={errors}
        onChange={handleInputChange}
      />

      <AddressFields 
        values={values}
        onChange={onAddressChange}
      />

      <DateAndMunicipality
        values={{ geburtsdatum: values.geburtsdatum, gemeinde: values.gemeinde }}
        errors={errors}
        onChange={handleInputChange}
      />

      <ServiceSelection 
        values={{
          betreuungGeburt: values.betreuungGeburt,
          betreuungWochenbett: values.betreuungWochenbett
        }}
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