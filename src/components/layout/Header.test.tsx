import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import Header from './Header';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'it', changeLanguage: async () => {} }
  })
}));

test('Header renders navigation items for goods and businesses', () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  // Trova e clicca sul pulsante del database per aprire il menu
  const dbButton = screen.getByRole('button', { name: /header.database/i });
  fireEvent.click(dbButton);

  // Ora i link all'interno del menu a tendina dovrebbero essere visualizzati
  const goodsLinks = screen.getAllByText('header.goods');
  const businessesLinks = screen.getAllByText('header.businesses');
  expect(goodsLinks.length).toBeGreaterThan(0);
  expect(businessesLinks.length).toBeGreaterThan(0);
});
