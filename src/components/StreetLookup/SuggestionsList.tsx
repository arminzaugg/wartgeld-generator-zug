import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { StreetSummary } from "@/types/address";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SuggestionsListProps {
  show: boolean;
  suggestions: StreetSummary[];
  selectedIndex: number;
  isLoading: boolean;
  error: any;
  searchTerm: string;
  onSelect: (suggestion: StreetSummary) => void;
}

const highlightMatches = (text: string, searchTerms: string[]) => {
  let result = text;
  searchTerms.forEach(term => {
    if (term.length < 2) return;
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark class="bg-yellow-100 font-medium">$1</mark>');
  });
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

export const SuggestionsList = ({
  show,
  suggestions,
  selectedIndex,
  isLoading,
  error,
  searchTerm,
  onSelect
}: SuggestionsListProps) => {
  if (!show) return null;

  const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);

  return (
    <div 
      className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg animate-in fade-in slide-in-from-top-2"
      role="listbox"
      id="street-suggestions-list"
    >
      <ScrollArea className="max-h-60">
        {suggestions.length > 0 ? (
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.STRID}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex flex-col gap-1 transition-colors",
                  index === selectedIndex && "bg-gray-100"
                )}
                onClick={() => onSelect(suggestion)}
                id={`street-suggestion-${index}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {highlightMatches(suggestion.streetName, searchTerms)}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {suggestion.zipCode} {highlightMatches(suggestion.city, searchTerms)}
                  </span>
                </div>
                {suggestion.houseNumbers && suggestion.houseNumbers.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Hausnummern verfügbar
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-sm text-center">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Suche Adressen...</span>
              </div>
            ) : error ? (
              <div className="text-red-500">
                <p>Ein Fehler ist aufgetreten</p>
                <p className="text-xs mt-1">Bitte versuchen Sie es später erneut</p>
              </div>
            ) : searchTerm ? (
              <div className="text-gray-500">
                <p>Keine Ergebnisse gefunden</p>
                <p className="text-xs mt-1">Versuchen Sie es mit einem anderen Suchbegriff</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <p>Geben Sie mindestens 2 Zeichen ein</p>
                <p className="text-xs mt-1">z.B. Strasse, Ort oder PLZ</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};