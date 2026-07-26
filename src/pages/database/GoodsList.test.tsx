import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import GoodsList from './GoodsList';

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

// Mock fetch per evitare errori URL in jsdom
const mockGoods = [
  {
    id: 'beer',
    name: { it: 'Birra', en: 'Beer' },
    basePrice: 45,
    buyPriceRange: [35, 40],
    sellPriceRange: [44, 60],
    maxSatisfactionPrice: 40,
    volume: 1,
    isRawMaterial: false,
    isImported: false
  }
];

const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => mockGoods,
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

test('GoodsList renders and allows column toggling saved in localStorage', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter>
        <GoodsList />
      </MemoryRouter>
    </ServicesProvider>
  );

  // Attende che l'elemento caricato appaia (risolvendo l'errore asincrono)
  const columnBtn = await screen.findByRole('button', { name: /colonne/i });
  expect(columnBtn).toBeDefined();

  // Inizialmente la colonna "Stiva (Volume)" è visibile di default
  expect(screen.queryByText(/volume/i)).toBeDefined();

  // Fai click sul pulsante per aprire il menu colonne
  fireEvent.click(columnBtn);

  // Trova e clicca sulla checkbox del volume per nasconderlo
  const volumeCheckbox = screen.getByLabelText(/stiva/i);
  fireEvent.click(volumeCheckbox);

  // Verifica che lo stato sia memorizzato nel localStorage
  const savedCols = JSON.parse(localStorage.getItem('patrician3_goods_columns') || '[]');
  expect(savedCols.includes('volume')).toBe(false);
});
