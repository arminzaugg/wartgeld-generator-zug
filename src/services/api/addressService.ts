import type { AddressLookupResponse, StreetSummary } from "@/types/address";

/** Same-origin lookup service (Bunny edge script; Vite dev middleware locally). */
const LOOKUP_URL = '/api/address';

export const addressService = {
  async lookupStreet(searchTerm: string, zipCode?: string): Promise<StreetSummary[]> {
    if (searchTerm.trim().length < 2) return [];

    const response = await fetch(LOOKUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm, zipCode }),
    });
    if (!response.ok) throw new Error(`Address lookup failed (${response.status})`);

    // Results arrive filtered and ranked (see edge/address-lookup/handler.ts).
    const { results = [] } = await response.json() as AddressLookupResponse;
    return results.map(item => ({
      streetName: item.street,
      zipCode: item.postcode,
      city: item.town,
      houseNumbers: item.houseNumber
        ? [{ number: item.houseNumber, addition: item.houseNumberAddition }]
        : undefined,
    }));
  }
};
