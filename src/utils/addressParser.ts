export const parseAddressInput = (input: string) => {
  const match = input.match(/^(.*?)\s*(\d+\s*[a-zA-Z]*)?\s*$/);
  if (!match) return { streetName: input, houseNumber: '' };
  
  return {
    streetName: match[1].trim(),
    houseNumber: match[2]?.trim() || ''
  };
};