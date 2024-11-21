import { MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  inputRef
}: StreetInputProps) => {
  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full pl-9 pr-8 transition-colors",
            isLoading && "pr-12",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          autoComplete="off"
          ref={inputRef}
        />
      </div>
      {hasSelection && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Auswahl löschen"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
};