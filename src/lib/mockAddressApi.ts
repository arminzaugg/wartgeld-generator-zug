import { ZipSearchSummary, ZipSummary, StreetSearchSummary, StreetSummary, AddressSearchParams, StreetSearchParams } from '../types/address';

// Extended mock data for Swiss cities and ZIP codes
const mockZipData: ZipSummary[] = [
  { zip: "6300", city18: "Zug", city27: "Zug", city39: "Zug" },
  { zip: "6330", city18: "Cham", city27: "Cham", city39: "Cham" },
  { zip: "6331", city18: "Hünenberg", city27: "Hünenberg", city39: "Hünenberg" },
  { zip: "6343", city18: "Rotkreuz", city27: "Rotkreuz", city39: "Rotkreuz" },
  { zip: "6312", city18: "Steinhausen", city27: "Steinhausen", city39: "Steinhausen" },
  { zip: "6340", city18: "Baar", city27: "Baar", city39: "Baar" },
  { zip: "6345", city18: "Neuheim", city27: "Neuheim", city39: "Neuheim" },
  { zip: "6313", city18: "Menzingen", city27: "Menzingen", city39: "Menzingen" },
  { zip: "6314", city18: "Unterägeri", city27: "Unterägeri", city39: "Unterägeri" },
  { zip: "6315", city18: "Oberägeri", city27: "Oberägeri", city39: "Oberägeri" },
  { zip: "6318", city18: "Walchwil", city27: "Walchwil", city39: "Walchwil" },
];

// Extended mock data for streets with house numbers
const mockStreetData: StreetSummary[] = [
  { 
    STRID: 1001, 
    streetName: "Bahnhofstrasse", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "1" },
      { number: "2", addition: "A" },
      { number: "2", addition: "B" },
      { number: "3" },
      { number: "5" },
      { number: "7", addition: "A" },
      { number: "7", addition: "B" },
      { number: "7", addition: "C" },
    ]
  },
  { 
    STRID: 1002, 
    streetName: "Poststrasse", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "10" },
      { number: "12" },
      { number: "14", addition: "A" },
      { number: "14", addition: "B" },
      { number: "16" },
    ]
  },
  { 
    STRID: 1003, 
    streetName: "Bundesplatz", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "1" },
      { number: "3" },
      { number: "5", addition: "A" },
      { number: "5", addition: "B" },
    ]
  },
  { 
    STRID: 1004, 
    streetName: "Baarerstrasse", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "20" },
      { number: "22", addition: "A" },
      { number: "22", addition: "B" },
      { number: "24" },
    ]
  },
  { 
    STRID: 1005, 
    streetName: "Industriestrasse", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "15" },
      { number: "17" },
      { number: "19", addition: "A" },
      { number: "21" },
    ]
  },
  { 
    STRID: 2001, 
    streetName: "Bahnhofplatz", 
    zipCode: "6330", 
    city: "Cham",
    houseNumbers: [
      { number: "1" },
      { number: "2" },
      { number: "3", addition: "A" },
      { number: "3", addition: "B" },
    ]
  },
  { 
    STRID: 2002, 
    streetName: "Zugerstrasse", 
    zipCode: "6330", 
    city: "Cham",
    houseNumbers: [
      { number: "30" },
      { number: "32" },
      { number: "34", addition: "A" },
      { number: "36" },
    ]
  },
  { 
    STRID: 2003, 
    streetName: "Dorfstrasse", 
    zipCode: "6330", 
    city: "Cham",
    houseNumbers: [
      { number: "5" },
      { number: "7" },
      { number: "9", addition: "A" },
      { number: "11" },
    ]
  },
  { 
    STRID: 3001, 
    streetName: "Hauptstrasse", 
    zipCode: "6331", 
    city: "Hünenberg",
    houseNumbers: [
      { number: "40" },
      { number: "42" },
      { number: "44", addition: "A" },
      { number: "46" },
    ]
  },
  { 
    STRID: 3002, 
    streetName: "Chamerstrasse", 
    zipCode: "6331", 
    city: "Hünenberg",
    houseNumbers: [
      { number: "25" },
      { number: "27" },
      { number: "29", addition: "A" },
      { number: "31" },
    ]
  },
  { 
    STRID: 3003, 
    streetName: "Bahnhofstrasse", 
    zipCode: "6331", 
    city: "Hünenberg",
    houseNumbers: [
      { number: "50" },
      { number: "52" },
      { number: "54", addition: "A" },
      { number: "56" },
    ]
  },
];

export const mockAddressApi = {
  searchZip: async (params: AddressSearchParams): Promise<ZipSearchSummary> => {
    console.log('Mock API searching for:', params);
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300));

    try {
      if (!params.zipCity || params.zipCity.length < 2) {
        return { zips: [] };
      }

      const searchTerm = params.zipCity.toLowerCase();
      const results = mockZipData.filter(item => 
        item.zip.startsWith(searchTerm) || 
        item.city18.toLowerCase().includes(searchTerm)
      );

      console.log('Mock API found results:', results);

      return {
        zips: results.slice(0, params.limit || 10)
      };
    } catch (error) {
      console.error('Mock API error:', error);
      return { zips: [] };
    }
  },

  searchStreets: async (params: StreetSearchParams): Promise<StreetSearchSummary> => {
    console.log('Mock API searching streets:', params);
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300));

    try {
      if (!params.streetName || params.streetName.length < 2) {
        return { streets: [] };
      }

      let results = mockStreetData.filter(street => 
        street.streetName.toLowerCase().includes(params.streetName.toLowerCase())
      );

      if (params.zipCode) {
        results = results.filter(street => street.zipCode === params.zipCode);
      }

      return {
        streets: results.slice(0, params.limit || 10)
      };
    } catch (error) {
      console.error('Mock API street search error:', error);
      return { streets: [] };
    }
  },

  ping: async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }
};