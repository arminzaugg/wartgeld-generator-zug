import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useZipAutocomplete } from "@/hooks/useZipAutocomplete";
import type { ZipSuggestion } from "@/hooks/useZipAutocomplete";
import { Loader2 } from "lucide-react";

interface ZipCityLookupProps {
  plz: string;
  ort: string;
  onChange: (plz: string, ort: string) => void;
}

export const ZipCityLookup = ({ plz, ort, onChange }: ZipCityLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions = [], isLoading } = useZipAutocomplete(searchTerm);

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
    } else {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: ZipSuggestion) => {
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
        <Input
          id="plz-ort"
          type="text"
          value={searchTerm || (plz && ort ? `${plz} ${ort}` : "")}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="PLZ oder Ort eingeben..."
          className="w-full pr-8"
          autoComplete="off"
        />
        {(searchTerm || (plz && ort)) && (
          <button
            onClick={clearSelection}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>

      {showSuggestions && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.zip}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between",
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
            <div className="p-2 text-sm text-gray-500 text-center">
              {isLoading ? "Suche..." : "Keine Ergebnisse gefunden"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};