import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { DateAndMunicipalityFields } from "./DateAndMunicipalityFields";
import { ServiceSelectionFields } from "./ServiceSelectionFields";
import { FormValidation } from "@/components/FormValidation";
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

export const FormContainer = ({ values, onChange, onAddressChange, onClear, onSubmit }: FormContainerProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
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
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      await pdfGenerationService.generatePDF(values);
      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
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