import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SERVICE_FEE, formatChf, invoiceTotal } from "@/lib/invoiceTotal";

interface ServiceSelectionFieldsProps {
  values: {
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  };
  onChange: (field: string, value: boolean) => void;
  /** On phones the total sits in the bottom action bar instead. */
  showTotal?: boolean;
}

const SERVICES = [
  { id: "betreuungGeburt", label: "Betreuung der Gebärenden zuhause" },
  { id: "betreuungWochenbett", label: "Pflege der Wöchnerin zuhause" },
] as const;

export const InvoiceTotal = ({ total, className }: { total: number; className?: string }) => (
  <span
    data-testid="invoice-total"
    className={cn("whitespace-nowrap font-serif font-medium tabular-nums tracking-[-0.01em]", total ? "text-foreground" : "text-muted-foreground", className)}
  >
    {formatChf(total)}
  </span>
);

export const ServiceSelectionFields = ({ values, onChange, showTotal = true }: ServiceSelectionFieldsProps) => (
  <div className="flex flex-col gap-3">
    {SERVICES.map(({ id, label }) => {
      const checked = values[id];
      return (
        // The whole row is the label: a click on text or price toggles the checkbox once.
        <label
          key={id}
          htmlFor={id}
          className={cn(
            "flex min-h-16 cursor-pointer items-center gap-3 rounded-lg px-4 py-3 min-[360px]:gap-4 transition-colors has-[:focus-visible]:shadow-[0_0_0_4px_var(--ring)] md:px-5",
            checked ? "border-[1.5px] border-primary bg-selected" : "border border-input bg-field hover:bg-muted"
          )}
        >
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={(state) => onChange(id, state === true)}
          />
          {/* Below 360px the price moves under the label so long German words never overflow. */}
          <span className="flex min-w-0 flex-1 flex-col gap-1 min-[360px]:flex-row min-[360px]:items-center min-[360px]:gap-4">
            <span className="flex-1 text-base font-medium leading-[22px]">{label}</span>
            <span className={cn("whitespace-nowrap font-serif text-[17px] font-medium tabular-nums", !checked && "text-muted-foreground")}>
              {formatChf(SERVICE_FEE)}
            </span>
          </span>
        </label>
      );
    })}
    {showTotal && (
      <div className="mt-3 flex items-baseline justify-between border-t pt-6">
        <span className="text-[15px] text-foreground-secondary">Total</span>
        <InvoiceTotal total={invoiceTotal(values)} className="text-[32px] leading-none" />
      </div>
    )}
  </div>
);
