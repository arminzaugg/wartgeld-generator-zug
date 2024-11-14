import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useZipAutocomplete } from "@/hooks/useZipAutocomplete";
import type { ZipSuggestion } from "@/hooks/useZipAutocomplete";

interface ZipCityLookupProps {
  plz: string;
  ort: string;
  onChange: (plz: string, ort: string) => void;
}

export const ZipCityLookup = ({ plz, ort, onChange }: ZipCityLookupProps) => {
  const [open, setOpen] = useState(false);
  const { search, setSearch, suggestions = [], isLoading } = useZipAutocomplete();

  // Safe handling of window messaging
  const handleMessage = (event: MessageEvent) => {
    // Only accept messages from the same origin
    if (event.origin !== window.location.origin) {
      console.warn('Received message from unexpected origin:', event.origin);
      return;
    }
    
    try {
      const data = event.data;
      console.log('Received message:', data);
      // Handle the message data here if needed
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  // Add message listener when component mounts
  useState(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });

  const handleZipSelect = (zip: string, city: string) => {
    console.log('Selected:', { zip, city });
    onChange(zip, city);
    setOpen(false);
  };

  const handleSearchChange = (value: string) => {
    console.log('Search changed:', value);
    setSearch(value);
  };

  // Ensure suggestions is always a valid array
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div className="space-y-2">
      <Label htmlFor="plz">Postleitzahl & Ort</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {plz ? `${plz} ${ort}` : "PLZ oder Ort eingeben..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput 
              placeholder="PLZ oder Ort suchen..." 
              value={search}
              onValueChange={handleSearchChange}
            />
            <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
            <CommandGroup>
              {safeSuggestions.map((item: ZipSuggestion) => (
                <CommandItem
                  key={item.zip}
                  value={`${item.zip} ${item.city18}`}
                  onSelect={() => handleZipSelect(item.zip, item.city18)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      plz === item.zip ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.zip} {item.city18}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};