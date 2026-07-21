import BuildingClient from '../clients/BuildingClient';
import type { Building } from '../types';

export interface LocalizedBuilding extends Omit<Building, 'name'> {
  name: string;
}

export default class BuildingService {
  constructor(private client: BuildingClient) {}

  async getBuildings(lang: 'it' | 'en'): Promise<LocalizedBuilding[]> {
    const buildings = await this.client.getBuildings();
    return buildings.map((b: Building) => ({
      ...b,
      name: b.name[lang] || b.name.en
    }));
  }
}
