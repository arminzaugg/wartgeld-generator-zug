import { cn } from "@/lib/utils";
import { Loader2, MapPin } from "lucide-react";
import type { StreetSummary } from "@/types/address";
import { ScrollArea } from "@/components/ui/scroll-area";
import { highlightMatches } from "./highlightMatches";

interface SuggestionsListProps {
  show: boolean;
  suggestions: StreetSummary[];
  selectedIndex: number;
  isLoading: boolean;
  error: unknown;
  searchTerm: string;
  onSelect: (suggestion: StreetSummary) => void;
}

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
    <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-pop animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
      <ScrollArea className="max-h-[264px]">
        {suggestions.length > 0 ? (
          // The listbox holds only options; the credit footer sits outside it.
          <ul role="listbox" id="street-suggestions-list" aria-label="Adressvorschläge">
            {suggestions.map((suggestion, index) => {
              const active = index === selectedIndex;
              return (
                <li
                  key={`${suggestion.streetName}|${suggestion.houseNumbers?.[0]?.number ?? ''}${suggestion.houseNumbers?.[0]?.addition ?? ''}|${suggestion.zipCode}|${suggestion.city}`}
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "group flex min-h-[52px] cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 transition-colors md:min-h-12",
                    active ? "bg-accent text-accent-foreground" : "text-foreground-secondary hover:bg-muted"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    onSelect(suggestion);
                  }}
                  id={`street-suggestion-${index}`}
                >
                  <MapPin
                    className={cn("hidden h-4 w-4 shrink-0 md:block", active ? "text-accent-foreground" : "text-muted-foreground")}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <div className="flex min-w-0 flex-1 flex-col md:flex-row md:flex-wrap md:items-center md:gap-x-3">
                    <span className="flex-1 text-[15px]">
                      {highlightMatches(suggestion.streetName, searchTerms)}
                      {suggestion.houseNumbers?.length === 1 && (
                        <> {suggestion.houseNumbers[0].number}{suggestion.houseNumbers[0].addition || ''}</>
                      )}
                    </span>
                    <span className={cn("shrink-0 text-[13px] md:text-sm", active ? "text-accent-foreground" : "text-muted-foreground")}>
                      {suggestion.zipCode} {highlightMatches(suggestion.city, searchTerms)}
                    </span>
                    {suggestion.houseNumbers && suggestion.houseNumbers.length > 1 && (
                      <span className="text-xs text-muted-foreground md:basis-full">
                        Nr. {suggestion.houseNumbers.map(hn => `${hn.number}${hn.addition || ''}`).join(', ')}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div role="status" className="px-4 py-6 text-center text-sm text-muted-foreground">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-1">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Suche Adressen …</span>
              </div>
            ) : error ? (
              <div className="flex flex-col gap-1 text-destructive">
                <p className="font-medium">Ein Fehler ist aufgetreten</p>
                <p className="text-xs text-muted-foreground">Bitte versuchen Sie es später erneut</p>
              </div>
            ) : searchTerm ? (
              <div className="flex flex-col gap-1">
                <p>Keine Adresse gefunden</p>
                <p className="text-xs">Überprüfen Sie die Schreibweise oder PLZ</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p>Geben Sie eine Adresse ein</p>
                <p className="text-xs">Strasse, Nr., PLZ oder Ort</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      <div className="mt-1 flex justify-between gap-4 border-t px-3 pb-1.5 pt-2.5 text-xs leading-4 text-muted-foreground">
        <span>Adressdaten: Schweizerische Post</span>
        <span className="hidden md:inline" aria-hidden="true">↑ ↓ auswählen · Enter übernehmen · Esc schliessen</span>
      </div>
    </div>
  );
};
