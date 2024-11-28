interface Administration {
  title: string;
  name: string;
  address: string;
  city: string;
}

export const municipalities = [
  "Zug",
  "Cham",
  "Hünenberg",
  "Risch",
  "Steinhausen",
  "Baar",
  "Neuheim",
  "Menzingen",
  "Unterägeri",
  "Oberägeri",
  "Walchwil"
] as const;

export const administrationData: Record<string, Administration> = {
  "Zug": {
    title: "Stadtverwaltung Zug",
    name: "Fachstelle Alter und Gesundheit Stadt Zug",
    address: "Gubelstrasse 22 Postfach",
    city: "6301 Zug"
  },
  "Cham": {
    title: "Einwohnergemeinde Cham",
    name: "Sozialdienst",
    address: "Mandelhof",
    city: "6330 Cham"
  },
  "Hünenberg": {
    title: "Gemeindeverwaltung",
    name: "",
    address: "Postfach 261",
    city: "6331 Hünenberg"
  },
  "Risch": {
    title: "Gemeinde Risch",
    name: "Abteilung Soziales/Gesundheit",
    address: "Zentrum Dorfmatt",
    city: "6343 Rotkreuz"
  },
  "Steinhausen": {
    title: "Sozialdienst Steinhausen",
    name: "Rathaus",
    address: "",
    city: "6312 Steinhausen"
  },
  "Baar": {
    title: "Einwohnergemeinde Baar",
    name: "Fachstelle Gesundheit/Alter",
    address: "Rathausgasse 6 Postfach",
    city: "6341 Baar"
  },
  "Neuheim": {
    title: "Gemeindeverwaltung",
    name: "",
    address: "Postfach 161",
    city: "6345 Neuheim"
  },
  "Menzingen": {
    title: "Gemeindeverwaltung",
    name: "Soziales und Gesundheit",
    address: "Postfach",
    city: "6313 Menzingen"
  },
  "Unterägeri": {
    title: "Einwohnergemeinde Unterägeri",
    name: "Abteilung Soziales/Gesundheit",
    address: "Postfach 79",
    city: "6314 Unterägeri"
  },
  "Oberägeri": {
    title: "Sozialdienst Oberägeri",
    name: "",
    address: "Alosenstrasse 2",
    city: "6315 Oberägeri"
  },
  "Walchwil": {
    title: "Gemeindekanzlei Walchwil",
    name: "",
    address: "Postfach 93",
    city: "6318 Walchwil"
  }
};