import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import TownDetail from './TownDetail';

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
const translations: Record<string, string> = {
  'database_towns.columns.coordinates': 'Coordinate',
  'database_towns.back_list': 'Torna alle città',
  'database_towns.not_found': 'Città non trovata'
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

test('TownDetail loads and displays a town details successfully', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter initialEntries={['/database/towns/lubeck']}>
        <Routes>
          <Route path="/database/towns/:id" element={<TownDetail />} />
        </Routes>
      </MemoryRouter>
    </ServicesProvider>
  );

  // Attende caricamento del titolo
  const title = await screen.findByRole('heading', { name: 'Lubecca (Lübeck)', level: 1 });
  expect(title).toBeDefined();

  // Verifica presenza coordinate
  expect(screen.getByText(/Coordinate: X=300, Y=420/i)).toBeDefined();

  // Verifica le merci prodotte
  expect(screen.getByText('Birra')).toBeDefined();
  expect(screen.getByText('Grano')).toBeDefined();
});
