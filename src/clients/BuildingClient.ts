import type { Building } from '../types';

export default class BuildingClient {
  private cache: Building[] | null = null;

  async getBuildings(): Promise<Building[]> {
    if (this.cache) return this.cache;
    const res = await fetch('/data/buildings.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch buildings: ${res.status}`);
    }
    this.cache = await res.json() as Building[];
    return this.cache;
  }
}
