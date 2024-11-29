import { describe, it, expect, vi } from 'vitest';
import { addressService } from '../api/addressService';
import { supabase } from '@/integrations/supabase/client';
import { createAutocompleteRequest, createApiResponse } from '@/lib/__tests__/factories/apiFactory';
import { createStreetSummary } from '@/lib/__tests__/factories/addressFactory';

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

  describe('street lookup', () => {
    it('looks up street addresses', async () => {
      const mockApiResponse = createApiResponse();
      const expectedStreet = createStreetSummary();
      
      (supabase.functions.invoke as any).mockResolvedValue(mockApiResponse);

      const result = await addressService.lookupStreet('Test');
      expect(result[0].streetName).toBe(expectedStreet.streetName);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'address-lookup',
        expect.any(Object)
      );
    });

    it('handles empty results', async () => {
      const mockResponse = createApiResponse({
        QueryAutoComplete4Result: {
          AutoCompleteResult: []
        }
      });

      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await addressService.lookupStreet('NonExistent');
      expect(result).toHaveLength(0);
    });

    it('handles errors', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: new Error('API Error')
      });

      await expect(addressService.lookupStreet('Test')).rejects.toThrow('API Error');
    });
  });

  describe('PLZ mapping', () => {
    it('gets PLZ mapping', async () => {
      const result = await addressService.getPlzMapping('1234');
      
      expect(result).toEqual({ gemeinde: 'Test Gemeinde' });
      expect(supabase.from).toHaveBeenCalledWith('plz_mappings');
    });

    it('handles non-existent PLZ', async () => {
      (supabase.from as any).mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: null,
              error: null
            })
          })
        })
      }));

      const result = await addressService.getPlzMapping('9999');
      expect(result).toBeNull();
    });
  });
});