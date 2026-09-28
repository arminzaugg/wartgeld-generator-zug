import type { FormValues } from '@/types/form';

export const createFormValues = (overrides?: Partial<FormValues>): FormValues => ({
  vorname: 'Max',
  nachname: 'Mustermann',
  address: 'Teststrasse 1, 6300 Zug',
  plz: '6300',
  ort: 'Zug',
  geburtsdatum: '2024-01-01',
  betreuungGeburt: false,
  betreuungWochenbett: false,
  ...overrides,
});
