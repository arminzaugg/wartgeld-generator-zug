import { AddressFields } from "@/components/AddressFields";
import { PersonalInfoFields } from "@/features/form/components/PersonalInfoFields";
import { DateAndMunicipalityFields } from "@/features/form/components/DateAndMunicipalityFields";
import { ServiceSelectionFields } from "@/features/form/components/ServiceSelectionFields";

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
}

export const FormFields = ({ values, onChange }: FormFieldsProps) => {
  const handleAddressChange = (street: string, zipCode?: string, city?: string) => {
    onChange("address", street);
    if (zipCode) onChange("plz", zipCode);
    if (city) onChange("ort", city);
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Angaben</h2>
      <div className="space-y-6">
        <PersonalInfoFields 
          values={values} 
          onChange={onChange} 
        />

        <AddressFields 
          values={values} 
          onChange={handleAddressChange} 
        />

        <DateAndMunicipalityFields 
          values={values} 
          onChange={onChange} 
        />

        <ServiceSelectionFields 
          values={values} 
          onChange={onChange} 
        />
      </div>
    </>
  );
};