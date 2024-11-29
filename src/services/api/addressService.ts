import { supabase } from "@/integrations/supabase/client";
import type { StreetSummary } from "@/types/address";

export const addressService = {
  async lookupStreet(searchTerm: string, zipCode?: string): Promise<StreetSummary[]> {
    const { data, error } = await supabase.functions.invoke('address-lookup', {
      body: { 
        type: 'street', 
        searchTerm, 
        zipCode,
        limit: 10
      }
    });

    if (error) throw error;

    if (data?.QueryAutoComplete4Result?.AutoCompleteResult) {
      return data.QueryAutoComplete4Result.AutoCompleteResult
        .map((item: any) => ({
          STRID: item.STRID,
          streetName: item.StreetName || '',
          zipCode: item.ZipCode,
          city: item.TownName,
          houseNumbers: item.HouseNo ? [{
            number: item.HouseNo,
            addition: item.HouseNoAddition
          }] : undefined
        }))
        .sort((a: StreetSummary, b: StreetSummary) => {
          const exactMatchA = a.streetName.toLowerCase() === searchTerm.toLowerCase();
          const exactMatchB = b.streetName.toLowerCase() === searchTerm.toLowerCase();
          if (exactMatchA && !exactMatchB) return -1;
          if (!exactMatchA && exactMatchB) return 1;
          return b.streetName.length - a.streetName.length;
        })
        .slice(0, 10);
    }
    
    return [];
  },

  async lookupZip(searchTerm: string): Promise<any[]> {
    const { data, error } = await supabase.functions.invoke('address-lookup', {
      body: { 
        type: 'zip', 
        searchTerm,
        limit: 10
      }
    });

    if (error) throw error;
    return data?.QueryAutoComplete4Result?.AutoCompleteResult || [];
  },

  async getPlzMapping(plz: string) {
    const { data, error } = await supabase
      .from('plz_mappings')
      .select('gemeinde')
      .eq('address_plz', plz)
      .single();
      
    if (error) throw error;
    return data;
  }
};