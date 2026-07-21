import type { Town } from '../types';

export default class TownClient {
  private cache: Town[] | null = null;

  async getTowns(): Promise<Town[]> {
    if (this.cache) return this.cache;
    const res = await fetch('/data/towns.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch towns: ${res.status}`);
    }
    this.cache = await res.json() as Town[];
    return this.cache;
  }
}
