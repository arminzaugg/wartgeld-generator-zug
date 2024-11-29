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

  it('looks up street addresses', async () => {
    const mockResponse = {
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
    };

    (supabase.functions.invoke as any).mockResolvedValue({ data: mockResponse, error: null });

    const result = await addressService.lookupStreet('Test');
    
    expect(result).toHaveLength(1);
    expect(result[0].streetName).toBe('Test Street');
  });

  it('gets PLZ mapping', async () => {
    const result = await addressService.getPlzMapping('1234');
    
    expect(result).toEqual({ gemeinde: 'Test Gemeinde' });
    expect(supabase.from).toHaveBeenCalledWith('plz_mappings');
  });
});