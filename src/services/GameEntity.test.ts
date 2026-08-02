import { expect, test } from 'vitest';
import { Game } from './GameEntity';
import type { GameRawState, GameConstants } from '../types/game';

const mockConstants: GameConstants = {
  consumptionPer1000: {
    grain: { rich: 3.0, wealthy: 4.5, poor: 6.0 },
    beer: { rich: 20.0, wealthy: 40.0, poor: 20.0 }
  },
  shipSpeedModifiers: { crayer: 1.0 },
  loadingPenaltyPerStopDays: 0.25,
  productionRates: {
    brewery_e: {
      germanName: 'Brauerei',
      category: 'E',
      summer: [49.35, 50.77, 52.27, 54.26],
      winter: [49.35, 50.77, 52.27, 54.26],
      rm1: [0.45, 0.5, 0.51, 0.54],
      rm2: [1.2, 1.26, 1.3, 1.35]
    },
    sawmill_e: {
      germanName: 'Sägewerk',
      category: 'E',
      summer: [14.0, 14.4, 14.82, 15.38],
      winter: [14.0, 14.4, 14.82, 15.38],
      rm1: [0, 0, 0, 0],
      rm2: [0, 0, 0, 0]
    },
    sawmill_i: {
      germanName: 'Sägewerk',
      category: 'I',
      summer: [10.5, 10.8, 11.12, 11.53],
      winter: [10.5, 10.8, 11.12, 11.53],
      rm1: [0, 0, 0, 0],
      rm2: [0, 0, 0, 0]
    }
  }
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
      businesses: {
        brewery: { count: 2, efficiency: 2 },
        sawmill: { count: 3, efficiency: 1 }
      },
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
      businesses: {
        brewery: { count: 4, efficiency: 2 }
      },
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
  expect(percentages.rich).toBeCloseTo(8.33, 1);
  expect(percentages.wealthy).toBeCloseTo(15.00, 1);
  expect(percentages.poor).toBeCloseTo(76.67, 1);
});

test('Game Entity calculates business counts and equivalents', () => {
  const game = new Game(mockRawState, mockConstants);
  
  // Total active breweries (Effective)
  expect(game.getBusinessesCount('brewery_e')).toBe(6); // 2 in lubeck + 4 in hamburg
  
  // Total active sawmills (Ineffective)
  expect(game.getBusinessesCount('sawmill_i')).toBe(3); // 3 in lubeck
  expect(game.getBusinessesCount('sawmill_e')).toBe(0); 

  // Total equivalent sawmills (3 inefficient * (11.53 / 15.38) = 2.25)
  expect(game.getBusinessesEquivalent('sawmill_e')).toBeCloseTo(2.25, 2);
});

test('Game Entity calculates demographic and industrial raw material consumption', () => {
  const game = new Game(mockRawState, mockConstants);

  // 1. Population consumption for grain:
  // Lubeck: ((50 * 3.0) + (150 * 4.5) + (800 * 6.0)) / 1000 = 5.625
  // Hamburg: ((200 * 3.0) + (300 * 4.5) + (1500 * 6.0)) / 1000 = 10.950
  // Pop Total = 16.575
  
  // 2. Industrial grain consumption by breweries:
  // Lubeck: 2 breweries -> Tier 0 (1-2) -> consumes 0.45 per brewery -> 2 * 0.45 = 0.90
  // Hamburg: 4 breweries -> Tier 1 (3-5) -> consumes 0.50 per brewery -> 4 * 0.50 = 2.00
  // Ind Total = 2.90
  
  // Grand Total grain consumption = 16.575 + 2.90 = 19.475
  const totalGrainCons = game.getGoodWeeklyConsumption('grain', 'summer');
  expect(totalGrainCons).toBeCloseTo(19.475, 3);
});

test('Game Entity calculates theoretical business requirements', () => {
  const game = new Game(mockRawState, mockConstants);

  // For brewery:
  // Total beer weekly consumption:
  // Pop: Lubeck: (50*20 + 150*40 + 800*20)/1000 = 23.0
  // Hamburg: (200*20 + 300*40 + 1500*20)/1000 = 46.0
  // Pop Total = 69.0
  // Ind: None consumes beer.
  // Beer consumption = 69.0
  // Effective Tier 4 (ab 9) brewery summer rate = 54.26
  // Required breweries = ROUNDUP(69.0 / 54.26) = Math.ceil(1.27) = 2
  const reqBreweries = game.getTheoreticalRequiredBusinesses('brewery_e', 'summer');
  expect(reqBreweries).toBe(2);
});

test('Game Entity calculates housing statistics and projections', () => {
  const game = new Game(mockRawState, mockConstants);
  
  // Lubeck population: poor: 800, wealthy: 150, rich: 50.
  // Lubeck houses: fachwerk: 0, giebel: 0, kaufmann: 0
  // Target FWH (poor): Math.ceil(800 / 280) = 3
  // Target GH (wealthy): Math.ceil(150 / 140) = 2
  // Target KMH (rich): Math.ceil(50 / 80) = 1
  
  const summary = game.getTownHousingSummary('lubeck');
  expect(summary).not.toBeNull();
  expect(summary!.fachwerk.target).toBe(3);
  expect(summary!.fachwerk.actual).toBe(0);
  expect(summary!.fachwerk.balance).toBe(-3);
  
  expect(summary!.giebel.target).toBe(2);
  expect(summary!.giebel.actual).toBe(0);
  expect(summary!.giebel.balance).toBe(-2);
  
  expect(summary!.kaufmann.target).toBe(1);
  expect(summary!.kaufmann.actual).toBe(0);
  expect(summary!.kaufmann.balance).toBe(-1);

  // Test target growth projection: lubeck target population = 10000
  // Lubeck total current pop = 800+150+50 = 1000.
  // Poor share = 800 / 1000 = 80%. Target poor pop = 10000 * 0.8 = 8000.
  // Target FWH needed = Math.ceil(8000 / 280) = 29.
  // Current supply is 0. toBuild = 29.
  
  const projection = game.getTownHousingProjection('lubeck', 10000);
  expect(projection).not.toBeNull();
  
  const poorProj = projection!.find(p => p.classId === 'poor');
  expect(poorProj!.percentage).toBe(80.0);
  expect(poorProj!.projectedPop).toBe(8000);
  expect(poorProj!.projectedNeeded).toBe(29);
  expect(poorProj!.toBuild).toBe(29);
});
