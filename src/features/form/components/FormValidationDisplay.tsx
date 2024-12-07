import { FormValidation } from "@/components/FormValidation";

interface FormValidationDisplayProps {
  errors: { [key: string]: string };
}

export const FormValidationDisplay = ({ errors }: FormValidationDisplayProps) => {
  if (Object.keys(errors).length === 0) return null;
  
  return <FormValidation errors={errors} />;
};