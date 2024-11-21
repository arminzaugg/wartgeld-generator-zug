import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StreetLookup } from "@/components/StreetLookup";

interface AddressFieldsProps {
  values: {
    address: string;
    plz: string;
    ort: string;
  };
  onChange: (field: string, value: string) => void;
}

export const AddressFields = ({ values, onChange }: AddressFieldsProps) => {
  const handleStreetChange = (street: string, zipCode?: string, city?: string) => {
    onChange("address", street);
    onChange("plz", zipCode || "");
    onChange("ort", city || "");
  };

  return (
    <Card className="p-4 bg-gray-50">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Adresse</Label>
          <StreetLookup 
            value={values.address}
            zipCode={values.plz}
            onChange={handleStreetChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Postleitzahl & Ort</Label>
          <Input
            value={values.plz && values.ort ? `${values.plz} ${values.ort}` : ""}
            readOnly
            className="bg-gray-100"
            placeholder="Wird automatisch ausgefüllt"
          />
        </div>
      </div>
    </Card>
  );
};