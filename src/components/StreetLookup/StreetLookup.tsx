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
  const [searchTerm, setSearchTerm] = useState(value);
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
    if (term.length >= 2) {
      // Don't show suggestions if the term matches the current value exactly (selection made)
      if (term !== value) {
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  }, 300);

  // Sync internal state with external value prop
  useEffect(() => {
    setSearchTerm(value);
    if (!value) {
      setSelectedStreet(null);
    }
  }, [value]);

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
      // Check if click is outside both input and suggestions list
      const suggestionsList = document.getElementById('street-suggestions-list');
      const isOutsideInput = !inputRef?.contains(event.target as Node);
      const isOutsideList = !suggestionsList?.contains(event.target as Node);

      if (isOutsideInput && isOutsideList) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputRef]);

  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);

    // If input is cleared, clear everything
    if (!newValue.trim()) {
      setSelectedStreet(null);
      setShowSuggestions(false);
      onChange("", "", "");
      return;
    }

    const parsed = parseAddressInput(newValue);

    // If we have a selection but user is typing a new street name...
    if (selectedStreet && !newValue.toLowerCase().includes(selectedStreet.streetName.toLowerCase())) {
      setSelectedStreet(null);
    }

    if (newValue.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Always pass the parsed values. If user types "Musterstrasse 5", zipCode/city might be empty.
    onChange(newValue, parsed.zipCode ?? "", parsed.city ?? "");
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    const { houseNumber, addition } = parseAddressInput(searchTerm);

    let fullAddress = suggestion.streetName;

    // logic to construct full address...
    if (suggestion.houseNumbers && suggestion.houseNumbers.length === 1) {
      const defaultHouseNumber = suggestion.houseNumbers[0];
      fullAddress += ` ${defaultHouseNumber.number}${defaultHouseNumber.addition || ''}`;
    } else if (houseNumber) {
      // If user already typed a house number, preserve it
      fullAddress += ` ${houseNumber}${addition || ''}`;
    }

    fullAddress += `, ${suggestion.zipCode} ${suggestion.city}`;

    // Update EVERYTHING
    setSelectedStreet(suggestion);
    setSearchTerm(fullAddress);
    setShowSuggestions(false);

    // IMPORTANT: Call onChange with the FULL address string we just constructed
    onChange(fullAddress, suggestion.zipCode, suggestion.city);

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
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
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