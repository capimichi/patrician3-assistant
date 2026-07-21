import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { ServicesProvider } from '../servicesContext';
import DefaultLayout from './DefaultLayout';

// Mock di react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'it', changeLanguage: async () => {} }
  })
}));

test('DefaultLayout renders header with application title', () => {
  render(
    <ServicesProvider>
      <MemoryRouter>
        <DefaultLayout />
      </MemoryRouter>
    </ServicesProvider>
  );
  const titles = screen.getAllByText(/Patrician III Assistant/i);
  expect(titles.length).toBeGreaterThan(0);
});
