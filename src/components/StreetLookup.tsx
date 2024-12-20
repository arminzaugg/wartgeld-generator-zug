import { useState, useEffect } from "react";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { StreetSummary } from "@/types/address";
import { parseAddressInput } from "@/utils/addressParser";
import { StreetInput } from "./StreetLookup/StreetInput";
import { SuggestionsList } from "./StreetLookup/SuggestionsList";

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
  const queryClient = useQueryClient();
  
  const { suggestions = [], isLoading, error } = useStreetAutocomplete(
    searchTerm.length >= 2 ? searchTerm : "", 
    zipCode
  );
  
  const { toast } = useToast();

  // Reset component when value prop is empty (form reset)
  useEffect(() => {
    if (!value) {
      setSearchTerm("");
      setSelectedStreet(null);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      // Remove all street queries from the cache
      queryClient.removeQueries({ queryKey: ['streetSearch'] });
    }
  }, [value, queryClient]);

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
    const { streetName, houseNumber, addition } = parseAddressInput(value);
    setSearchTerm(value);
    
    if (!selectedStreet) {
      onChange(value, undefined, undefined);
      setShowSuggestions(streetName.length >= 2);
    } else {
      const fullHouseNumber = houseNumber + (addition || '');
      const matchingHouseNumber = selectedStreet.houseNumbers?.find(hn => {
        const completeNumber = hn.number + (hn.addition || '');
        return completeNumber.toLowerCase() === fullHouseNumber.toLowerCase();
      });

      if (matchingHouseNumber) {
        const fullAddress = `${selectedStreet.streetName} ${fullHouseNumber}, ${selectedStreet.zipCode} ${selectedStreet.city}`;
        onChange(fullAddress, selectedStreet.zipCode, selectedStreet.city);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    setSelectedStreet(suggestion);
    const { houseNumber, addition } = parseAddressInput(searchTerm);
    const fullHouseNumber = houseNumber + (addition || '');
    
    let fullAddress = suggestion.streetName;
    if (fullHouseNumber) {
      fullAddress += ` ${fullHouseNumber}`;
    } else if (suggestion.houseNumbers && suggestion.houseNumbers.length === 1) {
      const defaultHouseNumber = suggestion.houseNumbers[0];
      fullAddress += ` ${defaultHouseNumber.number}${defaultHouseNumber.addition || ''}`;
    }
    fullAddress += `, ${suggestion.zipCode} ${suggestion.city}`;
    
    setSearchTerm(fullAddress);
    setShowSuggestions(false);
    onChange(fullAddress, suggestion.zipCode, suggestion.city);
    
    if (inputRef) {
      inputRef.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      }
      return;
    }

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
    // Remove all street queries from the cache
    queryClient.removeQueries({ queryKey: ['streetSearch'] });
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
        placeholder="Adresse eingeben (z.B. Dorfstrasse 1, 6312 Steinhausen)"
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
