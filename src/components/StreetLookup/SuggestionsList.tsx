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
      className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-black/5"
      role="listbox"
      id="street-suggestions-list"
    >
      <ScrollArea className="max-h-[300px]">
        {suggestions.length > 0 ? (
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.STRID}-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors border-b last:border-0 border-gray-50",
                  index === selectedIndex ? "bg-primary/10" : "hover:bg-gray-50"
                )}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  onSelect(suggestion);
                }}
                id={`street-suggestion-${index}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-gray-900">
                      {highlightMatches(suggestion.streetName, searchTerms)}
                    </span>
                    <span className="shrink-0 text-sm font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded">
                      {suggestion.zipCode} {highlightMatches(suggestion.city, searchTerms)}
                    </span>
                  </div>

                  {suggestion.houseNumbers && suggestion.houseNumbers.length > 0 && (
                    <div className="text-xs text-gray-500 flex flex-wrap gap-1 mt-1 pl-1 border-l-2 border-gray-200">
                      {suggestion.houseNumbers.map((hn, idx) => (
                        <span key={idx} className="bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors">
                          {hn.number}{hn.addition || ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-sm text-center bg-gray-50/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Suche Adressen...</span>
              </div>
            ) : error ? (
              <div className="text-destructive flex flex-col gap-1">
                <p className="font-medium">Ein Fehler ist aufgetreten</p>
                <p className="text-xs text-muted-foreground">Bitte versuchen Sie es später erneut</p>
              </div>
            ) : searchTerm ? (
              <div className="text-muted-foreground flex flex-col gap-1">
                <p>Keine Adresse gefunden</p>
                <p className="text-xs">Überprüfen Sie die Schreibweise oder PLZ</p>
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col gap-1">
                <p>Geben Sie eine Adresse ein</p>
                <p className="text-xs text-muted-foreground/80">Strasse, Nr., PLZ oder Ort</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};