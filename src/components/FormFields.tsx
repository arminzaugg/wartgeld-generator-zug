import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { municipalities } from "@/config/addresses";
import { useZipAutocomplete } from "@/hooks/useZipAutocomplete";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FormFieldsProps {
  values: {
    vorname: string;
    nachname: string;
    address: string;
    plz: string;
    ort: string;
    geburtsdatum: string;
    gemeinde: string;
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
}

export const FormFields = ({ values, onChange }: FormFieldsProps) => {
  const { search, setSearch, suggestions, isLoading } = useZipAutocomplete();
  const [open, setOpen] = useState(false);

  const handleZipSelect = (zip: string, city: string) => {
    onChange("plz", zip);
    onChange("ort", city);
    setOpen(false);
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Angaben</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vorname">Vorname</Label>
            <Input
              id="vorname"
              value={values.vorname}
              onChange={(e) => onChange("vorname", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nachname">Nachname</Label>
            <Input
              id="nachname"
              value={values.nachname}
              onChange={(e) => onChange("nachname", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Strasse</Label>
          <Input
            id="address"
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                  {values.plz ? `${values.plz} ${values.ort}` : "PLZ oder Ort eingeben..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput 
                    placeholder="PLZ oder Ort suchen..." 
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
                  <CommandGroup>
                    {suggestions?.map((item) => (
                      <CommandItem
                        key={item.zip}
                        value={`${item.zip} ${item.city18}`}
                        onSelect={() => handleZipSelect(item.zip, item.city18)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            values.plz === item.zip ? "opacity-100" : "opacity-0"
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="geburtsdatum">Datum der Geburt</Label>
          <Input
            id="geburtsdatum"
            type="date"
            value={values.geburtsdatum}
            onChange={(e) => onChange("geburtsdatum", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemeinde">Wahl der Gemeinde</Label>
          <Select value={values.gemeinde} onValueChange={(value) => onChange("gemeinde", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Wählen Sie eine Gemeinde" />
            </SelectTrigger>
            <SelectContent>
              {municipalities.map((municipality) => (
                <SelectItem key={municipality} value={municipality}>
                  {municipality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Dienstleistungen</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="betreuungGeburt" 
              checked={values.betreuungGeburt}
              onCheckedChange={(checked) => onChange("betreuungGeburt", checked === true)}
            />
            <Label htmlFor="betreuungGeburt">Betreuung der Gebärenden zuhause (CHF 1000)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="betreuungWochenbett" 
              checked={values.betreuungWochenbett}
              onCheckedChange={(checked) => onChange("betreuungWochenbett", checked === true)}
            />
            <Label htmlFor="betreuungWochenbett">Pflege der Wöchnerin zuhause (CHF 400)</Label>
          </div>
        </div>
      </div>
    </>
  );
};