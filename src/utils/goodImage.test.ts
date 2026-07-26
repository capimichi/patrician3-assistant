import { expect, test } from 'vitest';
import { getGoodImagePath } from './goodImage';

test('getGoodImagePath returns correct absolute path for standard and compound ids', () => {
  expect(getGoodImagePath('beer')).toBe('/images/goods/beer.png');
  expect(getGoodImagePath('iron_goods')).toBe('/images/goods/iron-goods.png');
  expect(getGoodImagePath('whale_oil')).toBe('/images/goods/whale-oil.png');
});
