import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import DefaultLayout from './layouts/DefaultLayout';
import Home from './pages/Home';
import { BrowserRouter } from 'react-router-dom';

test('DefaultLayout renders with light parchment background classes', () => {
  const { container } = render(
    <BrowserRouter>
      <DefaultLayout />
    </BrowserRouter>
  );
  const mainDiv = container.firstChild as HTMLElement;
  expect(mainDiv.className).toContain('bg-background');
  expect(mainDiv.className).toContain('text-neutral-dark');
  expect(mainDiv.className).not.toContain('bg-medieval-dark');
});

test('Header and Footer render with theme-compliant classes', () => {
  render(
    <BrowserRouter>
      <DefaultLayout />
    </BrowserRouter>
  );

  // Verifica che l'header non usi la classe scura ma bg-card
  const header = screen.getByRole('banner');
  expect(header.className).toContain('bg-card');
  expect(header.className).toContain('border-primary/20');
  expect(header.className).not.toContain('bg-medieval-slate');

  // Verifica che il footer usi bg-card e border-primary/20
  const footer = screen.getByRole('contentinfo');
  expect(footer.className).toContain('bg-card');
  expect(footer.className).toContain('border-primary/20');
  expect(footer.className).not.toContain('bg-medieval-slate');
});

test('Home renders with parchment cards and secondary buttons', () => {
  const { container } = render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );

  // Verifica il titolo
  const title = container.querySelector('h1');
  expect(title?.className).toContain('text-primary');

  // Verifica la presenza di una card con bg-card e border-primary/20
  const card = container.querySelector('.bg-card');
  expect(card).toBeDefined();
  expect(card?.className).toContain('border-primary/20');
  expect(card?.className).not.toContain('bg-medieval-slate');

  // Verifica che i bottoni usino bg-secondary
  const button = container.querySelector('a');
  expect(button?.className).toContain('bg-secondary');
  expect(button?.className).toContain('text-neutral-dark');
  expect(button?.className).not.toContain('bg-medieval-gold');
});
