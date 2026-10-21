import { getMunicipality, proposeMunicipality } from '@/lib/municipality';
import type { FormValues } from '@/types/form';

const MUNICIPALITY_REQUIRED = 'Bitte wählen Sie die zuständige Gemeinde';

const isKnownMunicipality = (value: string | boolean) =>
  typeof value === 'string' && /^\d+$/.test(value) && getMunicipality(Number(value)) !== undefined;

interface ValidationErrors {
  [key: string]: string;
}

export const formValidationService = {
  validateField(field: string, value: string | boolean): string {
    switch (field) {
      case 'vorname':
      case 'nachname':
        return typeof value === 'string' && value.length >= 2 ? '' : 'Mindestens 2 Zeichen erforderlich';
      case 'geburtsdatum':
        return value ? '' : 'Bitte geben Sie ein Datum ein';
      case 'gemeindeBfs':
        return isKnownMunicipality(value) ? '' : MUNICIPALITY_REQUIRED;
      default:
        return '';
    }
  },

  validateForm(values: FormValues): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!values.vorname || values.vorname.length < 2) {
      errors.vorname = 'Mindestens 2 Zeichen erforderlich';
    }
    if (!values.nachname || values.nachname.length < 2) {
      errors.nachname = 'Mindestens 2 Zeichen erforderlich';
    }
    if (!values.address) {
      errors.address = 'Adresse ist erforderlich';
    } else if (!/^\d{4}$/.test(values.plz)) {
      // The PLZ is only set when an address is picked from the suggestions.
      errors.plz = 'Bitte wählen Sie die Adresse aus der Vorschlagsliste (PLZ fehlt)';
    } else if (!proposeMunicipality(values.plz, values.ort).known) {
      errors.plz = 'Diese PLZ liegt nicht im Kanton Zug';
    } else if (!isKnownMunicipality(values.gemeindeBfs)) {
      errors.gemeindeBfs = MUNICIPALITY_REQUIRED;
    }
    if (!values.geburtsdatum) {
      errors.geburtsdatum = 'Datum ist erforderlich';
    }

    return errors;
  }
};