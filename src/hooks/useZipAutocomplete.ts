import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useZipAutocomplete = (searchTerm: string) => {
  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['zipSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const { data, error } = await supabase.functions.invoke('address-lookup', {
        body: { 
          type: 'zip', 
          searchTerm,
          limit: 10
        }
      });

      if (error) throw error;
      return data?.QueryAutoComplete4Result?.AutoCompleteResult || [];
    },
    enabled: searchTerm.length > 0,
    staleTime: 0, // Mark data as immediately stale
    cacheTime: 0, // Don't cache at all
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  return { suggestions, isLoading, error };
};