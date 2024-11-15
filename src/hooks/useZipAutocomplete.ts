import { useState, useEffect } from 'react';
import { mockAddressApi } from '@/lib/mockAddressApi';

export interface ZipSuggestion {
  zip: string;
  city18: string;
}

export const useZipAutocomplete = (searchTerm: string) => {
  const [suggestions, setSuggestions] = useState<ZipSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching suggestions for:', searchTerm);
        const results = await mockAddressApi.searchZip(searchTerm);
        console.log('Received results:', results);
        setSuggestions(Array.isArray(results.zips) ? results.zips : []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
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
  };
};