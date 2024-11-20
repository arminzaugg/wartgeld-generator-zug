import { ZipSearchSummary, StreetSearchSummary, AddressSearchParams, StreetSearchParams } from '../types/address';
import { mockZipData } from './mockData/zipData';
import { mockStreetData } from './mockData/streetData';

export const mockAddressApi = {
  searchZip: async (params: AddressSearchParams): Promise<ZipSearchSummary> => {
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

      return {
        zips: results.slice(0, params.limit || 10)
      };
    } catch (error) {
      console.error('Mock API error:', error);
      return { zips: [] };
    }
  },

  searchStreets: async (params: StreetSearchParams): Promise<StreetSearchSummary> => {
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