import { useState } from 'react';
import { searchZip } from '../lib/mockAddressApi';
import { ZipSummary } from '../types/address';
import { useQuery } from '@tanstack/react-query';

export const useZipAutocomplete = () => {
  const [search, setSearch] = useState('');

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['zipSearch', search],
    queryFn: () => searchZip(search),
    enabled: search.length > 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    search,
    setSearch,
    suggestions: suggestions?.zips || [],
    isLoading
  };
};