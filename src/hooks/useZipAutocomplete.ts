import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/api/addressService";

export const useZipAutocomplete = (searchTerm: string) => {
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['zipSearch', searchTerm],
    queryFn: () => addressService.lookupZip(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return { suggestions, isLoading, error };
};