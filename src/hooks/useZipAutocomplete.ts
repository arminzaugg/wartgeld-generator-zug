import { useState, useEffect } from 'react';
import { apiConfig } from '@/config/apiConfig';
import type { ZipSummary } from '@/types/address';

export type ZipSuggestion = ZipSummary;

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
        const response = await fetch(apiConfig.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${apiConfig.username}:${apiConfig.password}`)
          },
          body: JSON.stringify({
            zipCity: searchTerm,
            type: 'DOMICILE',
            limit: 10
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSuggestions(data.zips || []);
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