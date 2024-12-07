import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onClear: () => void;
  isSubmitting?: boolean;
}

export const FormActions = ({ onClear, isSubmitting = false }: FormActionsProps) => {
  return (
    <div className="sticky bottom-0 bg-background pt-4">
      <div className="container flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          onClick={onClear}
          className="w-full sm:w-1/2 h-11"
          type="button"
        >
          Formular Zurücksetzen
        </Button>
        <Button 
          className="w-full sm:w-1/2 h-11"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Wird generiert...' : 'Rechnung Generieren'}
        </Button>
      </div>
    </div>
  );
};