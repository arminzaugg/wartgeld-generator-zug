import { useState, useEffect } from 'react';
import type { StreetSummary } from '@/types/address';
import { addressConfig } from '@/config/addressConfig';
import { apiConfig } from '@/config/apiConfig';

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

      const requestBody = {
        streetName: searchTerm,
        zipCode,
        limit: 10
      };

      console.log('Street API Request:', {
        url: apiConfig.baseUrl,
        body: requestBody,
        timestamp: new Date().toISOString()
      });

      try {
        const response = await fetch(apiConfig.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${apiConfig.username}:${apiConfig.password}`)
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Street API Response Status:', {
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString()
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Street API Response Data:', {
          resultsCount: data.streets?.length || 0,
          timestamp: new Date().toISOString()
        });

        const streets = data.streets || [];

        const filteredStreets = addressConfig.streetFilter.enabled
          ? streets.filter(street => 
              street.zipCode.startsWith(addressConfig.streetFilter.zipPrefix)
            )
          : streets;

        setSuggestions(filteredStreets);
      } catch (error) {
        console.error('Street API Error:', {
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
  }, [searchTerm, zipCode]);

  return {
    suggestions,
    isLoading,
    error
  };
};