import type { Good } from '../types';

export default class GoodClient {
  private cache: Good[] | null = null;

  async getGoods(): Promise<Good[]> {
    if (this.cache) return this.cache;
    const res = await fetch('/data/goods.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch goods: ${res.status}`);
    }
    this.cache = await res.json() as Good[];
    return this.cache;
  }
}
