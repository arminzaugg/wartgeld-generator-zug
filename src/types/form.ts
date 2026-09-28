export interface FormValues {
  vorname: string;
  nachname: string;
  address: string;
  plz: string;
  ort: string;
  geburtsdatum: string;
  betreuungGeburt: boolean;
  betreuungWochenbett: boolean;
}

export const emptyFormValues: FormValues = {
  vorname: "",
  nachname: "",
  address: "",
  plz: "",
  ort: "",
  geburtsdatum: "",
  betreuungGeburt: false,
  betreuungWochenbett: false,
};
