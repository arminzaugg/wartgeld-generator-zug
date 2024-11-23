import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StreetSummary } from "@/types/address";
import { parseAddressInput } from "@/utils/addressParser";

export const useStreetAutocomplete = (searchTerm: string, zipCode?: string) => {
  const { streetName, houseNumber } = parseAddressInput(searchTerm);
  
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['streetSearch', streetName, zipCode],
    queryFn: async (): Promise<StreetSummary[]> => {
      if (!streetName) return [];
      
      const { data, error } = await supabase.functions.invoke('address-lookup', {
        body: { 
          type: 'street', 
          searchTerm: streetName,
          houseNumber,
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
          }))
          .filter(street => {
            // If a house number is provided, filter streets that have matching house numbers
            if (houseNumber && street.houseNumbers) {
              return street.houseNumbers.some(hn => 
                hn.number.toLowerCase().startsWith(houseNumber.toLowerCase())
              );
            }
            return true;
          });
      }
      
      return [];
    },
    enabled: streetName.length >= 2,
    staleTime: 0,
    gcTime: 0
  });

  return { suggestions, isLoading, error };
};