import { normalizeTown, proposeMunicipality } from "@/lib/municipality";
import type { FormValues } from "@/types/form";

/**
 * Applies an address change from the street lookup. A picked suggestion
 * carries postcode and town; typed text does not, so it clears them and the
 * municipality. A municipality chosen by hand survives edits within the same
 * locality (e.g. adding the house number) and is re-proposed otherwise.
 */
export const applyAddressChange = (
  prev: FormValues,
  street: string,
  zipCode?: string,
  city?: string,
): FormValues => {
  if (zipCode === undefined) {
    return { ...prev, address: street, plz: "", ort: "", gemeindeBfs: "" };
  }

  const plz = zipCode.trim();
  const ort = city ?? "";
  const sameLocality = plz === prev.plz && normalizeTown(ort) === normalizeTown(prev.ort);
  const proposedBfs = proposeMunicipality(plz, ort).proposedBfs;
  const proposed = proposedBfs === null ? "" : String(proposedBfs);
  return {
    ...prev,
    address: street,
    plz,
    ort,
    gemeindeBfs: sameLocality ? prev.gemeindeBfs : proposed,
  };
};
