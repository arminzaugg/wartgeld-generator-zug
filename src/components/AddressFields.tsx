import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { StreetLookup } from "@/components/StreetLookup";

interface AddressFieldsProps {
  values: {
    address: string;
    plz: string;
    ort: string;
  };
  onChange: (street: string, zipCode?: string, city?: string) => void;
}

export const AddressFields = ({ values, onChange }: AddressFieldsProps) => {
  return (
    <Card className="p-4 bg-gray-50">
      <div className="space-y-2">
        <Label>Adresse</Label>
        <StreetLookup 
          value={values.address}
          zipCode={values.plz}
          onChange={onChange}
        />
      </div>
    </Card>
  );
};