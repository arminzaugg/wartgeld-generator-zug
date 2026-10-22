import { AlertCircle } from "lucide-react";

/** Inline message under a field; `id` is what the field's `aria-describedby` points at. */
export const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="flex items-start gap-1.5 text-[13px] leading-[18px] text-destructive">
      <AlertCircle className="mt-px h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>{message}</span>
    </p>
  ) : null;
