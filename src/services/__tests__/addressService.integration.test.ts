import { describe, it, expect, vi } from 'vitest';
import { addressService } from '../api/addressService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { gemeinde: 'Test Gemeinde' },
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('addressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PLZ mapping', () => {
    it('gets PLZ mapping', async () => {
      const result = await addressService.getPlzMapping('1234');
      expect(result).toEqual({ gemeinde: 'Test Gemeinde' });
      expect(supabase.from).toHaveBeenCalledWith('plz_mappings');
    });
  });
});