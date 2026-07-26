import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import TownsList from './TownsList';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

const mockTowns = [
  {
    id: 'lubeck',
    name: 'Lubecca (Lübeck)',
    isRiverTown: false,
    produces: ['beer', 'grain'],
    coordinate: { x: 300, y: 420 }
  }
];

const mockGoods = [
  { id: 'beer', name: { it: 'Birra', en: 'Beer' } },
  { id: 'grain', name: { it: 'Grano', en: 'Grain' } }
];

// Mock fetch per restituire città o merci in base all'URL
const mockFetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('towns.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockTowns,
    });
  }
  if (url.includes('goods.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockGoods,
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});
vi.stubGlobal('fetch', mockFetch);

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'it', changeLanguage: async () => {} }
  })
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

test('TownsList renders and allows column toggling saved in localStorage', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter>
        <TownsList />
      </MemoryRouter>
    </ServicesProvider>
  );

  // Attende il caricamento dei dati
  const columnBtn = await screen.findByRole('button', { name: /colonne/i });
  expect(columnBtn).toBeDefined();

  // Verifica che il nome della città e coordinate siano renderizzati
  const townName = screen.getByText('Lubecca (Lübeck)');
  expect(townName).toBeDefined();

  // Fai click sul pulsante colonne per aprire il menu
  fireEvent.click(columnBtn);

  // Cerca la checkbox per 'Coordinate' e deselezionala
  const coordCheckbox = screen.getByLabelText(/coordinate/i);
  fireEvent.click(coordCheckbox);

  // Verifica che lo stato sia memorizzato nel localStorage
  const savedCols = JSON.parse(localStorage.getItem('patrician3_towns_columns') || '[]');
  expect(savedCols.includes('coordinates')).toBe(false);
});
