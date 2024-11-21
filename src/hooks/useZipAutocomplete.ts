import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ZipSuggestion = {
  zip: string;
  city18: string;
};

export const useZipAutocomplete = (searchTerm: string) => {
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['zipSearch', searchTerm],
    queryFn: async (): Promise<ZipSuggestion[]> => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const searchType = searchTerm.match(/^\d/) ? 'zip' : 'city';
      
      const { data, error } = await supabase.functions.invoke('address-lookup', {
        body: { 
          type: searchType,
          searchTerm
        }
      });

      if (error) throw error;

      // Transform the API response to match our ZipSuggestion type
      if (data?.QueryAutoComplete4Result?.AutoCompleteResult) {
        return data.QueryAutoComplete4Result.AutoCompleteResult.map((item: any) => ({
          zip: item.ZipCode,
          city18: item.TownName
        }));
      }
      
      return [];
    },
    enabled: searchTerm.length >= 2
  });

  return { suggestions, isLoading, error };
};