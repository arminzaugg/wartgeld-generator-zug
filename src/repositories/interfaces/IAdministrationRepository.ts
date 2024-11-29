export interface IAdministrationRepository {
  getAdministrationData(municipality: string): Promise<{
    title: string;
    name: string;
    address: string;
    city: string;
  }>;
}