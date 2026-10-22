import { useId } from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Card footer, e.g. the section's save button. */
  footer?: React.ReactNode;
}

/** One settings section: title and description beside a card (stacked below 1024px). */
export const SettingsSection = ({ title, description, children, footer }: SettingsSectionProps) => {
  const id = useId();
  return (
    <section aria-labelledby={id} className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-1.5">
        <h2 id={id} className="text-[22px] leading-7">{title}</h2>
        <p className="text-sm leading-[21px] text-foreground-secondary">{description}</p>
      </div>
      <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-card">
        <div className={cn("flex flex-col gap-5 p-5 md:p-8")}>{children}</div>
        {footer && (
          <div className="flex justify-end border-t bg-background px-5 py-4 md:px-8">{footer}</div>
        )}
      </div>
    </section>
  );
};
