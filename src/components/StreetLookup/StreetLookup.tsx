import { useState, useEffect } from "react";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import { useToast } from "@/components/ui/use-toast";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { StreetSuggestionsList } from "./StreetSuggestionsList";
import { HouseNumbersList } from "./HouseNumbersList";
import { StreetInput } from "./StreetInput";
import type { StreetSummary, HouseNumber } from "@/types/address";
import { debounce } from "lodash";

interface StreetLookupProps {
  value: string;
  zipCode?: string;
  onChange: (street: string, zipCode?: string, city?: string) => void;
}

export const StreetLookup = ({ value, zipCode, onChange }: StreetLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState<StreetSummary | null>(null);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [houseNumberInput, setHouseNumberInput] = useState("");
  const [showHouseNumbers, setShowHouseNumbers] = useState(false);
  const { toast } = useToast();

  // Function declarations moved to the top to fix the reference error
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

  // Debounced search function
  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const { suggestions = [], isLoading, error } = useStreetAutocomplete(
    searchTerm.length >= 2 ? searchTerm : "", 
    zipCode
  );

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
      debouncedSearch(value);
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

  const clearSelection = () => {
    setSelectedStreet(null);
    setSearchTerm("");
    setHouseNumberInput("");
    setShowHouseNumbers(false);
    onChange("", undefined, undefined);
    if (inputRef) {
      inputRef.focus();
    }
  };

  return (
    <div className="relative street-lookup">
      <StreetInput
        value={selectedStreet ? searchTerm : value}
        isLoading={isLoading}
        error={error}
        hasSelection={!!selectedStreet}
        placeholder={selectedStreet ? "Fügen Sie eine Hausnummer hinzu..." : "Strasse eingeben..."}
        onInputChange={handleInputChange}
        onKeyDown={showHouseNumbers ? handleHouseNumberKeyDown : handleStreetKeyDown}
        onClear={clearSelection}
        inputRef={setInputRef}
        aria-expanded={showSuggestions || showHouseNumbers}
        aria-controls="street-suggestions-list"
        aria-activedescendant={
          showSuggestions && streetSelectedIndex >= 0
            ? `street-suggestion-${streetSelectedIndex}`
            : undefined
        }
      />

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