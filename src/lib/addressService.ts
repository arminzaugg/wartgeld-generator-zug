interface AddressResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export const searchAddresses = async (query: string): Promise<AddressResult[]> => {
  // Simulated API call - in real app, replace with actual API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockAddresses: AddressResult[] = [
    {
      id: "1",
      address: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105"
    },
    {
      id: "2",
      address: "456 Market St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103"
    }
  ].filter(addr => 
    addr.address.toLowerCase().includes(query.toLowerCase()) ||
    addr.city.toLowerCase().includes(query.toLowerCase())
  );

  return mockAddresses;
};