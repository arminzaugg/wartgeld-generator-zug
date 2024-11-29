import { describe, it, expect, beforeEach } from 'vitest';
import { AddressService } from '../AddressService';
import { MockAddressRepository } from '@/repositories/__mocks__/MockAddressRepository';
import { createStreetSummary } from '@/lib/__tests__/factories/addressFactory';

describe('AddressService', () => {
  let addressService: AddressService;
  let mockRepository: MockAddressRepository;

  beforeEach(() => {
    mockRepository = new MockAddressRepository();
    addressService = new AddressService(mockRepository);
  });

  describe('lookupStreet', () => {
    it('returns street suggestions for valid query', async () => {
      const expectedStreet = createStreetSummary();
      mockRepository.setMockStreets([expectedStreet]);

      const result = await addressService.lookupStreet('Test');
      
      expect(result).toHaveLength(1);
      expect(result[0].streetName).toBe(expectedStreet.streetName);
    });
  });

  describe('getPlzMapping', () => {
    it('returns municipality for valid PLZ', async () => {
      const expectedMapping = { gemeinde: 'Test Gemeinde' };
      mockRepository.setMockPlzMapping(expectedMapping);

      const result = await addressService.getPlzMapping('1234');
      
      expect(result).toEqual(expectedMapping);
    });
  });
});