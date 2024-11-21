import { cn } from "@/lib/utils";
import type { StreetSummary, HouseNumber } from "@/types/address";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HouseNumbersListProps {
  show: boolean;
  street: StreetSummary | null;
  selectedIndex: number;
  houseNumberInput: string;
  onSelect: (houseNumber: HouseNumber) => void;
}

export const HouseNumbersList = ({
  show,
  street,
  selectedIndex,
  houseNumberInput,
  onSelect
}: HouseNumbersListProps) => {
  if (!show || !street?.houseNumbers) return null;

  const filteredHouseNumbers = street.houseNumbers.filter(hn => {
    const fullNumber = `${hn.number}${hn.addition || ''}`;
    return fullNumber.toLowerCase().startsWith(houseNumberInput.toLowerCase());
  });

  return (
    <div 
      className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg animate-in fade-in slide-in-from-top-2"
      role="listbox"
      id="house-numbers-list"
    >
      <ScrollArea className="max-h-60">
        <div className="py-1 grid grid-cols-3 gap-1">
          {filteredHouseNumbers.map((houseNumber, index) => (
            <div
              key={`${houseNumber.number}-${houseNumber.addition || ''}-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 text-center transition-colors",
                index === selectedIndex && "bg-gray-100"
              )}
              onClick={() => onSelect(houseNumber)}
              id={`house-number-${index}`}
            >
              {houseNumber.number}{houseNumber.addition || ''}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};