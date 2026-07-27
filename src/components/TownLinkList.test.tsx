import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { TownLinkList } from './TownLinkList';
import type { Town } from '../types';

const mockTowns: Town[] = [
  { id: 'lubeck', name: 'Lubecca', isRiverTown: false, produces: [] },
  { id: 'stettin', name: 'Stettino', isRiverTown: true, produces: [] }
];

test('renders empty message when no towns', () => {
  render(<TownLinkList towns={[]} emptyMessage="Nessuna città" />);
  expect(screen.getByText('Nessuna città')).toBeDefined();
});

test('renders towns as links with river badge', () => {
  render(
    <MemoryRouter>
      <TownLinkList towns={mockTowns} emptyMessage="Nessuna città" variant="grid" />
    </MemoryRouter>
  );
  const lubeckLink = screen.getByText('Lubecca').closest('a');
  expect(lubeckLink?.getAttribute('href')).toBe('/database/towns/lubeck');

  const stettinLink = screen.getByText('Stettino').closest('a');
  expect(stettinLink?.getAttribute('href')).toBe('/database/towns/stettin');
  expect(screen.getByText('Fluviale')).toBeDefined();
});
