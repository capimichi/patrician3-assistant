import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import BusinessDetail from './BusinessDetail';

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

const mockTowns = [
  {
    id: 'lubeck',
    name: 'Lubecca (Lübeck)',
    isRiverTown: false,
    produces: ['beer', 'grain'],
    coordinate: { x: 300, y: 420 }
  }
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
  if (url.includes('towns.json')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockTowns,
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});
vi.stubGlobal('fetch', mockFetch);

const translations: Record<string, string> = {
  'production.day': 'giorno',
  'database_businesses.back_list': 'Torna alle imprese',
  'database_businesses.not_found': 'Impresa non trovata'
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

test('BusinessDetail loads and displays business details and producing towns successfully', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter initialEntries={['/database/businesses/brewery']}>
        <Routes>
          <Route path="/database/businesses/:id" element={<BusinessDetail />} />
        </Routes>
      </MemoryRouter>
    </ServicesProvider>
  );

  // Attende caricamento del titolo dell'impresa
  const title = await screen.findByRole('heading', { name: 'Birreria', level: 2 });
  expect(title).toBeDefined();

  // Verifica consumi (inputs)
  expect(screen.getByText('Grano')).toBeDefined();
  expect(screen.getByText(/-0.5 \/giorno/i)).toBeDefined();

  // Verifica costi
  expect(screen.getByText('12000')).toBeDefined();
  expect(screen.getByText('40')).toBeDefined();
  expect(screen.getByText('20')).toBeDefined();

  // Verifica città di produzione calcolate dinamicamente
  expect(screen.getByText('Lubecca (Lübeck)')).toBeDefined();
});
