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
  const { suggestions = [], isLoading } = useStreetAutocomplete(searchTerm, zipCode);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [houseNumberInput, setHouseNumberInput] = useState("");

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
    if (!selectedStreet) {
      setSearchTerm(value);
      onChange(value, undefined, undefined);
      if (value === "") {
        setSelectedStreet(null);
      } else {
        setShowSuggestions(true);
      }
    } else {
      setHouseNumberInput(value);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    setSelectedStreet(suggestion);
    setSearchTerm(suggestion.streetName);
    setShowSuggestions(false);
    setHouseNumberInput("");
    
    // Focus back on input for house number
    if (inputRef) {
      inputRef.focus();
    }
  };

  const handleHouseNumberClick = (houseNumber: HouseNumber) => {
    const fullNumber = houseNumber.addition 
      ? `${houseNumber.number}${houseNumber.addition}`
      : houseNumber.number;
    
    const fullAddress = `${selectedStreet!.streetName} ${fullNumber}`;
    setSearchTerm(fullAddress);
    setShowSuggestions(false);
    onChange(fullAddress, selectedStreet!.zipCode, selectedStreet!.city);
  };

  const clearSelection = () => {
    setSelectedStreet(null);
    setSearchTerm("");
    setHouseNumberInput("");
    onChange("", undefined, undefined);
  };

  const getFilteredHouseNumbers = () => {
    if (!selectedStreet?.houseNumbers) return [];
    
    return selectedStreet.houseNumbers.filter(hn => {
      const fullNumber = `${hn.number}${hn.addition || ''}`;
      return fullNumber.toLowerCase().startsWith(houseNumberInput.toLowerCase());
    });
  };

  return (
    <div className="relative street-lookup">
      <div className="relative">
        <Input
          type="text"
          value={selectedStreet ? searchTerm : value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={selectedStreet ? "Hausnummer eingeben..." : "Strasse eingeben..."}
          className="w-full pr-8"
          autoComplete="off"
          ref={(ref) => setInputRef(ref)}
        />
        {selectedStreet && (
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

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {!selectedStreet ? (
            suggestions.length > 0 ? (
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
            )
          ) : (
            <ul className="py-1 grid grid-cols-3 gap-1">
              {getFilteredHouseNumbers().map((houseNumber, index) => (
                <li
                  key={`${houseNumber.number}-${houseNumber.addition || ''}-${index}`}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-center"
                  onClick={() => handleHouseNumberClick(houseNumber)}
                >
                  {houseNumber.number}{houseNumber.addition || ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};