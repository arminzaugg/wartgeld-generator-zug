import { useState, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import type { StreetSummary, HouseNumber } from "@/types/address";
import { Loader2, MapPin, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StreetLookupProps {
  value: string;
  zipCode?: string;
  onChange: (street: string, zipCode?: string, city?: string) => void;
}

export const StreetLookup = ({ value, zipCode, onChange }: StreetLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState<StreetSummary | null>(null);
  const { suggestions = [], isLoading, error } = useStreetAutocomplete(searchTerm.length >= 2 ? searchTerm : "", zipCode);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [houseNumberInput, setHouseNumberInput] = useState("");
  const [showHouseNumbers, setShowHouseNumbers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Fehler bei der Adresssuche",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (zipCode && selectedStreet && selectedStreet.zipCode !== zipCode) {
      setSelectedStreet(null);
      setSearchTerm("");
      onChange("", undefined, undefined);
    }
  }, [zipCode]);

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
    if (!selectedStreet) {
      setSearchTerm(value);
      onChange(value, undefined, undefined);
      if (value === "") {
        setSelectedStreet(null);
      } else if (value.length >= 2) {
        setShowSuggestions(true);
        setShowHouseNumbers(false);
      } else {
        setShowSuggestions(false);
      }
    } else {
      if (value.startsWith(selectedStreet.streetName) && value.endsWith(" ")) {
        setShowHouseNumbers(true);
        setHouseNumberInput("");
      } else if (value.startsWith(selectedStreet.streetName + " ")) {
        const houseNumberPart = value.substring(selectedStreet.streetName.length + 1);
        setHouseNumberInput(houseNumberPart);
        setShowHouseNumbers(true);
      } else {
        setShowHouseNumbers(false);
      }
      setSearchTerm(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey && suggestions.length > 0 && showSuggestions) {
      e.preventDefault();
      const firstSuggestion = suggestions[0];
      handleSuggestionClick(firstSuggestion);
    }
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    setSelectedStreet(suggestion);
    setSearchTerm(suggestion.streetName);
    setShowSuggestions(false);
    setShowHouseNumbers(false);
    setHouseNumberInput("");
    onChange(suggestion.streetName, suggestion.zipCode, suggestion.city);
    
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
    setShowHouseNumbers(false);
    onChange(fullAddress, selectedStreet!.zipCode, selectedStreet!.city);
  };

  const clearSelection = () => {
    setSelectedStreet(null);
    setSearchTerm("");
    setHouseNumberInput("");
    setShowHouseNumbers(false);
    onChange("", undefined, undefined);
  };

  const getFilteredHouseNumbers = () => {
    if (!selectedStreet?.houseNumbers) return [];
    
    return selectedStreet.houseNumbers.filter(hn => {
      const fullNumber = `${hn.number}${hn.addition || ''}`;
      return fullNumber.toLowerCase().startsWith(houseNumberInput.toLowerCase());
    });
  };

  const limitedSuggestions = suggestions.slice(0, 7);

  return (
    <div className="relative street-lookup">
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            value={selectedStreet ? searchTerm : value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedStreet ? "Fügen Sie eine Hausnummer hinzu..." : "Strasse eingeben..."}
            className={cn(
              "w-full pl-9 pr-8 transition-colors",
              isLoading && "pr-12",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
            autoComplete="off"
            ref={(ref) => setInputRef(ref)}
          />
        </div>
        {selectedStreet && (
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

      {(showSuggestions || showHouseNumbers) && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
          {!selectedStreet ? (
            limitedSuggestions.length > 0 ? (
              <ul className="py-1">
                {limitedSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.STRID}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between transition-colors",
                      value === suggestion.streetName ? "bg-gray-50" : ""
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
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
                ) : searchTerm.length < 2 ? (
                  "Geben Sie mindestens 2 Zeichen ein"
                ) : (
                  "Keine Ergebnisse gefunden"
                )}
              </div>
            )
          ) : showHouseNumbers && (
            <ul className="py-1 grid grid-cols-3 gap-1">
              {getFilteredHouseNumbers().map((houseNumber, index) => (
                <li
                  key={`${houseNumber.number}-${houseNumber.addition || ''}-${index}`}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-center transition-colors"
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
