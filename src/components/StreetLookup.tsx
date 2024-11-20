import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import type { StreetSummary } from "@/types/address";
import { Loader2 } from "lucide-react";

interface StreetLookupProps {
  value: string;
  zipCode?: string;
  onChange: (street: string, zipCode?: string, city?: string) => void;
}

export const StreetLookup = ({ value, zipCode, onChange }: StreetLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions = [], isLoading } = useStreetAutocomplete(searchTerm, zipCode);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".street-lookup")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    onChange(suggestion.streetName, suggestion.zipCode, suggestion.city);
    setSearchTerm(suggestion.streetName);
    setShowSuggestions(false);
  };

  return (
    <div className="relative street-lookup">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm || value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Strasse eingeben..."
          className="w-full pr-8"
          autoComplete="off"
        />
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
                  key={suggestion.STRID}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between",
                    value === suggestion.streetName ? "bg-gray-50" : ""
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="font-medium">{suggestion.streetName}</span>
                  <span className="text-gray-600">{suggestion.zipCode}</span>
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