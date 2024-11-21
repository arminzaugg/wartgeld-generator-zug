export const parseAddressInput = (input: string) => {
  // Match pattern: any characters followed by optional space and optional number with optional letter
  const match = input.match(/^(.*?)(?:\s+(\d+)\s*([A-Za-z])?)?$/);
  
  if (!match) return { streetName: input, houseNumber: '', addition: '' };
  
  const [, streetName, number, addition] = match;
  
  return {
    streetName: streetName.trim(),
    houseNumber: number || '',
    addition: addition || ''
  };
};