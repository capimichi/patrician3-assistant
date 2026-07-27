import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import GoodDetail from './GoodDetail';

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

const mockTowns = [
  {
    id: 'lubeck',
    name: 'Lubecca',
    isRiverTown: false,
    produces: ['beer']
  }
];

const mockFetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('goods.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockGoods,
    });
  }
  if (url.includes('businesses.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockBusinesses,
    });
  }
  if (url.includes('towns.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockTowns,
    });
  }
  return Promise.resolve({
    ok: true,
    json: async () => [],
  });
});
vi.stubGlobal('fetch', mockFetch);

// Mock i18next
const translations: Record<string, string> = {
  'database_goods.back_list': 'Torna al listino',
  'database_goods.not_found': 'Risorsa non trovata'
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      let val = translations[key] || key;
      if (options && typeof options === 'object') {
        Object.keys(options).forEach(k => {
          val = val.replace(`{{${k}}}`, options[k]);
        });
      }
      return val;
    },
    i18n: { language: 'it', changeLanguage: async () => {} }
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('GoodDetail renders details for selected good', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter initialEntries={['/database/goods/beer']}>
        <Routes>
          <Route path="/database/goods/:id" element={<GoodDetail />} />
        </Routes>
      </MemoryRouter>
    </ServicesProvider>
  );

  // Attende che i dati siano caricati e verifica la presenza del pulsante per tornare indietro
  const backLink = await screen.findByText(/Torna al listino/i);
  expect(backLink).toBeDefined();

  // Verifica che vengano renderizzati i dettagli della birra
  const goodName = await screen.findByText(/Birra/i);
  expect(goodName).toBeDefined();
});
