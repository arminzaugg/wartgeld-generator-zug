import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStreetAutocomplete } from "@/hooks/useStreetAutocomplete";
import type { StreetSummary, HouseNumber } from "@/types/address";
import { Loader2, MapPin, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SuggestionsList } from "./StreetLookup/SuggestionsList";
import { parseAddressInput } from "@/utils/addressParser";

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
  const [selectedIndex, setSelectedIndex] = useState(-1);
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
      if (!inputRef?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputRef]);

  const handleInputChange = (value: string) => {
    const { streetName, houseNumber } = parseAddressInput(value);
    setSearchTerm(value);
    
    if (!selectedStreet) {
      onChange(value, undefined, undefined);
      setShowSuggestions(streetName.length >= 2);
    } else {
      const matchingHouseNumber = selectedStreet.houseNumbers?.find(hn => 
        `${hn.number}${hn.addition || ''}`.toLowerCase() === houseNumber.toLowerCase()
      );

      if (matchingHouseNumber) {
        const fullAddress = `${selectedStreet.streetName} ${houseNumber}`;
        onChange(fullAddress, selectedStreet.zipCode, selectedStreet.city);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: StreetSummary) => {
    setSelectedStreet(suggestion);
    const { houseNumber } = parseAddressInput(searchTerm);
    const newValue = houseNumber ? `${suggestion.streetName} ${houseNumber}` : suggestion.streetName;
    setSearchTerm(newValue);
    setShowSuggestions(false);
    onChange(newValue, suggestion.zipCode, suggestion.city);
    
    if (inputRef) {
      inputRef.focus();
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
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Strasse und Hausnummer eingeben..."
          className={cn(
            "w-full pl-9 pr-8 transition-colors",
            isLoading && "pr-12",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          autoComplete="off"
          ref={setInputRef}
        />
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