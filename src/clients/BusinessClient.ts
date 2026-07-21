import type { Business } from '../types';

export default class BusinessClient {
  private cache: Business[] | null = null;

  async getBusinesses(): Promise<Business[]> {
    if (this.cache) return this.cache;
    const res = await fetch('/data/businesses.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch businesses: ${res.status}`);
    }
    this.cache = await res.json() as Business[];
    return this.cache;
  }
}
