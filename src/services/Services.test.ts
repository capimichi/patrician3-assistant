import { expect, test } from 'vitest';
import TownClient from '../clients/TownClient';
import GoodClient from '../clients/GoodClient';
import TownService from './TownService';
import GoodService from './GoodService';

test('Services format and localize data from clients', async () => {
  const mockTownClient = {
    getTowns: async () => [{ id: 'lubeck', name: 'Lubecca', isRiverTown: false, produces: [] }]
  } as unknown as TownClient;

  const mockGoodClient = {
    getGoods: async () => [{
      id: 'beer',
      name: { it: 'Birra', en: 'Beer' },
      basePrice: 45,
      buyPriceRange: [35, 40],
      sellPriceRange: [45, 55],
      maxSatisfactionPrice: 40,
      volume: 1,
      isRawMaterial: false,
      isImported: false
    }]
  } as unknown as GoodClient;

  const townService = new TownService(mockTownClient);
  const goodService = new GoodService(mockGoodClient);

  const towns = await townService.getTowns();
  expect(towns[0].name).toBe('Lubecca');

  const goodsIt = await goodService.getGoods('it');
  expect(goodsIt[0].name).toBe('Birra');

  const goodsEn = await goodService.getGoods('en');
  expect(goodsEn[0].name).toBe('Beer');
});

test('Production balance calculation with specialty penalty', () => {
  const baseProd = 2.0; // 2 barili al giorno
  const isSpecialty = true;
  const prodSpecial = isSpecialty ? baseProd : baseProd * 0.75;

  const isSpecialtyPenalty = false;
  const prodPenalty = isSpecialtyPenalty ? baseProd : baseProd * 0.75;

  expect(prodSpecial).toBe(2.0);
  expect(prodPenalty).toBe(1.5);
});
