import { render, screen } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import TravelTimes from './TravelTimes';

const mockTowns = [
  {
    id: 'lubeck',
    name: 'Lubecca',
    isRiverTown: false,
    produces: [],
    coordinate: { x: 0, y: 0 }
  }
];

const mockShips = [
  { id: 'crayer', name: { it: 'Caravella', en: 'Crayer' } }
];

const mockFetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('towns.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockTowns,
    });
  }
  if (url.includes('ships.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockShips,
    });
  }
  return Promise.reject(new Error('Unknown URL: ' + url));
});
vi.stubGlobal('fetch', mockFetch);

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'it', changeLanguage: async () => {} }
  })
}));

// Mock per evitare caricamento di dati reali in ambiente test
vi.mock('../../contexts/GameContext', () => {
  const mockGame = {
    state: {
      towns: {
        lubeck: {
          townId: 'lubeck',
          isActive: true,
          population: { rich: 10, wealthy: 20, poor: 100 },
          houses: { fachwerk: 1, giebel: 1, kaufmann: 1 },
          businesses: {},
          logistics: {
            centralHubId: 'none',
            slowestShipType: 'crayer',
            transitHubId: 'none',
            convoySize: 0,
            convoyStops: 0,
            stockWeeks: 2
          }
        }
      }
    },
    constants: {
      shipSpeedModifiers: { crayer: 1.0, cog: 1.32 },
      loadingPenaltyPerStopDays: 0.25,
      travelTimes: { lubeck: { rostock: 0.5 } }
    },
    getTravelTime: () => 0.5
  };
  return {
    useGame: () => ({ game: mockGame }),
    GameProvider: ({ children }: any) => <div>{children}</div>
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('TravelTimes page loads page header successfully', async () => {
  render(
    <ServicesProvider>
      <TravelTimes />
    </ServicesProvider>
  );

  // Verifica la presenza dell'intestazione caricata in modo asincrono
  const title = await screen.findByText('dashboard.travel_times_title');
  expect(title).toBeDefined();
});
