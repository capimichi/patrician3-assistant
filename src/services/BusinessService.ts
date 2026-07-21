import BusinessClient from '../clients/BusinessClient';
import type { Business } from '../types';

export interface LocalizedBusiness extends Omit<Business, 'name'> {
  name: string;
}

export default class BusinessService {
  constructor(private client: BusinessClient) {} // Usiamo any per flessibilità o passiamo il tipo corretto

  async getBusinesses(lang: 'it' | 'en'): Promise<LocalizedBusiness[]> {
    const businesses = await this.client.getBusinesses();
    return businesses.map((b: Business) => ({
      ...b,
      name: b.name[lang] || b.name.en
    }));
  }

  async getBusinessById(id: string, lang: 'it' | 'en'): Promise<LocalizedBusiness | undefined> {
    const businesses = await this.getBusinesses(lang);
    return businesses.find(b => b.id === id);
  }
}
