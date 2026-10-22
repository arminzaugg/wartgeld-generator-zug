import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

/** Field order on the page, with the label each message is prefixed with and the element it focuses. */
const FIELDS: { key: string; label: string; target: string }[] = [
  { key: "vorname", label: "Vorname", target: "vorname" },
  { key: "nachname", label: "Nachname", target: "nachname" },
  { key: "address", label: "Adresse", target: "address-input" },
  { key: "plz", label: "Adresse", target: "address-input" },
  { key: "geburtsdatum", label: "Geburtsdatum", target: "geburtsdatum" },
  { key: "gemeindeBfs", label: "Zuständige Gemeinde", target: "gemeindeBfs" },
];

interface ErrorSummaryProps {
  errors: { [key: string]: string };
}

export const ErrorSummary = forwardRef<HTMLHeadingElement, ErrorSummaryProps>(({ errors }, headingRef) => {
  const entries = FIELDS.filter(field => errors[field.key]);
  if (entries.length === 0) return null;

  return (
    <div className="flex items-start gap-4 rounded-lg border border-danger-ring bg-destructive-soft p-5 text-destructive-foreground">
      <AlertCircle className="h-[22px] w-[22px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <div className="flex flex-col gap-2 text-sm leading-[21px]">
        <h2 ref={headingRef} tabIndex={-1} className="font-sans text-[15px] font-semibold focus:outline-none">
          Bitte prüfen Sie {entries.length} {entries.length === 1 ? "Angabe" : "Angaben"}
        </h2>
        <ul className="flex flex-col gap-1">
          {entries.map(field => (
            <li key={field.key}>
              {/* A button, not href="#id": the app uses a HashRouter, so a fragment link would navigate away. */}
              <button
                type="button"
                className="text-left underline underline-offset-[3px] hover:no-underline focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsl(var(--primary))]"
                onClick={() => document.getElementById(field.target)?.focus()}
              >
                {field.label}: {errors[field.key]}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
ErrorSummary.displayName = "ErrorSummary";
