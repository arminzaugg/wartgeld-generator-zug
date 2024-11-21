import { useState, useEffect } from 'react';
import type { ZipSummary } from '@/types/address';
import { supabase } from "@/integrations/supabase/client";

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
        const { data, error } = await supabase.functions.invoke('address-lookup', {
          body: {
            searchType: 'zip',
            searchTerm
          }
        });

        if (error) throw error;

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