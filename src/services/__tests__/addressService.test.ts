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

  describe('street lookup', () => {
    it('looks up street addresses', async () => {
      const mockResponse = {
        data: {
          QueryAutoComplete4Result: {
            AutoCompleteResult: [
              {
                STRID: '123',
                StreetName: 'Test Street',
                ZipCode: '1234',
                TownName: 'Test Town'
              }
            ]
          }
        },
        error: null
      };

      (supabase.functions.invoke as any).mockResolvedValue(mockResponse);

      const result = await addressService.lookupStreet('Test');
      
      expect(result).toHaveLength(1);
      expect(result[0].streetName).toBe('Test Street');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('address-lookup', {
        body: expect.any(Object)
      });
    });

    it('handles empty results', async () => {
      const mockResponse = {
        data: {
          QueryAutoComplete4Result: {
            AutoCompleteResult: []
          }
        },
        error: null
      };

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