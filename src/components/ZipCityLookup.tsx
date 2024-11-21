import { useState, useEffect, KeyboardEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useZipAutocomplete } from "@/hooks/useZipAutocomplete";
import { Loader2, MapPin, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ZipCityLookupProps {
  plz: string;
  ort: string;
  onChange: (plz: string, ort: string) => void;
}

export const ZipCityLookup = ({ plz, ort, onChange }: ZipCityLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions = [], isLoading, error } = useZipAutocomplete(searchTerm);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Fehler bei der PLZ/Ort-Suche",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".zip-city-lookup")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    if (value === "") {
      onChange("", "");
      setShowSuggestions(false);
    } else if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey && suggestions.length > 0 && showSuggestions) {
      e.preventDefault();
      const firstSuggestion = suggestions[0];
      handleSuggestionClick(firstSuggestion);
    }
  };

  const handleSuggestionClick = (suggestion: { zip: string; city18: string }) => {
    onChange(suggestion.zip, suggestion.city18);
    setSearchTerm(`${suggestion.zip} ${suggestion.city18}`);
    setShowSuggestions(false);
  };

  const clearSelection = () => {
    setSearchTerm("");
    onChange("", "");
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-2 relative zip-city-lookup">
      <Label htmlFor="plz-ort">Postleitzahl & Ort</Label>
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="plz-ort"
            type="text"
            value={searchTerm || (plz && ort ? `${plz} ${ort}` : "")}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="PLZ oder Ort eingeben (mind. 2 Zeichen)..."
            className={cn(
              "w-full pl-9 pr-8 transition-colors",
              isLoading && "pr-12",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
            autoComplete="off"
          />
        </div>
        {(searchTerm || (plz && ort)) && (
          <button
            onClick={clearSelection}
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

      {showSuggestions && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.zip}-${index}`}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between transition-colors",
                    plz === suggestion.zip ? "bg-gray-50" : ""
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="font-medium">{suggestion.zip}</span>
                  <span className="text-gray-600">{suggestion.city18}</span>
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
      )}
    </div>
  );
};