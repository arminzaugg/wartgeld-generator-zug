import { useState } from "react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { DateAndMunicipalityFields } from "./DateAndMunicipalityFields";
import { ServiceSelectionFields } from "./ServiceSelectionFields";
import { FormActions } from "./FormActions";
import { FormValidationDisplay } from "./FormValidationDisplay";
import { formValidationService } from "@/services/form/formValidationService";
import { pdfGenerationService } from "@/services/pdf/pdfGenerationService";
import { useToast } from "@/components/ui/use-toast";

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

export const FormContainer = ({ 
  values, 
  onChange, 
  onAddressChange, 
  onClear, 
  onSubmit 
}: FormContainerProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    const error = formValidationService.validateField(field, value);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = formValidationService.validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Bitte überprüfen Sie Ihre Eingaben",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await pdfGenerationService.generatePDF(values);
      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: "PDF konnte nicht generiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              geburtsdatum: values.geburtsdatum
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

      <FormActions 
        onClear={onClear}
        isSubmitting={isSubmitting}
      />

      <FormValidationDisplay errors={errors} />
    </form>
  );
};