import { getMunicipality } from "@/lib/municipality";

/** Recipient as shown on the page; a generic title ("Gemeindeverwaltung") gets the municipality name. */
export const recipientLabel = (bfs: number): string | null => {
  const municipality = getMunicipality(bfs);
  if (!municipality) return null;
  const { title } = municipality.recipient;
  return title.includes(municipality.name) ? title : `${title} ${municipality.name}`;
};
