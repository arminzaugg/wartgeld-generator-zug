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
  const errors: {[key: string]: string} = {};
  const totalFields = 7;
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
        <div className="space-y-6">
          <PersonalInfoFields
            values={values}
            onChange={onChange}
            errors={errors}
          />
          
          <AddressFields
            values={values}
            onChange={(street, zipCode, city) => {
              if (zipCode) onChange('plz', zipCode);
              if (city) onChange('ort', city);
              onChange('address', street);
            }}
          />
          
          <DateAndMunicipalityFields
            values={values}
            onChange={onChange}
            errors={errors}
          />
        </div>
      </FormValidation>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={onClear}
        >
          Zurücksetzen
        </Button>
        <Button onClick={() => {}}>
          Abschliessen
        </Button>
      </div>
    </div>
  );
};