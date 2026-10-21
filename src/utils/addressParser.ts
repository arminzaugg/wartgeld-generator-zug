export const parseAddressInput = (input: string) => {
  // Match patterns for different address components
  const zipCityPattern = /(\d{4})\s+([^,]+)/;
  const zipOnlyPattern = /,\s*(\d{4})\s*$/;
  const houseNumberPattern = /(\d+[a-zA-Z]?)\s*$/;
  
  let streetName = input;
  let houseNumber = '';
  let addition = '';
  let zipCode = '';
  let city = '';

  // Extract ZIP and city if present
  const zipCityMatch = input.match(zipCityPattern);
  // A postcode typed after a comma, before the town: "Bahnhofstr 1, 6300"
  const zipOnlyMatch = input.match(zipOnlyPattern);
  if (zipCityMatch) {
    zipCode = zipCityMatch[1];
    city = zipCityMatch[2].trim();
    streetName = input.replace(zipCityPattern, '').trim();
  } else if (zipOnlyMatch) {
    zipCode = zipOnlyMatch[1];
    streetName = input.replace(zipOnlyPattern, '').trim();
  }

  // Drop commas first so "Strasse 4, 6300 Zug" still yields house number 4
  streetName = streetName.replace(/,/g, '').trim();

  // Extract house number if present
  const houseNumberMatch = streetName.match(houseNumberPattern);
  if (houseNumberMatch) {
    const fullNumber = houseNumberMatch[1];
    const numberMatch = fullNumber.match(/(\d+)([a-zA-Z])?/);
    if (numberMatch) {
      houseNumber = numberMatch[1];
      addition = numberMatch[2] || '';
      streetName = streetName.replace(houseNumberPattern, '').trim();
    }
  }

  return {
    streetName,
    houseNumber,
    addition,
    zipCode,
    city
  };
};