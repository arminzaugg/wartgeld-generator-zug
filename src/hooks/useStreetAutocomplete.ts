import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StreetSummary } from "@/types/address";

export const useStreetAutocomplete = (searchTerm: string, zipCode?: string) => {
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['streetSearch', searchTerm, zipCode],
    queryFn: async (): Promise<StreetSummary[]> => {
      if (!searchTerm) return [];
      
      const { data, error } = await supabase.functions.invoke('address-lookup', {
        body: { 
          type: 'street', 
          searchTerm, 
          zipCode,
          limit: 10
        }
      });

      if (error) throw error;

      if (data?.QueryAutoComplete4Result?.AutoCompleteResult) {
        return data.QueryAutoComplete4Result.AutoCompleteResult
          .map((item: any) => ({
            STRID: item.STRID,
            streetName: item.StreetName || '',
            zipCode: item.ZipCode,
            city: item.TownName,
            houseNumbers: item.HouseNo ? [{
              number: item.HouseNo,
              addition: item.HouseNoAddition
            }] : undefined
          }));
      }
      
      return [];
    },
    enabled: searchTerm.length >= 2,
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 0 // Disable garbage collection (formerly cacheTime)
  });

  return { suggestions, isLoading, error };
};