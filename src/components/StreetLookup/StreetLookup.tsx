import { useState, useEffect } from "react";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import { useToast } from "@/components/ui/use-toast";
import type { StreetSummary } from "@/types/address";
import { parseAddressInput } from "@/utils/addressParser";
import { StreetInput } from "./StreetInput";
import { SuggestionsList } from "./SuggestionsList";
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  
  const { suggestions = [], isLoading, error } = useStreetAutocomplete(
    searchTerm.length >= 2 ? searchTerm : "", 
    zipCode
  );
  
  const { toast } = useToast();

  const debouncedSearch = debounce((term: string) => {
    const { streetName, zipCode: parsedZip, city } = parseAddressInput(term);
    if (streetName.length >= 2) {
      setSearchTerm(streetName);
      setShowSuggestions(true);
    }
  }, 300);

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
      if (!inputRef?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputRef]);

  const handleInputChange = (value: string) => {
    const parsed = parseAddressInput(value);
    
    if (!selectedStreet) {
      debouncedSearch(value);
      onChange(value, parsed.zipCode, parsed.city);
    } else {
      setSearchTerm(value);
      const fullAddress = `${selectedStreet.streetName} ${parsed.houseNumber}${parsed.addition || ''}`;
      onChange(fullAddress, selectedStreet.zipCode, selectedStreet.city);
    }
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    setSelectedStreet(suggestion);
    const { houseNumber, addition } = parseAddressInput(searchTerm);
    const fullHouseNumber = houseNumber + (addition || '');
    const newValue = fullHouseNumber ? `${suggestion.streetName} ${fullHouseNumber}` : suggestion.streetName;
    setSearchTerm(newValue);
    setShowSuggestions(false);
    onChange(newValue, suggestion.zipCode, suggestion.city);
    
    if (inputRef) {
      inputRef.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  const clearSelection = () => {
    setSelectedStreet(null);
    setSearchTerm("");
    onChange("", undefined, undefined);
    if (inputRef) {
      inputRef.focus();
    }
  };

  return (
    <div className="relative street-lookup">
      <StreetInput
        value={searchTerm}
        isLoading={isLoading}
        error={error}
        hasSelection={!!selectedStreet}
        placeholder="Adresse eingeben (z.B. Bahnhofstrasse 1, 6300 Zug)"
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClear={clearSelection}
        inputRef={setInputRef}
        aria-expanded={showSuggestions}
        aria-controls="street-suggestions-list"
        aria-activedescendant={
          showSuggestions && selectedIndex >= 0
            ? `street-suggestion-${selectedIndex}`
            : undefined
        }
      />

      <SuggestionsList 
        show={showSuggestions}
        suggestions={suggestions}
        selectedIndex={selectedIndex}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSelect={handleSuggestionClick}
      />
    </div>
  );
};