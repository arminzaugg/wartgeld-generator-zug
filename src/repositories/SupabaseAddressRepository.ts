import { supabase } from '@/integrations/supabase/client';
import { IAddressRepository } from './interfaces/IAddressRepository';
import { StreetSummary } from '@/types/address';
import { parseAddressInput } from '@/utils/addressParser';

export class SupabaseAddressRepository implements IAddressRepository {
  async lookupStreet(query: string): Promise<StreetSummary[]> {
    const { streetName } = parseAddressInput(query);
    
    const { data, error } = await supabase.functions.invoke('address-lookup', {
      body: {
        request: {
          StreetName: streetName,
        }
      }
    });

    if (error) throw error;
    return this.transformApiResponse(data);
  }

  async getPlzMapping(plz: string): Promise<{ gemeinde: string } | null> {
    const { data, error } = await supabase
      .from('plz_mappings')
      .select('gemeinde')
      .eq('address_plz', plz)
      .single();

    if (error) throw error;
    return data;
  }

  private transformApiResponse(data: any): StreetSummary[] {
    return data.QueryAutoComplete4Result.AutoCompleteResult.map((result: any) => ({
      streetName: result.StreetName,
      zipCode: result.ZipCode,
      city: result.TownName,
      houseNumbers: result.HouseNumbers || []
    }));
  }
}
