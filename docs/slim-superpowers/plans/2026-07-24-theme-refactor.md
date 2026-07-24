# Refactoring Tema Grafico e Colori Semantici Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Riprogettare il tema grafico di Patrician 3 Assistant da scuro a chiaro stile pergamena medievale, ristrutturando la palette colori di Tailwind su nomi semantici standard per migliorare la manutenibilità.

**Architecture:** La palette di colori in `tailwind.config.js` verrà estesa con i colori `primary` (marrone), `secondary` (giallo oro), `background` (pergamena chiara), `card` (sabbia medio) e `neutral-dark` (testo scuro). Verranno poi progressivamente aggiornati tutti i componenti React sostituendo le vecchie classi medievali-dark/slate/gold con le nuove classi semantiche, garantendo il corretto contrasto per i testi.

**Tech Stack:** React 19, Tailwind CSS v3, TypeScript, Lucide React, Vitest, React Testing Library.

## Global Constraints

- **Colori esatti**: primary (`#643518`), secondary (`#EABE32`), background (`#F5F2EB`), card (`#DFD9C0`), neutral-dark (`#1E1B15`), success (`#15803d`), danger (`#dc2626`).
- **Testo**: Sempre scuro (`text-neutral-dark`, `text-gray-800` o `text-gray-900`) sullo sfondo chiaro per conformità a contrasto e accessibilità.
- **TDD**: Ogni modifica a file logici o di stile deve essere coperta da un test di fumo o di asserzione classe.

---

### Task 1: Nuovo Design System di Base (Tailwind & CSS)

**Files:**
- Modify: `/Users/michele/Sites/patrician3-assistant/tailwind.config.js`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/index.css`
- Create: `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx`

**Interfaces:**
- Consumes: Nessuna (Configurazione iniziale)
- Produces: Classi semantiche Tailwind (`bg-background`, `text-primary`, `bg-card`, `text-neutral-dark`)

- [ ] **Step 1: Scrivere il test iniziale per verificare le classi base del body**
  Creare `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx` con il test che si aspetta la classe `bg-background` e `text-neutral-dark` nel layout globale o nel body.

```typescript
import React from 'react';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import DefaultLayout from './layouts/DefaultLayout';
import { BrowserRouter } from 'react-router-dom';

test('DefaultLayout renders with light parchment background classes', () => {
  const { container } = render(
    <BrowserRouter>
      <DefaultLayout />
    </BrowserRouter>
  );
  const mainDiv = container.firstChild as HTMLElement;
  // Si aspetta che contenga le nuove classi e NON quelle vecchie
  expect(mainDiv.className).toContain('bg-background');
  expect(mainDiv.className).toContain('text-neutral-dark');
  expect(mainDiv.className).not.toContain('bg-medieval-dark');
});
```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Eseguire il test per assicurarsi che fallisca.
  Run: `npm run test -- src/theme.test.tsx`
  Expected: FAIL (DefaultLayout non ha ancora le nuove classi)

- [ ] **Step 3: Aggiornare tailwind.config.js**
  Modificare `/Users/michele/Sites/patrician3-assistant/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#643518',
        secondary: '#EABE32',
        background: '#F5F2EB',
        card: '#DFD9C0',
        'neutral-dark': '#1E1B15',
        success: '#15803d',
        danger: '#dc2626',
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Aggiornare src/index.css**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    margin: 0;
    background-color: #F5F2EB; /* bg-background */
    color: #1E1B15;            /* text-neutral-dark */
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}
```

- [ ] **Step 5: Aggiornare DefaultLayout.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/layouts/DefaultLayout.tsx` per rimuovere `bg-medieval-dark text-slate-100` e usare `bg-background text-neutral-dark`:

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const DefaultLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-neutral-dark">
      <Header />
      <main className="flex-grow pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
```

- [ ] **Step 6: Eseguire il test per verificare che passi**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: PASS

---

### Task 2: Refactoring di Header e Footer

**Files:**
- Modify: `/Users/michele/Sites/patrician3-assistant/src/components/layout/Header.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/components/layout/Footer.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx`

**Interfaces:**
- Consumes: Classi semantiche del Task 1
- Produces: Header e Footer chiari, con contrasto testo conforme

- [ ] **Step 1: Aggiungere il test di rendering per Header e Footer**
  Estendere `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx` con i controlli delle classi nell'Header e Footer:

```typescript
import { screen } from '@testing-library/react';

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
```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: FAIL (Header e Footer usano ancora bg-medieval-slate)

- [ ] **Step 3: Aggiornare Footer.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/components/layout/Footer.tsx` per cambiare lo sfondo in `bg-card`, la scritta secondaria a `text-gray-600` e il bordo a `border-primary/20`:

```typescript
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-primary/20 py-4 text-center mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-gray-700 text-sm">
        <p className="font-serif tracking-wider text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
          🏰 Lega Anseatica — Patrician III Assistant © 2026
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Progettato per la pianificazione e l'ottimizzazione commerciale dell'impero dei mari.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
```

- [ ] **Step 4: Aggiornare Header.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/components/layout/Header.tsx`. Sostituire:
  - `bg-medieval-slate` con `bg-card`
  - `border-medieval-gold/30` con `border-primary/20`
  - `text-medieval-gold` con `text-primary` per il logo e link attivi
  - `text-gray-300` con `text-gray-700` per i link normali
  - `hover:text-medieval-gold` con `hover:text-primary`
  - `bg-medieval-dark/50` con `bg-background` per lo stato attivo dei link
  - `bg-medieval-dark` con `bg-background` per gli hover nel dropdown
  - Aggiornare tutti i riferimenti di colore vecchio nei menu mobile e desktop.
  Ecco il codice modificato per la parte del render di `Header.tsx`:

```typescript
  return (
    <header className="bg-card border-b border-primary/20 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Titolo */}
          <Link to="/" className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-xl font-bold tracking-wider text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
              Patrician III Assistant
            </span>
          </Link>

          {/* Navigazione Desktop */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary bg-background' : 'text-gray-700 hover:text-primary'
              }`}
            >
              {t('header.home')}
            </Link>

            {/* Dropdown Database */}
            <div className="relative" ref={dbRef}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'db' ? null : 'db')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/database') ? 'text-primary' : 'text-gray-700 hover:text-primary'
                }`}
              >
                <span>{t('header.database')}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {activeDropdown === 'db' && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-primary/20 ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      to="/database/goods"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.goods')}
                    </Link>
                    <Link
                      to="/database/towns"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.towns')}
                    </Link>
                    <Link
                      to="/database/buildings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.buildings')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Calcolatori */}
            <div className="relative" ref={calcRef}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'calc' ? null : 'calc')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/calculators') ? 'text-primary' : 'text-gray-700 hover:text-primary'
                }`}
              >
                <span>{t('header.calculators')}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {activeDropdown === 'calc' && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-primary/20 ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      to="/calculators/production"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.production')}
                    </Link>
                    <Link
                      to="/calculators/routes"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.routes')}
                    </Link>
                    <Link
                      to="/calculators/convoy"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.convoy')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Selettore Lingua */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary transition-colors border border-primary/20 hover:border-primary/50"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{i18n.language}</span>
            </button>
          </nav>

          {/* Hamburger Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-md text-gray-700 hover:text-primary border border-primary/20"
            >
              <span className="uppercase text-xs font-bold">{i18n.language}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary hover:bg-background/50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigazione Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-primary/20 px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-background/50"
          >
            {t('header.home')}
          </Link>
          <div className="px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            {t('header.database')}
          </div>
          <Link
            to="/database/goods"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.goods')}
          </Link>
          <Link
            to="/database/towns"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.towns')}
          </Link>
          <Link
            to="/database/buildings"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.buildings')}
          </Link>
          <div className="px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mt-2">
            {t('header.calculators')}
          </div>
          <Link
            to="/calculators/production"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.production')}
          </Link>
          <Link
            to="/calculators/routes"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.routes')}
          </Link>
          <Link
            to="/calculators/convoy"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.convoy')}
          </Link>
        </div>
      )}
    </header>
  );
```

- [ ] **Step 5: Eseguire il test per verificare che passi**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: PASS

---

### Task 3: Refactoring della Dashboard (Home)

**Files:**
- Modify: `/Users/michele/Sites/patrician3-assistant/src/pages/Home.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx`

**Interfaces:**
- Consumes: Nuovi stili e componenti Header/Footer
- Produces: Dashboard chiara coerente con il tema pergamena e bottoni dorati

- [ ] **Step 1: Aggiungere il test per la Home**
  Estendere `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx` con test per la pagina Home:

```typescript
import Home from './pages/Home';

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
```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: FAIL (Home usa ancora bg-medieval-slate e bg-medieval-gold)

- [ ] **Step 3: Aggiornare Home.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/pages/Home.tsx`:
  - Cambiare `text-medieval-gold` in `text-primary` per titoli e icone.
  - Sostituire `bg-medieval-slate` con `bg-card`.
  - Sostituire `border-medieval-gold/20` o `/10` con `border-primary/20` o `border-primary/10`.
  - Sostituire `hover:border-medieval-gold/50` con `hover:border-primary/50`.
  - Cambiare il testo `text-gray-400` in `text-gray-700` per migliorare la leggibilità sullo sfondo chiaro.
  - Sostituire `bg-medieval-gold hover:bg-medieval-goldLight text-medieval-dark` con `bg-secondary hover:bg-secondary/90 text-neutral-dark`.
  - Sostituire `bg-medieval-slate/40` con `bg-card/60`.

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Factory, Landmark, Anchor, Compass } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 py-4 text-neutral-dark">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wider text-primary uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
          {t('home.welcome')}
        </h1>
        <p className="text-xl text-gray-700 font-medium tracking-wide">
          {t('home.subtitle')}
        </p>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        <p className="max-w-2xl mx-auto text-gray-700 leading-relaxed pt-2">
          {t('home.desc')}
        </p>
      </div>

      {/* Grid delle funzionalità principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {/* Calcolatore Produzione */}
        <div className="bg-card border border-primary/20 rounded-lg p-6 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('header.production')}
              </h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {t('home.production_card')}
            </p>
          </div>
          <Link
            to="/calculators/production"
            className="w-full text-center bg-secondary hover:bg-secondary/90 text-neutral-dark font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Apri Strumento
          </Link>
        </div>

        {/* Ottimizzatore Rotte */}
        <div className="bg-card border border-primary/20 rounded-lg p-6 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('header.routes')}
              </h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {t('home.routes_card')}
            </p>
          </div>
          <Link
            to="/calculators/routes"
            className="w-full text-center bg-secondary hover:bg-secondary/90 text-neutral-dark font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Apri Strumento
          </Link>
        </div>

        {/* Gestore Convogli */}
        <div className="bg-card border border-primary/20 rounded-lg p-6 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Anchor className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('header.convoy')}
              </h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {t('home.convoy_card')}
            </p>
          </div>
          <Link
            to="/calculators/convoy"
            className="w-full text-center bg-secondary hover:bg-secondary/90 text-neutral-dark font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Apri Strumento
          </Link>
        </div>
      </div>

      {/* Sezione Statistiche Rapide della Lega Anseatica */}
      <div className="bg-card/40 border border-primary/10 rounded-lg p-8 mt-12 text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-4">
          <Landmark className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-primary mb-2 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
          Lega Anseatica (Hanseatic League)
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed max-w-2xl mx-auto">
          La Lega Anseatica fu un'alleanza commerciale di corporazioni e di città della Germania settentrionale e dell'Europa baltica che monopolizzò i commerci nel Nord Europa dal tardo Medioevo fino agli albori dell'era moderna. In Patrician III, il tuo obiettivo è scalare la piramide sociale da semplice Commerciante a Sindaco ed infine a Governatore della Lega.
        </p>
      </div>
    </div>
  );
};

export default Home;
```

- [ ] **Step 4: Eseguire il test per verificare che passi**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: PASS

---

### Task 4: Refactoring delle Pagine Database (Città, Edifici, Merci & Imprese)

**Files:**
- Modify: `/Users/michele/Sites/patrician3-assistant/src/pages/database/Towns.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/pages/database/Buildings.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/pages/database/GoodsAndBusinesses.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx`

**Interfaces:**
- Consumes: Nuovi stili del tema chiaro
- Produces: Tabelle e pannelli del database con contrasto leggibile e stile coerente

- [ ] **Step 1: Aggiungere il test di rendering per le pagine del database**
  Estendere `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx` per importare e testare Towns, Buildings e GoodsAndBusinesses:

```typescript
import Towns from './pages/database/Towns';
import Buildings from './pages/database/Buildings';
import GoodsAndBusinesses from './pages/database/GoodsAndBusinesses';
import { ServicesProvider } from './servicesContext';

test('Database pages render with theme-compliant classes', () => {
  const renderWithServices = (ui: React.ReactNode) => {
    return render(<ServicesProvider>{ui}</ServicesProvider>);
  };

  const { container: townsContainer } = renderWithServices(<Towns />);
  expect(townsContainer.querySelector('.bg-card')).toBeDefined();
  expect(townsContainer.querySelector('h1')?.className).toContain('text-primary');

  const { container: buildingsContainer } = renderWithServices(<Buildings />);
  expect(buildingsContainer.querySelector('.bg-card')).toBeDefined();

  const { container: goodsContainer } = renderWithServices(<GoodsAndBusinesses />);
  expect(goodsContainer.querySelector('.bg-card')).toBeDefined();
});
```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: FAIL (Towns, Buildings o GoodsAndBusinesses contengono vecchi riferimenti a medieval-slate o simili)

- [ ] **Step 3: Aggiornare Towns.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/pages/database/Towns.tsx` per cambiare:
  - `bg-medieval-slate` $\to$ `bg-card`
  - `bg-medieval-dark` $\to$ `bg-background`
  - `text-medieval-gold` $\to$ `text-primary` (titoli) o `text-secondary` (dettagli oro)
  - Modificare i selettori e i testi `text-gray-400`/`text-gray-300` a `text-gray-700`/`text-gray-800`.
  - Gli input `<select>` e `<input>` devono avere `bg-white border-primary/20 text-neutral-dark focus:border-primary focus:ring-primary`.
  - Gli header delle tabelle `thead` devono avere `bg-primary/10 text-primary`.

- [ ] **Step 4: Aggiornare Buildings.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/pages/database/Buildings.tsx` seguendo le stesse regole del punto 3 (sostituzione delle classi medievali con quelle semantiche, bordi, testi scuri).

- [ ] **Step 5: Aggiornare GoodsAndBusinesses.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/pages/database/GoodsAndBusinesses.tsx` seguendo le stesse regole (sostituzione delle tabelle, pannelli laterali e selettori con i colori semantici chiari).

- [ ] **Step 6: Eseguire il test per verificare che passi**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: PASS

---

### Task 5: Refactoring del Calcolatore di Produzione

**Files:**
- Modify: `/Users/michele/Sites/patrician3-assistant/src/pages/calculators/Production.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx`

**Interfaces:**
- Consumes: Tipi, servizi e stili di configurazione
- Produces: Calcolatore di Produzione con layout chiaro pergamena e cruscotto bilancio leggibile

- [ ] **Step 1: Aggiungere il test di rendering per il calcolatore di produzione**
  Estendere `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx` per testare Production:

```typescript
import Production from './pages/calculators/Production';

test('Production page renders with theme-compliant classes', () => {
  const { container } = render(
    <ServicesProvider>
      <Production />
    </ServicesProvider>
  );
  expect(container.querySelector('h1')?.className).toContain('text-primary');
  expect(container.querySelector('.bg-card')).toBeDefined();
});
```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: FAIL

- [ ] **Step 3: Aggiornare Production.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/pages/calculators/Production.tsx` per sostituire:
  - `bg-medieval-slate` $\to$ `bg-card`
  - `bg-medieval-dark` $\to$ `bg-background`
  - `border-medieval-gold/30` o `/20` $\to$ `border-primary/20`
  - `text-medieval-gold` $\to$ `text-primary` per titoli e `text-secondary` per icone
  - Sostituire i testi grigi chiari (`text-gray-400`/`300`) con `text-gray-700`/`800`.
  - Gli input numerici devono avere sfondo bianco `bg-white`, bordo `border-primary/20` e testo scuro.
  - I pulsanti di eliminazione o aggiunta devono essere resi visibili e con colori adeguati (es. `bg-secondary` o pulsanti outline `border-primary text-primary`).
  - Assicurarsi che i badge di profitto/deficit utilizzino `text-success` e `text-danger`.

- [ ] **Step 4: Eseguire il test per verificare che passi**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: PASS

---

### Task 6: Refactoring del Calcolatore di Rotte

**Files:**
- Modify: `/Users/michele/Sites/patrician3-assistant/src/pages/calculators/Routes.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx`

**Interfaces:**
- Consumes: Tipi, servizi e stili
- Produces: Ottimizzatore di Rotte con tabelle di acquisto/vendita leggibili e selettori chiari

- [ ] **Step 1: Aggiungere il test di rendering per il calcolatore delle rotte**
  Estendere `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx` per testare Routes:

```typescript
import Routes from './pages/calculators/Routes';

test('Routes page renders with theme-compliant classes', () => {
  const { container } = render(
    <ServicesProvider>
      <Routes />
    </ServicesProvider>
  );
  expect(container.querySelector('h1')?.className).toContain('text-primary');
  expect(container.querySelector('.bg-card')).toBeDefined();
});
```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: FAIL

- [ ] **Step 3: Aggiornare Routes.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/pages/calculators/Routes.tsx`:
  - Sostituire le classi scure medievali con `bg-card` per i pannelli e `bg-background` per le righe alternate delle tabelle.
  - Impostare il colore del testo a `text-neutral-dark` (o `text-gray-900`) e `text-gray-700` per i sottotitoli.
  - Cambiare i colori di sfondo dei selettori delle città in `bg-white border-primary/20 text-neutral-dark`.
  - Assicurarsi che i prezzi di acquisto consigliati e di vendita usino i colori `text-success` e `text-danger` in modo leggibile.

- [ ] **Step 4: Eseguire il test per verificare che passi**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: PASS

---

### Task 7: Refactoring del Gestore Convogli

**Files:**
- Modify: `/Users/michele/Sites/patrician3-assistant/src/pages/calculators/Convoy.tsx`
- Modify: `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx`

**Interfaces:**
- Consumes: Tipi e stili
- Produces: Convoy Manager con resoconto stiva, armi e costi su tema chiaro pergamena

- [ ] **Step 1: Aggiungere il test di rendering per il calcolatore convogli**
  Estendere `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx` per testare Convoy:

```typescript
import Convoy from './pages/calculators/Convoy';

test('Convoy page renders with theme-compliant classes', () => {
  const { container } = render(
    <ServicesProvider>
      <Convoy />
    </ServicesProvider>
  );
  expect(container.querySelector('h1')?.className).toContain('text-primary');
  expect(container.querySelector('.bg-card')).toBeDefined();
});
```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: FAIL

- [ ] **Step 3: Aggiornare Convoy.tsx**
  Modificare `/Users/michele/Sites/patrician3-assistant/src/pages/calculators/Convoy.tsx` per cambiare:
  - `bg-medieval-slate` $\to$ `bg-card`
  - `bg-medieval-dark` $\to$ `bg-background`
  - Sostituire bordi e testi chiari con marrone/nero a contrasto elevato.
  - Sostituire bottoni di armamento e incremento navi con pulsanti compatibili con la nuova palette (es. `bg-secondary` o bordati).
  - Assicurarsi che gli alert per navi fluviali e restrizioni siano ben evidenziati con sfondi colorati a basso contrasto pergamena (es. `bg-yellow-100 text-yellow-800` o `bg-red-100 text-red-800` anziché stili scuri).

- [ ] **Step 4: Eseguire il test per verificare che passi**
  Run: `npm run test -- src/theme.test.tsx`
  Expected: PASS

---

### Task 8: Test Finale del Progetto ed Eliminazione del File Temporaneo di Test

**Files:**
- Modify: `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx` (Eliminazione)

**Interfaces:**
- Consumes: Nessuna
- Produces: Build e test suites pulite e funzionanti

- [ ] **Step 1: Eseguire l'intera suite di test del progetto**
  Verificare che tutti i test dell'app passino correttamente.
  Run: `npm run test`
  Expected: PASS su tutti i test (inclusi smoke e useServices)

- [ ] **Step 2: Provare a compilare l'applicazione**
  Eseguire la build di produzione per assicurarsi che TypeScript e il bundler Vite non segnalino errori.
  Run: `npm run build`
  Expected: Successo nella compilazione (produzione dei file in `dist/`)

- [ ] **Step 3: Rimuovere il file di test temporaneo**
  Per mantenere pulito il codice, elimineremo il file `theme.test.tsx` creato per le asserzioni di refactoring grafico, una volta completato con successo l'adeguamento visivo.
  Eliminare `/Users/michele/Sites/patrician3-assistant/src/theme.test.tsx`.
