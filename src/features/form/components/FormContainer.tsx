import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormProgress } from "./FormProgress";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { DateAndMunicipalityFields } from "./DateAndMunicipalityFields";
import { FormValidation } from "@/components/FormValidation";
import { Database } from "@/integrations/supabase/types";

type FormData = Database['public']['Tables']['form_data']['Row'];

interface FormContainerProps {
  values: FormData;
  onChange: (field: string, value: string | boolean) => void;
  onAddressChange: (street: string, zipCode?: string, city?: string) => void;
  onClear: () => void;
}

export const FormContainer = ({
  values,
  onChange,
  onAddressChange,
  onClear,
}: FormContainerProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const totalFields = 7; // vorname, nachname, address, plz, ort, geburtsdatum, gemeinde
  const completedFields = Object.values(values).filter(value => 
    value !== null && value !== '' && typeof value !== 'undefined'
  ).length;

  return (
    <div className="space-y-6">
      <FormProgress 
        completedFields={completedFields} 
        totalFields={totalFields} 
      />
      <FormValidation errors={errors}>
        {currentStep === 1 && (
          <PersonalInfoFields
            values={values}
            onChange={onChange}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <AddressFields
            values={values}
            onChange={(street, zipCode, city) => {
              if (zipCode) onChange('plz', zipCode);
              if (city) onChange('ort', city);
              onChange('address', street);
            }}
          />
        )}
        {currentStep === 3 && (
          <DateAndMunicipalityFields
            values={values}
            onChange={onChange}
            errors={errors}
          />
        )}
      </FormValidation>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onClear : handleBack}
        >
          {currentStep === 1 ? "Zurücksetzen" : "Zurück"}
        </Button>
        <Button onClick={handleNext}>
          {currentStep === 3 ? "Abschliessen" : "Weiter"}
        </Button>
      </div>
    </div>
  );
};