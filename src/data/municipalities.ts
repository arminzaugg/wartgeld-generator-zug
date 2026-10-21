import type { Municipality } from "./types";

// Invoice recipients per Zug municipality, ordered by name. Source: the
// Supabase table administration_addresses, exported 2026-10-21
// (scripts/municipality-data/supabase-export-2026-10-21.json).
export const MUNICIPALITIES: readonly Municipality[] = [
  {
    bfs: 1701,
    name: "Baar",
    recipient: {
      title: "Einwohnergemeinde Baar",
      department: "Fachstelle Gesundheit/Alter",
      address: "Rathausgasse 6 Postfach",
      city: "6341 Baar",
    },
  },
  {
    bfs: 1702,
    name: "Cham",
    recipient: {
      title: "Einwohnergemeinde Cham",
      department: "Sozialdienst",
      address: "Mandelhof",
      city: "6330 Cham",
    },
  },
  {
    bfs: 1703,
    name: "Hünenberg",
    recipient: {
      title: "Gemeindeverwaltung",
      department: "",
      address: "Postfach 261",
      city: "6331 Hünenberg",
    },
  },
  {
    bfs: 1704,
    name: "Menzingen",
    recipient: {
      title: "Gemeindeverwaltung",
      department: "Soziales und Gesundheit",
      address: "Postfach",
      city: "6313 Menzingen",
    },
  },
  {
    bfs: 1705,
    name: "Neuheim",
    recipient: {
      title: "Gemeindeverwaltung",
      department: "",
      address: "Postfach 161",
      city: "6345 Neuheim",
    },
  },
  {
    bfs: 1706,
    name: "Oberägeri",
    recipient: {
      title: "Sozialdienst Oberägeri",
      department: "",
      address: "Alosenstrasse 2",
      city: "6315 Oberägeri",
    },
  },
  {
    bfs: 1707,
    name: "Risch",
    recipient: {
      title: "Gemeinde Risch",
      department: "Abteilung Soziales/Gesundheit",
      address: "Zentrum Dorfmatt",
      city: "6343 Rotkreuz",
    },
  },
  {
    bfs: 1708,
    name: "Steinhausen",
    recipient: {
      title: "Sozialdienst Steinhausen",
      department: "",
      address: "Rathaus",
      city: "6312 Steinhausen",
    },
  },
  {
    bfs: 1709,
    name: "Unterägeri",
    recipient: {
      title: "Einwohnergemeinde Unterägeri",
      department: "Abteilung Soziales/Gesundheit",
      address: "Postfach 79",
      city: "6314 Unterägeri",
    },
  },
  {
    bfs: 1710,
    name: "Walchwil",
    recipient: {
      title: "Gemeindekanzlei Walchwil",
      department: "",
      address: "Postfach 93",
      city: "6318 Walchwil",
    },
  },
  {
    bfs: 1711,
    name: "Zug",
    recipient: {
      title: "Stadtverwaltung Zug",
      department: "Fachstelle Alter und Gesundheit Stadt Zug",
      address: "Gubelstrasse 22 Postfach",
      city: "6301 Zug",
    },
  },
];
