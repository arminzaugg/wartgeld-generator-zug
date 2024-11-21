import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import { Loader2, MapPin, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { StreetSuggestionsList } from "./StreetSuggestionsList";
import { HouseNumbersList } from "./HouseNumbersList";
import type { StreetSummary } from "@/types/address";

interface StreetLookupProps {
  value: string;
  zipCode?: string;
  onChange: (street: string, zipCode?: string, city?: string) => void;
}

export const StreetLookup = ({ value, zipCode, onChange }: StreetLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState<StreetSummary | null>(null);
  const { suggestions = [], isLoading, error } = useStreetAutocomplete(searchTerm, zipCode);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [houseNumberInput, setHouseNumberInput] = useState("");
  const [showHouseNumbers, setShowHouseNumbers] = useState(false);
  const { toast } = useToast();

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

  const { selectedIndex: streetSelectedIndex, handleKeyDown: handleStreetKeyDown } = useKeyboardNavigation({
    items: suggestions,
    isVisible: showSuggestions,
    onSelect: handleSuggestionClick
  });

  const { selectedIndex: houseNumberSelectedIndex, handleKeyDown: handleHouseNumberKeyDown } = useKeyboardNavigation({
    items: selectedStreet?.houseNumbers || [],
    isVisible: showHouseNumbers,
    onSelect: handleHouseNumberClick
  });

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
      } else {
        setShowSuggestions(true);
        setShowHouseNumbers(false);
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

  return (
    <div className="relative street-lookup">
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            value={selectedStreet ? searchTerm : value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={showHouseNumbers ? handleHouseNumberKeyDown : handleStreetKeyDown}
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

      <StreetSuggestionsList 
        show={showSuggestions}
        suggestions={suggestions}
        selectedIndex={streetSelectedIndex}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSelect={handleSuggestionClick}
      />

      <HouseNumbersList 
        show={showHouseNumbers}
        street={selectedStreet}
        selectedIndex={houseNumberSelectedIndex}
        houseNumberInput={houseNumberInput}
        onSelect={handleHouseNumberClick}
      />
    </div>
  );
};
