export interface FormValues {
  vorname: string;
  nachname: string;
  address: string;
  plz: string;
  ort: string;
  geburtsdatum: string;
  gemeinde: string;
  betreuungGeburt: boolean;
  betreuungWochenbett: boolean;
}

export const createFormValues = (overrides?: Partial<FormValues>): FormValues => ({
  vorname: 'Max',
  nachname: 'Mustermann',
  address: 'Teststrasse 1',
  plz: '6300',
  ort: 'Zug',
  geburtsdatum: '2024-01-01',
  gemeinde: 'Zug',
  betreuungGeburt: false,
  betreuungWochenbett: false,
  ...overrides,
});