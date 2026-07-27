import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GameIcon } from './GameIcon';

test('renders GameIcon with correct image path and handles error fallback', () => {
  render(<GameIcon type="barrel" alt="Barile" />);
  const img = screen.getByRole('img');
  expect(img.getAttribute('src')).toBe('/images/barrel.png');
  expect(img.getAttribute('alt')).toBe('Barile');

  // Simula errore di caricamento
  fireEvent.error(img);
  expect(img.style.display).toBe('none');
});
