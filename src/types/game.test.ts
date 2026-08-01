import { expect, test } from 'vitest';
import type { GameRawState } from './game';

test('GameRawState interface shape validation', () => {
  const raw: GameRawState = {
    id: 'test-id',
    name: 'Test Game',
    createdAt: '2026-08-01T20:00:00Z',
    towns: {
      lubeck: {
        townId: 'lubeck',
        isActive: true,
        population: { rich: 100, wealthy: 200, poor: 1000 },
        houses: { fachwerk: 5, giebel: 3, kaufmann: 2 },
        businesses: {
          brewery: { count: 2, efficiency: 2 }
        },
        logistics: {
          centralHubId: 'lubeck',
          slowestShipType: 'crayer',
          transitHubId: 'none',
          convoySize: 1000,
          convoyStops: 4,
          stockWeeks: 2
        }
      }
    }
  };
  expect(raw.id).toBe('test-id');
  expect(raw.towns.lubeck.population.rich).toBe(100);
});
