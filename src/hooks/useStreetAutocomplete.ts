import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/api/addressService";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { StreetSummary } from "@/types/address";

/** Waiting time after the last keystroke, so fast typing sends one lookup instead of one per letter. */
export const TYPING_PAUSE_MS = 250;

export const useStreetAutocomplete = (searchTerm: string, zipCode?: string) => {
  const debouncedTerm = useDebouncedValue(searchTerm, TYPING_PAUSE_MS);
  const settled = debouncedTerm === searchTerm;

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['streetSearch', debouncedTerm, zipCode],
    queryFn: () => addressService.lookupStreet(debouncedTerm, zipCode),
    enabled: debouncedTerm.length > 0
  });

  // Suggestions for an earlier text are never offered while a newer lookup is pending.
  const suggestions: StreetSummary[] = settled ? data : [];
  return { suggestions, isLoading: (!settled && searchTerm.length > 0) || isLoading, error };
};
