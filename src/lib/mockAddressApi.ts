import { ZipSearchSummary, ZipSummary, AddressSearchParams } from '../types/address';

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

export const mockAddressApi = {
  searchZip: async (params: AddressSearchParams): Promise<ZipSearchSummary> => {
    console.log('Mock API searching for:', params);
    
    // Simulate API delay
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

  ping: async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }
};