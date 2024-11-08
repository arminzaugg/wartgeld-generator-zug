import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddressLookup } from "./AddressLookup";

interface FormFieldsProps {
  values: {
    companyName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    additionalNotes: string;
  };
  onChange: (field: string, value: string) => void;
  onAddressSelect: (address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
}

export const FormFields = ({ values, onChange, onAddressSelect }: FormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={values.companyName}
          onChange={(e) => onChange("companyName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Address Lookup</Label>
        <AddressLookup onSelect={onAddressSelect} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          value={values.address}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={values.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={values.state}
            onChange={(e) => onChange("state", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">ZIP Code</Label>
        <Input
          id="zipCode"
          value={values.zipCode}
          onChange={(e) => onChange("zipCode", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          value={values.additionalNotes}
          onChange={(e) => onChange("additionalNotes", e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
};