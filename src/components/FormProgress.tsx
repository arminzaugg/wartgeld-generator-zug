import { Progress } from "@/components/ui/progress";

interface FormProgressProps {
  completedFields: number;
  totalFields: number;
}

export const FormProgress = ({ completedFields, totalFields }: FormProgressProps) => {
  const percentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>{completedFields} von {totalFields} Felder ausgefüllt</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};