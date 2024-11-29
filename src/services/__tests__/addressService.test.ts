import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { getPlzMappings } from '@/services/addressService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [
            { 
              administration_plz: '6300',
              address_plz: '6300',
              gemeinde: 'Zug'
            }
          ],
          error: null
        }))
      }))
    }))
  }
}));

describe('addressService', () => {
  it('fetches PLZ mappings successfully', async () => {
    const result = await getPlzMappings('6300');
    
    expect(result).toEqual([
      { 
        administration_plz: '6300',
        address_plz: '6300',
        gemeinde: 'Zug'
      }
    ]);
    
    expect(supabase.from).toHaveBeenCalledWith('plz_mappings');
  });
});