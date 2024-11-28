import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useZipAutocomplete } from "@/hooks/useZipAutocomplete";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZipLookupProps {
  onSelect: (zipCode: string, city: string) => void;
}

export const ZipLookup = ({ onSelect }: ZipLookupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { suggestions = [], isLoading } = useZipAutocomplete(
    searchTerm.length >= 2 ? searchTerm : ""
  );

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
    setSelectedIndex(-1);
  };

  const handleSelect = (zip: string, city: string) => {
    onSelect(zip, city);
    setSearchTerm("");
    setShowSuggestions(false);
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
      const selected = suggestions[selectedIndex];
      handleSelect(selected.zip, selected.city18);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="PLZ oder Ort eingeben..."
        className={cn(
          "w-full transition-colors",
          isLoading && "pr-12"
        )}
      />

      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <ScrollArea className="max-h-60">
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.zip}-${suggestion.city18}`}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
                    index === selectedIndex && "bg-gray-100"
                  )}
                  onClick={() => handleSelect(suggestion.zip, suggestion.city18)}
                >
                  <span className="font-medium">{suggestion.zip}</span>
                  <span className="ml-2 text-gray-600">{suggestion.city18}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};