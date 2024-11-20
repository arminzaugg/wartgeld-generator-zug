import { useState, useEffect } from 'react';
import { mockAddressApi } from '@/lib/mockAddressApi';
import type { StreetSummary } from '@/types/address';
import { addressConfig } from '@/config/addressConfig';

export interface StreetAutocompleteResult {
  suggestions: StreetSummary[];
  isLoading: boolean;
  error: Error | null;
}

export const useStreetAutocomplete = (
  searchTerm: string,
  zipCode?: string
): StreetAutocompleteResult => {
  const [suggestions, setSuggestions] = useState<StreetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await mockAddressApi.searchStreets({
          streetName: searchTerm,
          zipCode,
          limit: 10
        });

        // Apply ZIP code filter if enabled
        const filteredStreets = addressConfig.streetFilter.enabled
          ? results.streets?.filter(street => 
              street.zipCode.startsWith(addressConfig.streetFilter.zipPrefix)
            )
          : results.streets;

        setSuggestions(filteredStreets || []);
      } catch (error) {
        console.error('Error fetching street suggestions:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch suggestions'));
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, zipCode]);

  return {
    suggestions,
    isLoading,
    error
  };
};