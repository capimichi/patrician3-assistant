import { expect, test } from 'vitest';
import { Game } from './GameEntity';
import type { GameRawState, GameConstants } from '../types/game';

const mockConstants: GameConstants = {
  consumptionPer1000: {
    grain: { rich: 3.0, wealthy: 4.5, poor: 6.0 }
  },
  shipSpeedModifiers: { crayer: 1.0 },
  loadingPenaltyPerStopDays: 0.25
};

const mockRawState: GameRawState = {
  id: 'test-campaign',
  name: 'Campaign 1',
  createdAt: '2026-08-01',
  towns: {
    lubeck: {
      townId: 'lubeck',
      isActive: true,
      population: { rich: 50, wealthy: 150, poor: 800 },
      houses: { fachwerk: 0, giebel: 0, kaufmann: 0 },
      businesses: {},
      logistics: {
        centralHubId: 'lubeck',
        slowestShipType: 'crayer',
        transitHubId: 'none',
        convoySize: 0,
        convoyStops: 0,
        stockWeeks: 0
      }
    },
    hamburg: {
      townId: 'hamburg',
      isActive: true,
      population: { rich: 200, wealthy: 300, poor: 1500 },
      houses: { fachwerk: 0, giebel: 0, kaufmann: 0 },
      businesses: {},
      logistics: {
        centralHubId: 'hamburg',
        slowestShipType: 'crayer',
        transitHubId: 'none',
        convoySize: 0,
        convoyStops: 0,
        stockWeeks: 0
      }
    }
  }
};

test('Game Entity calculates overall population sums and class percentages', () => {
  const game = new Game(mockRawState, mockConstants);
  const totalPop = game.getHansePopulation();
  expect(totalPop).toBe(3000); // 50+150+800 + 200+300+1500

  const percentages = game.getHanseClassPercentages();
  // Rich: 250 / 3000 = 8.33%
  // Wealthy: 450 / 3000 = 15.00%
  // Poor: 2300 / 3000 = 76.67%
  expect(percentages.rich).toBeCloseTo(8.33, 1);
  expect(percentages.wealthy).toBeCloseTo(15.00, 1);
  expect(percentages.poor).toBeCloseTo(76.67, 1);
});
