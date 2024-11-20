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

      const requestBody = {
        zipCity: searchTerm,
        type: 'DOMICILE',
        limit: 10
      };

      console.log('ZIP API Request:', {
        url: apiConfig.baseUrl,
        body: requestBody,
        timestamp: new Date().toISOString()
      });

      try {
        const response = await fetch(apiConfig.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${apiConfig.username}:${apiConfig.password}`),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          mode: 'cors',
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });

        console.log('ZIP API Response Status:', {
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString()
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('ZIP API Response Data:', {
          resultsCount: data.zips?.length || 0,
          timestamp: new Date().toISOString()
        });

        setSuggestions(data.zips || []);
      } catch (error) {
        console.error('ZIP API Error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
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