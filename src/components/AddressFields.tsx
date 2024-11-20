import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ZipCityLookup } from "@/components/ZipCityLookup";
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
  const handleZipCityChange = (plz: string, ort: string) => {
    onChange("plz", plz);
    onChange("ort", ort);
  };

  const handleStreetChange = (street: string, zipCode?: string, city?: string) => {
    onChange("address", street);
    if (zipCode) onChange("plz", zipCode);
    if (city) onChange("ort", city);
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
        
        <ZipCityLookup 
          plz={values.plz}
          ort={values.ort}
          onChange={handleZipCityChange}
        />
      </div>
    </Card>
  );
};