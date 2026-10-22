import { Label } from "@/components/ui/label";
import { StreetLookup } from "@/components/StreetLookup";
import { FieldError } from "./FieldError";

interface AddressFieldsProps {
  values: {
    address: string;
    plz: string;
    ort: string;
  };
  errors?: {
    [key: string]: string;
  };
  onChange: (street: string, zipCode?: string, city?: string) => void;
}

export const AddressFields = ({ values, errors = {}, onChange }: AddressFieldsProps) => {
  // A missing address and a missing or foreign postcode are both problems of this one field.
  const error = errors.address ?? errors.plz;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="address-input">Adresse</Label>
      <StreetLookup
        value={values.address}
        zipCode={values.plz}
        onChange={onChange}
        invalid={Boolean(error)}
        describedBy={error ? "address-error" : "address-help"}
      />
      {error ? (
        <FieldError id="address-error" message={error} />
      ) : (
        <p id="address-help" className="text-[13px] leading-[18px] text-muted-foreground">
          Tippen Sie Strasse und Nummer. PLZ und Ort übernehmen Sie aus der Liste der Post.
        </p>
      )}
    </div>
  );
};
