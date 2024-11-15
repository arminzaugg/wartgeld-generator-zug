import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useZipAutocomplete } from "@/hooks/useZipAutocomplete";
import type { ZipSuggestion } from "@/hooks/useZipAutocomplete";

interface ZipCityLookupProps {
  plz: string;
  ort: string;
  onChange: (plz: string, ort: string) => void;
}

export const ZipCityLookup = ({ plz, ort, onChange }: ZipCityLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions = [], isLoading } = useZipAutocomplete(searchTerm);

  // Handle click outside to close suggestions
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
    console.log("Search input changed:", value);
    setSearchTerm(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: ZipSuggestion) => {
    console.log("Selected suggestion:", suggestion);
    onChange(suggestion.zip, suggestion.city18);
    setSearchTerm(`${suggestion.zip} ${suggestion.city18}`);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-2 relative zip-city-lookup">
      <Label htmlFor="plz-ort">Postleitzahl & Ort</Label>
      <Input
        id="plz-ort"
        type="text"
        value={searchTerm || (plz && ort ? `${plz} ${ort}` : "")}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="PLZ oder Ort eingeben..."
        className="w-full"
        autoComplete="off"
      />

      {showSuggestions && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-2 text-sm text-gray-500">Suche...</div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.zip}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
                    plz === suggestion.zip ? "bg-gray-50" : ""
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.zip} {suggestion.city18}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-sm text-gray-500">
              Keine Ergebnisse gefunden
            </div>
          )}
        </div>
      )}
    </div>
  );
};