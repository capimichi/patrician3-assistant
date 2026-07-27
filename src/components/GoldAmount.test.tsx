import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GoldAmount } from './GoldAmount';

test('renders amount and gold icon', () => {
  render(<GoldAmount amount={150} />);
  expect(screen.getByText('150')).toBeDefined();
  const img = screen.getByRole('img');
  expect(img.getAttribute('src')).toBe('/images/gold.png');
});
