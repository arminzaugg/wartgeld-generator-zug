import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DateAndMunicipalityFieldsProps {
  values: {
    geburtsdatum: string;
    gemeinde: string;
  };
  onChange: (field: string, value: string) => void;
}

export const DateAndMunicipalityFields = ({ values, onChange }: DateAndMunicipalityFieldsProps) => {
  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plz_mappings')
        .select('gemeinde')
        .order('gemeinde');
      
      if (error) throw error;
      
      const uniqueMunicipalities = [...new Set(data.map(item => item.gemeinde))];
      return uniqueMunicipalities;
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="geburtsdatum">Datum der Geburt</Label>
        <Input
          id="geburtsdatum"
          type="date"
          value={values.geburtsdatum}
          onChange={(e) => onChange("geburtsdatum", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gemeinde">Wahl der Gemeinde</Label>
        <Select value={values.gemeinde} onValueChange={(value) => onChange("gemeinde", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Wählen Sie eine Gemeinde" />
          </SelectTrigger>
          <SelectContent>
            {municipalities.map((municipality) => (
              <SelectItem key={municipality} value={municipality}>
                {municipality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};