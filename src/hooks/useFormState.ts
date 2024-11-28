import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type FormData = Database['public']['Tables']['form_data']['Row'];

const FORM_QUERY_KEY = 'form-data';

export const useFormState = () => {
  const queryClient = useQueryClient();

  // Fetch form data
  const { data: formData, isLoading } = useQuery({
    queryKey: [FORM_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_data')
        .select('*')
        .single();

      if (error) throw error;
      return data as FormData;
    },
    initialData: {
      id: '',
      vorname: '',
      nachname: '',
      address: '',
      plz: '',
      ort: '',
      geburtsdatum: '',
      gemeinde: '',
      betreuunggeburt: false,
      betreuungwochenbett: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  });

  // Update form data
  const { mutate: updateFormData } = useMutation({
    mutationFn: async (newData: Partial<FormData>) => {
      const { data, error } = await supabase
        .from('form_data')
        .upsert({ ...formData, ...newData })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([FORM_QUERY_KEY], data);
    },
  });

  // Clear form data
  const { mutate: clearFormData } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('form_data')
        .delete()
        .neq('id', '0'); // Delete all records

      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.setQueryData([FORM_QUERY_KEY], {
        id: '',
        vorname: '',
        nachname: '',
        address: '',
        plz: '',
        ort: '',
        geburtsdatum: '',
        gemeinde: '',
        betreuunggeburt: false,
        betreuungwochenbett: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    },
  });

  return {
    formData,
    isLoading,
    updateFormData,
    clearFormData,
  };
};