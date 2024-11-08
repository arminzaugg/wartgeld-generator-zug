import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchAddresses } from '@/lib/addressService';
import { useToast } from "@/components/ui/use-toast";

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
            description: "Failed to search addresses",
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
    <div className="relative">
      <Input
        type="text"
        placeholder="Search address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
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