import { supabase } from '@/integrations/supabase/client';
import { IAdministrationRepository } from './interfaces/IAdministrationRepository';

export class SupabaseAdministrationRepository implements IAdministrationRepository {
  async getAdministrationData(municipality: string) {
    const { data, error } = await supabase
      .from('administration_addresses')
      .select('title, name, address, city')
      .eq('municipality', municipality)
      .single();

    if (error) throw error;
    return data;
  }
}