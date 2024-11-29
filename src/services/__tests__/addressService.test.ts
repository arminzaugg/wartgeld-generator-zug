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
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('addressService', () => {
  describe('lookupStreet', () => {
    it('should transform API response correctly', async () => {
      const mockApiResponse = {
        data: {
          QueryAutoComplete4Result: {
            AutoCompleteResult: [
              {
                STRID: '123',
                StreetName: 'Test Street',
                ZipCode: '1234',
                TownName: 'Test City',
                HouseNo: '1',
                HouseNoAddition: 'A'
              }
            ]
          }
        }
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockApiResponse);

      const result = await addressService.lookupStreet('Test');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        STRID: '123',
        streetName: 'Test Street',
        zipCode: '1234',
        city: 'Test City',
        houseNumbers: [{ number: '1', addition: 'A' }]
      });
    });

    it('should return empty array when no results', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { QueryAutoComplete4Result: { AutoCompleteResult: [] } }
      });

      const result = await addressService.lookupStreet('NonExistent');

      expect(result).toEqual([]);
    });
  });

  describe('getPlzMapping', () => {
    it('should return PLZ mapping data', async () => {
      const mockMapping = { gemeinde: 'Test Gemeinde' };
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockMapping, error: null })
      }));

      const result = await addressService.getPlzMapping('1234');

      expect(result).toEqual(mockMapping);
    });
  });
});