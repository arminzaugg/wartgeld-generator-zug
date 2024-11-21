export const parseAddressInput = (input: string) => {
  // Split input into parts
  const parts = input.split(/\s+/);
  
  // Try to identify house number at the end
  const lastPart = parts[parts.length - 1];
  const hasNumberAtEnd = /^\d+[a-zA-Z]?$/.test(lastPart);
  
  let streetParts = hasNumberAtEnd ? parts.slice(0, -1) : parts;
  let houseNumber = hasNumberAtEnd ? lastPart.match(/^\d+/)?.[0] || '' : '';
  let addition = hasNumberAtEnd ? lastPart.match(/[a-zA-Z]$/)?.[0] || '' : '';
  
  // Join remaining parts as street name
  const streetName = streetParts.join(' ');
  
  return {
    streetName: streetName.trim(),
    houseNumber,
    addition,
    zipCode: '',
    city: ''
  };
};