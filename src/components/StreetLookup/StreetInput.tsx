import { MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface StreetInputProps {
  value: string;
  isLoading: boolean;
  error: any;
  hasSelection: boolean;
  placeholder: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
  inputRef: (ref: HTMLInputElement | null) => void;
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-activedescendant"?: string;
}

export const StreetInput = ({
  value,
  isLoading,
  error,
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
      <Label htmlFor="address-input" className="sr-only">Adresse eingeben</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          id="address-input"
          type="text"
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Strasse, Ort oder PLZ eingeben..."
          className={cn(
            "w-full pl-9 pr-8 transition-colors",
            isLoading && "pr-12",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          autoComplete="off"
          role="combobox"
          {...ariaProps}
          ref={inputRef}
          aria-label="Adresseingabe mit Autovervollständigung"
        />
      </div>

      {(hasSelection || value) && (
        <Button
          onClick={onClear}
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          aria-label="Auswahl löschen"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2" aria-hidden="true">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
};