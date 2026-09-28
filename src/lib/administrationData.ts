import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AdministrationData = Database["public"]["Tables"]["administration_addresses"]["Row"] & {
  plz: string;
};

/** The PLZ has no municipality mapping, i.e. it is not a supported Zug address. */
export class UnknownPlzError extends Error {
  constructor(public readonly plz: string) {
    super(`No municipality found for PLZ ${plz}`);
    this.name = 'UnknownPlzError';
  }
}

export const getAdministrationData = async (plz: string): Promise<AdministrationData> => {
  // First get the municipality and administration PLZ from plz_mappings
  const { data: plzMapping, error: plzError } = await supabase
    .from('plz_mappings')
    .select('gemeinde, administration_plz')
    .eq('address_plz', plz)
    .maybeSingle();

  if (plzError) throw plzError;
  if (!plzMapping) throw new UnknownPlzError(plz);

  // Then get the administration data using the municipality
  const { data: adminData, error: adminError } = await supabase
    .from('administration_addresses')
    .select('*')
    .eq('municipality', plzMapping.gemeinde)
    .maybeSingle();

  if (adminError) throw adminError;
  if (!adminData) throw new Error(`No administration data found for municipality ${plzMapping.gemeinde}`);

  return {
    ...adminData,
    plz: plzMapping.administration_plz // Include the administration PLZ in the returned data
  };
};
