import { MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StreetInputProps {
  value: string;
  isLoading: boolean;
  error: unknown;
  /** The form found a problem with the address. */
  invalid?: boolean;
  hasSelection: boolean;
  placeholder: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
  inputRef: (ref: HTMLInputElement | null) => void;
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-activedescendant"?: string;
  "aria-describedby"?: string;
}

/** The accessible name comes from the visible "Adresse" label (`htmlFor="address-input"`). */
export const StreetInput = ({
  value,
  isLoading,
  error,
  invalid = false,
  hasSelection,
  placeholder,
  onInputChange,
  onKeyDown,
  onClear,
  inputRef,
  ...ariaProps
}: StreetInputProps) => {
  return (
    <div className="relative">
      <MapPin
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <Input
        id="address-input"
        type="text"
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn("pl-11 pr-10", (isLoading || value) && "pr-12")}
        aria-invalid={invalid || !!error}
        autoComplete="off"
        role="combobox"
        {...ariaProps}
        ref={inputRef}
      />

      {isLoading ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0.5 top-1/2 h-11 w-11 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={onClear}
          aria-label="Eingabe löschen"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
};
