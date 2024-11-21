import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StreetLookup } from "@/components/StreetLookup";
import { ZipLookup } from "@/components/ZipLookup";

interface AddressFieldsProps {
  values: {
    address: string;
    plz: string;
    ort: string;
  };
  onChange: (field: string, value: string) => void;
}

export const AddressFields = ({ values, onChange }: AddressFieldsProps) => {
  const [showStreetLookup, setShowStreetLookup] = useState(true);

  const handleStreetChange = (street: string, zipCode?: string, city?: string) => {
    onChange("address", street);
    if (zipCode) onChange("plz", zipCode);
    if (city) onChange("ort", city);
  };

  const handleZipCityChange = (zipCode: string, city: string) => {
    onChange("plz", zipCode);
    onChange("ort", city);
    setShowStreetLookup(true);
  };

  return (
    <Card className="p-4 bg-gray-50">
      <div className="space-y-4">
        {!values.plz && (
          <div className="space-y-2">
            <Label>Postleitzahl & Ort</Label>
            <ZipLookup onSelect={handleZipCityChange} />
          </div>
        )}

        {showStreetLookup && (
          <div className="space-y-2">
            <Label>Adresse</Label>
            <StreetLookup 
              value={values.address}
              zipCode={values.plz}
              onChange={handleStreetChange}
            />
          </div>
        )}
        
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