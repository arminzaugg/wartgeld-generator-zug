interface AddressResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export const searchAddresses = async (query: string): Promise<AddressResult[]> => {
  // Simulated API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockAddresses: AddressResult[] = [
    {
      id: "1",
      address: "Bahnhofstrasse 1",
      city: "Zug",
      state: "Zug",
      zipCode: "6300"
    },
    {
      id: "2",
      address: "Bundesplatz 15",
      city: "Zug",
      state: "Zug",
      zipCode: "6300"
    },
    {
      id: "3",
      address: "Industriestrasse 25",
      city: "Cham",
      state: "Zug",
      zipCode: "6330"
    },
    {
      id: "4",
      address: "Dorfstrasse 8",
      city: "Hünenberg",
      state: "Zug",
      zipCode: "6331"
    },
    {
      id: "5",
      address: "Zugerstrasse 50",
      city: "Baar",
      state: "Zug",
      zipCode: "6340"
    }
  ].filter(addr => 
    addr.address.toLowerCase().includes(query.toLowerCase()) ||
    addr.city.toLowerCase().includes(query.toLowerCase()) ||
    addr.zipCode.includes(query)
  );

  return mockAddresses;
};