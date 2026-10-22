import { useState, useEffect } from "react";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { StreetSummary } from "@/types/address";
import { parseAddressInput } from "@/utils/addressParser";
import { normalizeTown } from "@/lib/municipality";
import { StreetInput } from "./StreetLookup/StreetInput";
import { SuggestionsList } from "./StreetLookup/SuggestionsList";

/** The typed text still names the picked street, postcode and town (house number may change). Street names share the place-name normalisation. */
const keepsSelectedStreet = (street: StreetSummary, typed: ReturnType<typeof parseAddressInput>) =>
  typed.zipCode === street.zipCode
  && normalizeTown(typed.city) === normalizeTown(street.city)
  && normalizeTown(typed.streetName) === normalizeTown(street.streetName);

interface StreetLookupProps {
  value: string;
  zipCode?: string;
  onChange: (street: string, zipCode?: string, city?: string) => void;
  /** The form found a problem with the address (not the lookup itself). */
  invalid?: boolean;
  /** Id of the help or error text under the field. */
  describedBy?: string;
}

export const StreetLookup = ({ value, zipCode, onChange, invalid = false, describedBy }: StreetLookupProps) => {
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

  // A highlighted row belongs to the list it was chosen in; a new list starts unselected.
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

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
  }, [zipCode, selectedStreet, onChange]);

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
    const { streetName, houseNumber, addition } = parsed;
    setSearchTerm(value);

    if (!selectedStreet || !keepsSelectedStreet(selectedStreet, parsed)) {
      // Free text or a different address typed over the pick: postcode, town
      // and municipality must not survive from the picked address.
      setSelectedStreet(null);
      onChange(value, undefined, undefined);
      setShowSuggestions(streetName.length >= 2);
    } else {
      // Same street, postcode and town: any house number edit must reach the invoice.
      const fullHouseNumber = houseNumber + (addition || '');
      const street = fullHouseNumber ? `${selectedStreet.streetName} ${fullHouseNumber}` : selectedStreet.streetName;
      onChange(`${street}, ${selectedStreet.zipCode} ${selectedStreet.city}`, selectedStreet.zipCode, selectedStreet.city);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    setSelectedStreet(suggestion);
    const { houseNumber, addition } = parseAddressInput(searchTerm);
    const fullHouseNumber = houseNumber + (addition || '');
    
    // A suggestion for one building carries its own number; it wins over the typed one.
    let fullAddress = suggestion.streetName;
    if (suggestion.houseNumbers && suggestion.houseNumbers.length === 1) {
      const suggestedHouseNumber = suggestion.houseNumbers[0];
      fullAddress += ` ${suggestedHouseNumber.number}${suggestedHouseNumber.addition || ''}`;
    } else if (fullHouseNumber) {
      fullAddress += ` ${fullHouseNumber}`;
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
    // Before the early return: the loading and "no address found" states have no suggestions but are open.
    if (e.key === 'Escape' && showSuggestions) {
      e.preventDefault();
      setShowSuggestions(false);
      return;
    }
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
    } else if (e.key === 'Enter' && suggestions[selectedIndex]) {
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
        placeholder="Strasse und Hausnummer"
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClear={clearSelection}
        inputRef={setInputRef}
        invalid={invalid}
        aria-describedby={describedBy}
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
