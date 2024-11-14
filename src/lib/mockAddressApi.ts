import { ZipSearchSummary, ZipSummary } from '../types/address';

// Mock data for Swiss cities and ZIP codes
const mockZipData: ZipSummary[] = [
  { zip: "6300", city18: "Zug", city27: "Zug", city39: "Zug" },
  { zip: "6330", city18: "Cham", city27: "Cham", city39: "Cham" },
  { zip: "6331", city18: "Hünenberg", city27: "Hünenberg", city39: "Hünenberg" },
  { zip: "6343", city18: "Risch", city27: "Risch", city39: "Risch" },
  { zip: "6312", city18: "Steinhausen", city27: "Steinhausen", city39: "Steinhausen" },
  { zip: "6340", city18: "Baar", city27: "Baar", city39: "Baar" },
  { zip: "6345", city18: "Neuheim", city27: "Neuheim", city39: "Neuheim" },
  { zip: "6313", city18: "Menzingen", city27: "Menzingen", city39: "Menzingen" },
  { zip: "6314", city18: "Unterägeri", city27: "Unterägeri", city39: "Unterägeri" },
  { zip: "6315", city18: "Oberägeri", city27: "Oberägeri", city39: "Oberägeri" },
  { zip: "6318", city18: "Walchwil", city27: "Walchwil", city39: "Walchwil" },
];

export const mockAddressApi = {
  searchZip: async (query: string): Promise<ZipSearchSummary> => {
    console.log('Mock API searching for:', query);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const results = mockZipData.filter(item => 
        item.zip.startsWith(query) || 
        item.city18.toLowerCase().includes(query.toLowerCase())
      );

      console.log('Mock API found results:', results);

      return {
        zips: results
      };
    } catch (error) {
      console.error('Mock API error:', error);
      return {
        zips: []
      };
    }
  }
};