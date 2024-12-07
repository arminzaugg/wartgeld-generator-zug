import { vi } from 'vitest';
import { mockSupabaseResponses } from '../test-utils';

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