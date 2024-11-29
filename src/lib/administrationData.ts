import { supabase } from "@/integrations/supabase/client";

export const getAdministrationData = async (municipality: string) => {
  const { data, error } = await supabase
    .from('administration_addresses')
    .select('*')
    .eq('municipality', municipality)
    .single();

  if (error) throw error;
  return data;
};