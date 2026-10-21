export interface FormValues {
  vorname: string;
  nachname: string;
  address: string;
  plz: string;
  ort: string;
  geburtsdatum: string;
  /** BFS number of the municipality the invoice is addressed to; '' until chosen. */
  gemeindeBfs: string;
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
  gemeindeBfs: "",
  betreuungGeburt: false,
  betreuungWochenbett: false,
};
