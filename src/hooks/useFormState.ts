import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type FormData = Database['public']['Tables']['form_data']['Row'];

const FORM_QUERY_KEY = 'form-data';

const initialFormData: FormData = {
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
};

export const useFormState = () => {
  const queryClient = useQueryClient();

  // Fetch form data
  const { data: formData, isLoading } = useQuery({
    queryKey: [FORM_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_data')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return data || initialFormData;
    },
    initialData: initialFormData
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
      if (formData.id) {
        const { error } = await supabase
          .from('form_data')
          .delete()
          .eq('id', formData.id);

        if (error) throw error;
      }
      return initialFormData;
    },
    onSuccess: () => {
      queryClient.setQueryData([FORM_QUERY_KEY], initialFormData);
    },
  });

  return {
    formData,
    isLoading,
    updateFormData,
    clearFormData,
  };
};