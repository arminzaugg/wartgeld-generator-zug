import { Progress } from "@/components/ui/progress";

interface FormProgressProps {
  completedFields: number;
  totalFields: number;
}

export const FormProgress = ({ completedFields, totalFields }: FormProgressProps) => {
  const progress = (completedFields / totalFields) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Formular Fortschritt</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};