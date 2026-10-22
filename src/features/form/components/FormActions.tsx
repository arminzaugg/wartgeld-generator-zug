import { Link } from "react-router-dom";
import { CalendarDays, FileText, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSwissDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { InvoiceTotal } from "./ServiceSelectionFields";

interface FormActionsProps {
  onClear: () => void;
  isSubmitting?: boolean;
  isPhone?: boolean;
  total: number;
  /** ISO date when the invoice date is fixed in the settings. */
  fixedInvoiceDate?: string;
  /** Phone only: reopens the finished invoice; shown while one exists. */
  onShowPdf?: () => void;
}

/** One submit button for every layout; phones get it in a bar fixed to the bottom of the screen. */
const SubmitButton = ({ isSubmitting, className }: { isSubmitting: boolean; className?: string }) => (
  <Button type="submit" disabled={isSubmitting} className={cn("disabled:opacity-[.85]", className)}>
    {isSubmitting ? (
      <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Rechnung wird erstellt …</>
    ) : (
      <><FileText className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />Rechnung generieren</>
    )}
  </Button>
);

// Stays enabled while generating: a reset outdates the running generation (Index's counter).
const ResetButton = ({ onClear }: { onClear: () => void }) => (
  <Button type="button" variant="ghost" onClick={onClear} className="px-5">
    <RotateCcw className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
    Zurücksetzen
  </Button>
);

const FixedDateNote = ({ date }: { date: string }) => (
  <p className="flex items-center gap-2 text-sm text-muted-foreground">
    <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
    <span>
      Rechnungsdatum fest eingestellt auf {formatSwissDate(date)} ·{" "}
      <Link to="/settings" className="font-medium text-primary underline underline-offset-[3px] hover:no-underline">Ändern</Link>
    </span>
  </p>
);

export const FormActions = ({
  onClear,
  isSubmitting = false,
  isPhone = false,
  total,
  fixedInvoiceDate,
  onShowPdf,
}: FormActionsProps) => {
  if (isPhone) {
    return (
      <div className="flex flex-col items-start gap-3">
        {fixedInvoiceDate && <FixedDateNote date={fixedInvoiceDate} />}
        <ResetButton onClear={onClear} />
        <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t bg-header px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3.5 min-[360px]:px-5">
          {onShowPdf && (
            <Button id="show-pdf-button" type="button" variant="outline" className="h-11 w-full" onClick={onShowPdf}>
              <FileText className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
              Rechnung anzeigen
            </Button>
          )}
          {/* Wraps instead of overflowing on very narrow phones. */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-muted-foreground">Total</span>
              <InvoiceTotal total={total} className="text-[22px] leading-none" />
            </div>
            <SubmitButton isSubmitting={isSubmitting} className="h-[52px] grow rounded-lg px-[22px] text-base min-[360px]:grow-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>{fixedInvoiceDate && <FixedDateNote date={fixedInvoiceDate} />}</div>
      <div className="flex gap-3">
        <ResetButton onClear={onClear} />
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};
