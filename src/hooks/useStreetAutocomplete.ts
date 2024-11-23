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
          limit: 10 // Limit to 10 results
        }
      });

      if (error) throw error;

      // Transform and sort the API response
      if (data?.QueryAutoComplete4Result?.AutoCompleteResult) {
        const results = data.QueryAutoComplete4Result.AutoCompleteResult
          .map((item: any) => ({
            STRID: item.STRID,
            streetName: item.StreetName || '',
            zipCode: item.ZipCode,
            city: item.TownName,
            houseNumbers: item.HouseNo ? [{
              number: item.HouseNo,
              addition: item.HouseNoAddition
            }] : undefined
          }))
          .sort((a: StreetSummary, b: StreetSummary) => {
            // Prioritize exact matches
            const exactMatchA = a.streetName.toLowerCase() === searchTerm.toLowerCase();
            const exactMatchB = b.streetName.toLowerCase() === searchTerm.toLowerCase();
            if (exactMatchA && !exactMatchB) return -1;
            if (!exactMatchA && exactMatchB) return 1;
            
            // Then sort by string similarity
            return b.streetName.length - a.streetName.length;
          })
          .slice(0, 10); // Ensure we never return more than 10 results

        return results;
      }
      
      return [];
    },
    enabled: searchTerm.length > 0
  });

  return { suggestions, isLoading, error };
};