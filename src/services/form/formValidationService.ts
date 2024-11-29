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
      default:
        return '';
    }
  },

  validateForm(values: {
    vorname: string;
    nachname: string;
    address: string;
    plz: string;
    ort: string;
    geburtsdatum: string;
    betreuungGeburt: boolean;
    betreuungWochenbett: boolean;
  }): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!values.vorname || values.vorname.length < 2) {
      errors.vorname = 'Mindestens 2 Zeichen erforderlich';
    }
    if (!values.nachname || values.nachname.length < 2) {
      errors.nachname = 'Mindestens 2 Zeichen erforderlich';
    }
    if (!values.address) {
      errors.address = 'Adresse ist erforderlich';
    }
    if (!values.geburtsdatum) {
      errors.geburtsdatum = 'Datum ist erforderlich';
    }

    return errors;
  }
};