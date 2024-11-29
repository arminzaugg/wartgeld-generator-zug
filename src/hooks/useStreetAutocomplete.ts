import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/api/addressService";
import type { StreetSummary } from "@/types/address";

export const useStreetAutocomplete = (searchTerm: string, zipCode?: string) => {
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['streetSearch', searchTerm, zipCode],
    queryFn: () => addressService.lookupStreet(searchTerm, zipCode),
    enabled: searchTerm.length > 0
  });

  return { suggestions, isLoading, error };
};