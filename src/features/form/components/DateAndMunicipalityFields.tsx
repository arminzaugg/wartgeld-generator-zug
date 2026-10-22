import { Input } from "@/components/ui/input";
import { fieldClassName } from "@/components/ui/field-styles";
import { Label } from "@/components/ui/label";
import { MUNICIPALITIES } from "@/data/municipalities";
import { proposeMunicipality } from "@/lib/municipality";
import { cn } from "@/lib/utils";

interface DateAndMunicipalityFieldsProps {
  values: {
    geburtsdatum: string;
    plz: string;
    ort: string;
    gemeindeBfs: string;
  };
  errors?: {
    [key: string]: string;
  };
  onChange: (field: string, value: string) => void;
}

const selectClassName = cn("flex h-12", fieldClassName);

export const DateAndMunicipalityFields = ({ values, errors = {}, onChange }: DateAndMunicipalityFieldsProps) => {
  const hasAddress = /^\d{4}$/.test(values.plz);
  const proposal = hasAddress ? proposeMunicipality(values.plz, values.ort) : null;
  const candidateBfs = new Set(proposal?.candidates.map(m => m.bfs));
  const others = MUNICIPALITIES.filter(m => !candidateBfs.has(m.bfs));
  const outsideZug = proposal !== null && !proposal.known;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="geburtsdatum">Datum der Geburt</Label>
        <Input
          id="geburtsdatum"
          type="date"
          value={values.geburtsdatum}
          onChange={(e) => onChange("geburtsdatum", e.target.value)}
          aria-invalid={Boolean(errors.geburtsdatum)}
        />
        {errors.geburtsdatum && (
          <p className="text-sm text-red-500">{errors.geburtsdatum}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gemeindeBfs">Zuständige Gemeinde</Label>
        <select
          id="gemeindeBfs"
          value={values.gemeindeBfs}
          disabled={!proposal?.known}
          onChange={(e) => onChange("gemeindeBfs", e.target.value)}
          aria-invalid={Boolean(errors.gemeindeBfs) || outsideZug}
          className={selectClassName}
        >
          <option value="">{proposal?.known ? "Bitte wählen" : "Zuerst Adresse auswählen"}</option>
          {proposal?.known && (
            <>
              <optgroup label="Gemeinden dieser Ortschaft">
                {proposal.candidates.map(m => (
                  <option key={m.bfs} value={String(m.bfs)}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label="Weitere Zuger Gemeinden">
                {others.map(m => (
                  <option key={m.bfs} value={String(m.bfs)}>{m.name}</option>
                ))}
              </optgroup>
            </>
          )}
        </select>
        {outsideZug && (
          <p className="text-sm text-red-500">Diese PLZ liegt nicht im Kanton Zug</p>
        )}
        {proposal?.sharedHint && (
          <p className="text-sm text-muted-foreground">
            Diese Ortschaft gehört zu mehreren Gemeinden. Bitte wählen Sie die zuständige Gemeinde.
          </p>
        )}
        {proposal?.outsideHint && (
          <p className="text-sm text-muted-foreground">
            Diese Ortschaft liegt teilweise ausserhalb des Kantons Zug. Bitte prüfen Sie, ob die Adresse zu einer Zuger Gemeinde gehört.
          </p>
        )}
        {errors.gemeindeBfs && !outsideZug && (
          <p className="text-sm text-red-500">{errors.gemeindeBfs}</p>
        )}
      </div>
    </div>
  );
};
