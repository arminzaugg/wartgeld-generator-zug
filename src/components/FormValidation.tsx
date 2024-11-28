import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface FormValidationProps {
  errors: {
    [key: string]: string;
  };
}

export const FormValidation = ({ errors }: FormValidationProps) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <Alert variant="destructive" className="mt-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc pl-4 mt-2">
          {Object.entries(errors).map(([field, error]) => (
            <li key={field}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};