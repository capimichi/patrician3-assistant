import type { ShipType } from '../types';

export default class ShipClient {
  private cache: ShipType[] | null = null;

  async getShips(): Promise<ShipType[]> {
    if (this.cache) return this.cache;
    const res = await fetch('/data/ships.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch ships: ${res.status}`);
    }
    this.cache = await res.json() as ShipType[];
    return this.cache;
  }
}
