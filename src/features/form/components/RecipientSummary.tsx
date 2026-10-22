import { Landmark, Check } from "lucide-react";
import { recipientLabel } from "@/lib/recipient";
import { Badge } from "@/components/ui/badge";

interface RecipientSummaryProps {
  gemeindeBfs: string;
  plz: string;
  ort: string;
}

/** Display only: nothing here is focusable, so Tab goes from the municipality select straight to the services. */
export const RecipientSummary = ({ gemeindeBfs, plz, ort }: RecipientSummaryProps) => {
  const label = gemeindeBfs ? recipientLabel(Number(gemeindeBfs)) : null;
  if (!label) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border bg-background px-4 py-3.5 md:px-5">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">PLZ / Ort</span>
        <span className="text-[15px] font-semibold tabular-nums">{plz} {ort}</span>
      </div>
      <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 basis-48 items-center gap-3">
        <Landmark className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Rechnung geht an</span>
          <span className="text-[15px] font-semibold">{label}</span>
        </div>
      </div>
      <Badge className="hidden sm:inline-flex">
        <Check strokeWidth={2.25} aria-hidden="true" />
        Kanton Zug
      </Badge>
    </div>
  );
};
