import { vi } from 'vitest';

export const mockSupabaseResponses = {
  plzMapping: {
    data: { gemeinde: 'Zug' },
    error: null
  },
  administrationAddress: {
    data: {
      title: 'Test Administration',
      name: 'Test Name',
      address: 'Test Address',
      city: 'Test City'
    },
    error: null
  }
};

export const mockSupabaseClient = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(mockSupabaseResponses.plzMapping)
      }),
      match: vi.fn().mockResolvedValue(mockSupabaseResponses.administrationAddress)
    })
  })
};

export const setupSupabaseMock = () => {
  vi.mock('@/integrations/supabase/client', () => ({
    supabase: mockSupabaseClient
  }));
};