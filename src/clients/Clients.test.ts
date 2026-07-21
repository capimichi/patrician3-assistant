import { expect, test, vi, beforeEach } from 'vitest';
import TownClient from './TownClient';
import GoodClient from './GoodClient';

beforeEach(() => {
  vi.restoreAllMocks();
});

test('TownClient fetches and caches towns', async () => {
  const mockTowns = [{ id: 'lubeck', name: 'Lubecca', isRiverTown: false, produces: [] }];
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockTowns,
  });
  vi.stubGlobal('fetch', mockFetch);

  const client = new TownClient();
  const res1 = await client.getTowns();
  await client.getTowns();

  expect(res1[0].id).toBe('lubeck');
  expect(mockFetch).toHaveBeenCalledTimes(1); // cached
});

test('GoodClient fetches and caches goods', async () => {
  const mockGoods = [{ id: 'beer', name: { it: 'Birra', en: 'Beer' } }];
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockGoods,
  });
  vi.stubGlobal('fetch', mockFetch);

  const client = new GoodClient();
  const res1 = await client.getGoods();
  await client.getGoods();

  expect(res1[0].id).toBe('beer');
  expect(mockFetch).toHaveBeenCalledTimes(1); // cached
});
