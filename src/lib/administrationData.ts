import { supabase } from "@/integrations/supabase/client";

export const getAdministrationData = async (plz: string) => {
  // First get the municipality from plz_mappings
  const { data: plzMapping, error: plzError } = await supabase
    .from('plz_mappings')
    .select('gemeinde')
    .eq('address_plz', plz)
    .maybeSingle();

  if (plzError) throw plzError;
  if (!plzMapping) throw new Error(`No municipality found for PLZ ${plz}`);

  // Then get the administration data using the municipality
  const { data: adminData, error: adminError } = await supabase
    .from('administration_addresses')
    .select('*')
    .eq('municipality', plzMapping.gemeinde)
    .maybeSingle();

  if (adminError) throw adminError;
  if (!adminData) throw new Error(`No administration data found for municipality ${plzMapping.gemeinde}`);

  return adminData;
};