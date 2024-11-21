import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreetSummary } from "@/types/address";

interface StreetSuggestionsListProps {
  show: boolean;
  suggestions: StreetSummary[];
  selectedIndex: number;
  isLoading: boolean;
  error: any;
  searchTerm: string;
  onSelect: (suggestion: StreetSummary) => void;
}

export const StreetSuggestionsList = ({
  show,
  suggestions,
  selectedIndex,
  isLoading,
  error,
  searchTerm,
  onSelect
}: StreetSuggestionsListProps) => {
  if (!show) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
      {suggestions.length > 0 ? (
        <ul className="py-1">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.STRID}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between transition-colors",
                index === selectedIndex && "bg-gray-100"
              )}
              onClick={() => onSelect(suggestion)}
            >
              <span className="font-medium">{suggestion.streetName}</span>
              <span className="text-gray-600">{suggestion.zipCode} {suggestion.city}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-sm text-gray-500 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Suche...</span>
            </div>
          ) : error ? (
            <span className="text-red-500">Ein Fehler ist aufgetreten</span>
          ) : searchTerm ? (
            "Keine Ergebnisse gefunden"
          ) : (
            "Geben Sie mindestens 2 Zeichen ein"
          )}
        </div>
      )}
    </div>
  );
};