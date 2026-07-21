import ShipClient from '../clients/ShipClient';
import type { ShipType } from '../types';

export interface LocalizedShipType extends Omit<ShipType, 'name'> {
  name: string;
}

export default class ShipService {
  constructor(private client: ShipClient) {}

  async getShips(lang: 'it' | 'en'): Promise<LocalizedShipType[]> {
    const ships = await this.client.getShips();
    return ships.map((s: ShipType) => ({
      ...s,
      name: s.name[lang] || s.name.en
    }));
  }

  async getShipById(id: string, lang: 'it' | 'en'): Promise<LocalizedShipType | undefined> {
    const ships = await this.getShips(lang);
    return ships.find(s => s.id === id);
  }
}
