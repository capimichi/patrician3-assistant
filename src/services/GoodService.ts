import GoodClient from '../clients/GoodClient';
import type { Good } from '../types';

export interface LocalizedGood extends Omit<Good, 'name'> {
  name: string;
}

export default class GoodService {
  constructor(private client: GoodClient) {}

  async getGoods(lang: 'it' | 'en'): Promise<LocalizedGood[]> {
    const goods = await this.client.getGoods();
    return goods.map((g: Good) => ({
      ...g,
      name: g.name[lang] || g.name.en
    }));
  }

  async getGoodById(id: string, lang: 'it' | 'en'): Promise<LocalizedGood | undefined> {
    const goods = await this.getGoods(lang);
    return goods.find(g => g.id === id);
  }
}
