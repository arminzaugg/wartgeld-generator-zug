import { useState, useEffect } from 'react';
import { mockAddressApi } from '@/lib/mockAddressApi';

export interface ZipSuggestion {
  zip: string;
  city18: string;
}

export const useZipAutocomplete = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<ZipSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!search) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await mockAddressApi.searchZip(search);
        setSuggestions(results?.zips || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return {
    search,
    setSearch,
    suggestions: suggestions || [],
    isLoading,
  };
};