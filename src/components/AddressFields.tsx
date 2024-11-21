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
  onChange: (street: string, zipCode?: string, city?: string) => void;
}

export const AddressFields = ({ values, onChange }: AddressFieldsProps) => {
  return (
    <Card className="p-4 bg-gray-50">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Adresse</Label>
          <StreetLookup 
            value={values.address}
            zipCode={values.plz}
            onChange={onChange}
          />
        </div>
        
        {values.plz && values.ort && (
          <div className="space-y-2">
            <Label>Postleitzahl & Ort</Label>
            <div className="flex gap-2">
              <Input
                value={`${values.plz} ${values.ort}`}
                readOnly
                className="bg-gray-100 flex-1"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};