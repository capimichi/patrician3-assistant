import { expect, test } from 'vitest';
import type { Town, Good } from './index';

test('verify Town interface structure', () => {
  const mockTown: Town = {
    id: 'lubeck',
    name: 'Lubecca',
    isRiverTown: false,
    produces: ['beer', 'grain']
  };
  expect(mockTown.id).toBe('lubeck');
  expect(mockTown.isRiverTown).toBe(false);
  expect(mockTown.produces).toContain('beer');
});

test('verify Good interface structure', () => {
  const mockGood: Good = {
    id: 'beer',
    name: { it: 'Birra', en: 'Beer' },
    basePrice: 40,
    buyPriceRange: [35, 40],
    sellPriceRange: [44, 60],
    maxSatisfactionPrice: 40,
    volume: 1,
    isRawMaterial: false,
    isImported: false
  };
  expect(mockGood.name.it).toBe('Birra');
});
