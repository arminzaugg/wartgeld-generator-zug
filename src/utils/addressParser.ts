export const parseAddressInput = (input: string) => {
  // Match patterns for different address components
  const zipCityPattern = /(\d{4})\s+([^,]+)/;
  const houseNumberPattern = /(\d+[a-zA-Z]?)\s*$/;
  
  let streetName = input;
  let houseNumber = '';
  let addition = '';
  let zipCode = '';
  let city = '';

  // Extract ZIP and city if present
  const zipCityMatch = input.match(zipCityPattern);
  if (zipCityMatch) {
    zipCode = zipCityMatch[1];
    city = zipCityMatch[2].trim();
    streetName = input.replace(zipCityPattern, '').trim();
  }

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

  // Clean up any remaining commas
  streetName = streetName.replace(/,/g, '').trim();

  return {
    streetName,
    houseNumber,
    addition,
    zipCode,
    city
  };
};