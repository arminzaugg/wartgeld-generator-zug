import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ZipSummary } from "@/types/address";

export const useZipAutocomplete = (searchTerm: string) => {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['zipSearch', searchTerm],
    queryFn: async (): Promise<ZipSummary[]> => {
      if (!searchTerm) return [];
      
      const { data, error } = await supabase.functions.invoke('address-lookup', {
        body: { type: 'zip', searchTerm }
      });

      if (error) throw error;

      // Transform the API response to match our ZipSummary type
      if (data?.QueryAutoComplete4Result?.AutoCompleteResult) {
        return data.QueryAutoComplete4Result.AutoCompleteResult.map((item: any) => ({
          zip: item.ZipCode,
          city18: item.TownName,
          city27: item.TownName,
          city39: item.TownName
        }));
      }
      
      return [];
    },
    enabled: searchTerm.length > 0
  });

  return { suggestions, isLoading };
};