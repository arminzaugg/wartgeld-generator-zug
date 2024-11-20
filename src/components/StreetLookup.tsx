import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import type { StreetSummary, HouseNumber } from "@/types/address";
import { Loader2 } from "lucide-react";

interface StreetLookupProps {
  value: string;
  zipCode?: string;
  onChange: (street: string, zipCode?: string, city?: string) => void;
}

export const StreetLookup = ({ value, zipCode, onChange }: StreetLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState<StreetSummary | null>(null);
  const [showHouseNumbers, setShowHouseNumbers] = useState(false);
  const { suggestions = [], isLoading } = useStreetAutocomplete(searchTerm, zipCode);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".street-lookup")) {
        setShowSuggestions(false);
        setShowHouseNumbers(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    onChange(value, undefined, undefined); // This line ensures the parent component gets updated when clearing
    if (value === "") {
      setSelectedStreet(null);
      setShowHouseNumbers(false);
    } else {
      setShowSuggestions(true);
      setShowHouseNumbers(false);
    }
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    setSelectedStreet(suggestion);
    setShowSuggestions(false);
    setShowHouseNumbers(true);
  };

  const handleHouseNumberClick = (houseNumber: HouseNumber) => {
    if (!selectedStreet) return;
    
    const fullAddress = `${selectedStreet.streetName} ${houseNumber.number}${houseNumber.addition ? houseNumber.addition : ''}`;
    onChange(fullAddress, selectedStreet.zipCode, selectedStreet.city);
    setSearchTerm(fullAddress);
    setShowHouseNumbers(false);
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

      {showHouseNumbers && selectedStreet?.houseNumbers && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1 grid grid-cols-2 sm:grid-cols-3 gap-1">
            {selectedStreet.houseNumbers.map((houseNumber, index) => (
              <li
                key={`${houseNumber.number}-${houseNumber.addition || ''}-${index}`}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-center"
                onClick={() => handleHouseNumberClick(houseNumber)}
              >
                {houseNumber.number}{houseNumber.addition || ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};