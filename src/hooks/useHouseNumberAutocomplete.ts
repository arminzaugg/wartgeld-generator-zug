import { useState, useEffect } from 'react';
import { mockAddressApi } from '@/lib/mockAddressApi';
import type { HouseNumberSummary } from '@/types/address';

export interface HouseNumberAutocompleteResult {
  suggestions: HouseNumberSummary[];
  isLoading: boolean;
  error: Error | null;
}

export const useHouseNumberAutocomplete = (
  streetId: number,
  searchTerm: string,
  zipCode?: string
): HouseNumberAutocompleteResult => {
  const [suggestions, setSuggestions] = useState<HouseNumberSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!streetId || !searchTerm || searchTerm.length < 1) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await mockAddressApi.searchHouseNumbers({
          streetId,
          houseNumber: searchTerm,
          zipCode,
          limit: 10
        });
        setSuggestions(results.houseNumbers || []);
      } catch (error) {
        console.error('Error fetching house number suggestions:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch suggestions'));
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [streetId, searchTerm, zipCode]);

  return {
    suggestions,
    isLoading,
    error
  };
};