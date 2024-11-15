import { useState, useEffect } from 'react';
import { mockAddressApi } from '@/lib/mockAddressApi';
import type { ZipSummary } from '@/types/address';

export interface ZipAutocompleteResult {
  suggestions: ZipSummary[];
  isLoading: boolean;
  error: Error | null;
}

export const useZipAutocomplete = (searchTerm: string): ZipAutocompleteResult => {
  const [suggestions, setSuggestions] = useState<ZipSummary[]>([]);
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
        console.log('Fetching suggestions for:', searchTerm);
        const results = await mockAddressApi.searchZip({
          zipCity: searchTerm,
          type: 'DOMICILE',
          limit: 10
        });
        console.log('Received results:', results);
        setSuggestions(results.zips || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch suggestions'));
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return {
    suggestions,
    isLoading,
    error
  };
};