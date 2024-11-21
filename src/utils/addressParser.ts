export const parseAddressInput = (input: string) => {
  // Match pattern: street + number, optional zip + city
  const fullMatch = input.match(/^(.*?)(?:\s+(\d+)\s*([A-Za-z])?)?(?:,?\s+(\d{4})\s+(.+))?$/);
  
  if (!fullMatch) return { 
    streetName: input, 
    houseNumber: '', 
    addition: '',
    zipCode: '',
    city: '' 
  };
  
  const [, streetName, number, addition, zipCode, city] = fullMatch;
  
  return {
    streetName: streetName.trim(),
    houseNumber: number || '',
    addition: addition || '',
    zipCode: zipCode || '',
    city: city || ''
  };
};