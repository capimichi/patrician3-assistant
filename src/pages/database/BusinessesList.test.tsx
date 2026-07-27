import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import BusinessesList from './BusinessesList';

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

const mockBusinesses = [
  {
    id: 'brewery',
    name: { it: 'Birreria', en: 'Brewery' },
    outputs: [
      { goodId: 'beer', amountPerDay: 2.0 }
    ],
    inputs: [
      { goodId: 'grain', amountPerDay: 0.5 }
    ],
    constructionCost: { gold: 12000, bricks: 40, timber: 20 },
    workersNeeded: 30,
    dailyMaintenance: 320
  }
];

const mockGoods = [
  { id: 'beer', name: { it: 'Birra', en: 'Beer' } },
  { id: 'grain', name: { it: 'Grano', en: 'Grain' } }
];

const mockFetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('businesses.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockBusinesses,
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

test('BusinessesList renders and allows column toggling saved in localStorage', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter>
        <BusinessesList />
      </MemoryRouter>
    </ServicesProvider>
  );

  // Attende il caricamento dei dati
  const columnBtn = await screen.findByRole('button', { name: /colonne/i });
  expect(columnBtn).toBeDefined();

  // Verifica che il nome dell'impresa sia visibile
  expect(screen.getByText('Birreria')).toBeDefined();

  // Fai click sul pulsante colonne per aprire il menu
  fireEvent.click(columnBtn);

  // Trova e clicca sulla checkbox della manutenzione per nasconderla
  const maintCheckbox = screen.getByLabelText(/manutenzione/i);
  fireEvent.click(maintCheckbox);

  // Verifica che lo stato sia memorizzato nel localStorage
  const savedCols = JSON.parse(localStorage.getItem('patrician3_businesses_columns') || '[]');
  expect(savedCols.includes('maintenance')).toBe(false);
});

test('BusinessesList filters businesses by query when query length >= 3', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter>
        <BusinessesList />
      </MemoryRouter>
    </ServicesProvider>
  );

  const input = await screen.findByPlaceholderText('common.search_businesses');
  expect(screen.queryByText('Birreria')).toBeDefined();

  // Minore di 3 caratteri - mostra tutto
  fireEvent.change(input, { target: { value: 'Bi' } });
  expect(screen.queryByText('Birreria')).toBeDefined();

  // Almeno 3 caratteri - filtra
  fireEvent.change(input, { target: { value: 'Bir' } });
  expect(screen.queryByText('Birreria')).toBeDefined();

  // Nessuna corrispondenza
  fireEvent.change(input, { target: { value: 'Xyz' } });
  expect(screen.queryByText('Birreria')).toBeNull();
  expect(screen.getByText(/common.no_results/i)).toBeDefined();
});

