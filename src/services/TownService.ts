import TownClient from '../clients/TownClient';
import type { Town } from '../types';

export default class TownService {
  constructor(private client: TownClient) {}

  async getTowns(): Promise<Town[]> {
    return this.client.getTowns();
  }

  async getTownById(id: string): Promise<Town | undefined> {
    const towns = await this.getTowns();
    return towns.find(t => t.id === id);
  }
}
