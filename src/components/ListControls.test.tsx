import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ListControls } from './ListControls';

test('ListControls renders input with placeholder, triggers change callback, and renders rightActions', () => {
  const handleSearchChange = vi.fn();
  
  render(
    <ListControls
      searchValue=""
      onSearchChange={handleSearchChange}
      placeholder="Cerca elemento..."
      rightActions={<button data-testid="right-btn">Colonne</button>}
    />
  );

  const input = screen.getByPlaceholderText('Cerca elemento...') as HTMLInputElement;
  expect(input).toBeDefined();

  fireEvent.change(input, { target: { value: 'Lubecca' } });
  expect(handleSearchChange).toHaveBeenCalledWith('Lubecca');

  const rightBtn = screen.getByTestId('right-btn');
  expect(rightBtn).toBeDefined();
});
