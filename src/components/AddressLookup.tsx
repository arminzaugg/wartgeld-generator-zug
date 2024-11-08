import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchAddresses } from '@/lib/addressService';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AddressLookupProps {
  onSelect: (address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
}

export const AddressLookup = ({ onSelect }: AddressLookupProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length > 2) {
        setIsLoading(true);
        try {
          const addresses = await searchAddresses(query);
          setResults(addresses);
        } catch (error) {
          toast({
            title: "Error",
            description: "Fehler beim Suchen der Adresse",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, toast]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Geben Sie eine Adresse ein..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              key={index}
              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => {
                onSelect(result);
                setQuery('');
                setResults([]);
              }}
            >
              {result.address}, {result.city}, {result.state} {result.zipCode}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};