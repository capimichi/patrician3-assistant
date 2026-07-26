# Riorganizzazione Database: Liste Tabellari e Dettaglio Città/Imprese - Piano di Implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementare visualizzazioni tabellari con colonne personalizzabili (salvate in localStorage) e rotte dedicate per i dettagli sia per le Città (Towns) che per le Imprese (Businesses).

**Architecture:** Modifica del routing tramite React Router per aggiungere le pagine `/database/towns/:id` e `/database/businesses/:id`. Spostamento delle viste master-detail ad architettura basata su rotte separate, migliorando la coesione e modularità dei componenti React.

**Tech Stack:** React 19, React Router DOM v7, Tailwind CSS v3, i18next, Lucide React.

## Global Constraints
- Tutte le modifiche al codice devono mantenere la compatibilità con TypeScript ed evitare tipi `any` non necessari.
- Le traduzioni per l'interfaccia devono essere configurate correttamente in italiano e inglese.
- Non introdurre librerie esterne non presenti in `package.json`.
- I test di unità devono essere scritti con Vitest e React Testing Library per ogni nuova pagina/componente.

---

### Task 1: Modifiche Globali (Rotte, Navigazione e i18n)

**Files:**
- Modify: `src/i18n.ts`
- Modify: `src/router.tsx`
- Modify: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Header.test.tsx`

**Interfaces:**
- Consumes: `src/router.tsx` per definire i componenti da mappare.
- Produces: Nuove rotte e voci di menu per `TownsList`, `TownDetail`, `BusinessesList`, `BusinessDetail`.

- [ ] **Step 1: Aggiornare le chiavi di traduzione in `src/i18n.ts`**
  Modificare le etichette per separare merci ed imprese.
  ```typescript
  // In src/i18n.ts
  // Per 'it':
  header: {
    ...
    goods: "Merci",
    businesses: "Imprese",
    ...
  }
  // Per 'en':
  header: {
    ...
    goods: "Goods",
    businesses: "Businesses",
    ...
  }
  ```

- [ ] **Step 2: Aggiornare l'Header in `src/components/layout/Header.tsx`**
  Modificare il dropdown del database per visualizzare sia "Merci" che "Imprese".
  ```tsx
  // In src/components/layout/Header.tsx (intorno alle righe 87-106)
  <div className="py-1">
    <Link
      to="/database/goods"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
    >
      {t('header.goods')}
    </Link>
    <Link
      to="/database/businesses"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
    >
      {t('header.businesses')}
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
  ```
  *(Nota: Aggiornare anche il menu mobile intorno alla riga 189 per includere il link delle imprese).*

- [ ] **Step 3: Configurare le nuove rotte in `src/router.tsx`**
  Riorganizzare le importazioni e mappare i nuovi percorsi.
  ```typescript
  import TownsList from './pages/database/TownsList';
  import TownDetail from './pages/database/TownDetail';
  import BusinessesList from './pages/database/BusinessesList';
  import BusinessDetail from './pages/database/BusinessDetail';

  // Nel router:
  {
    path: 'database/towns',
    element: <TownsList />
  },
  {
    path: 'database/towns/:id',
    element: <TownDetail />
  },
  {
    path: 'database/businesses',
    element: <BusinessesList />
  },
  {
    path: 'database/businesses/:id',
    element: <BusinessDetail />
  }
  ```

- [ ] **Step 4: Scrivere un test di unità per l'Header**
  Creare `src/components/layout/Header.test.tsx` per verificare la presenza dei nuovi link.
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { MemoryRouter } from 'react-router-dom';
  import { expect, test, vi } from 'vitest';
  import Header from './Header';

  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'it', changeLanguage: async () => {} }
    })
  }));

  test('Header renders new navigation items for goods and businesses', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryAllByText(/header.goods/i)).toBeDefined();
    expect(screen.queryAllByText(/header.businesses/i)).toBeDefined();
  });
  ```

- [ ] **Step 5: Eseguire i test globali**
  Eseguire: `npm test`
  Expected: I test esistenti ed il nuovo test dell'Header devono passare.

---

### Task 2: Tabella delle Città (TownsList)

**Files:**
- Create: `src/pages/database/TownsList.tsx`
- Remove: `src/pages/database/Towns.tsx` (rimuovere dopo la creazione di TownsList)
- Create: `src/pages/database/TownsList.test.tsx`

**Interfaces:**
- Consumes: `townService.getTowns()` per caricare la lista delle città.
- Produces: Schermata tabellare con colonne personalizzabili e salvataggio in `localStorage` sotto la chiave `patrician3_towns_columns`.

- [ ] **Step 1: Creare il componente `src/pages/database/TownsList.tsx`**
  Implementare la struttura tabellare con i campi: Nome, Tipo Porto, Specializzazioni (mostrando icone delle merci se disponibili), Numero Specializzazioni, Coordinate.
  ```tsx
  import React, { useState, useEffect, useRef } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useTranslation } from 'react-i18next';
  import { useServices } from '../../servicesContext';
  import { SlidersHorizontal, ArrowRight, Compass } from 'lucide-react';
  import { getGoodImagePath } from '../../utils/goodImage';
  import type { Town } from '../../types';

  const ALL_COLUMNS = [
    { id: 'type', labelIt: 'Tipo Porto', labelEn: 'Port Type' },
    { id: 'produces', labelIt: 'Specializzazioni', labelEn: 'Specializations' },
    { id: 'specCount', labelIt: 'N. Specializzazioni', labelEn: 'Spec. Count' },
    { id: 'coordinates', labelIt: 'Coordinate', labelEn: 'Coordinates' }
  ];

  const TownsList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { townService, goodService } = useServices();
    const navigate = useNavigate();

    const [towns, setTowns] = useState<Town[]>([]);
    const [goods, setGoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

    useEffect(() => {
      const saved = localStorage.getItem('patrician3_towns_columns');
      if (saved) {
        try {
          setVisibleColumns(JSON.parse(saved));
        } catch {
          setVisibleColumns(ALL_COLUMNS.map(c => c.id));
        }
      } else {
        setVisibleColumns(ALL_COLUMNS.map(c => c.id));
      }

      const loadData = async () => {
        setLoading(true);
        try {
          const loadedTowns = await townService.getTowns();
          const loadedGoods = await goodService.getGoods(currentLang);
          setTowns(loadedTowns);
          setGoods(loadedGoods);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [townService, goodService, currentLang]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleColumn = (columnId: string) => {
      let updated = visibleColumns.includes(columnId)
        ? visibleColumns.filter(id => id !== columnId)
        : [...visibleColumns, columnId];
      setVisibleColumns(updated);
      localStorage.setItem('patrician3_towns_columns', JSON.stringify(updated));
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
      <div className="space-y-6 text-neutral-dark">
        {/* Renderizzare intestazione con titolo "Database Città dell'Hansa" */}
        {/* Renderizzare bottone Colonne con dropdown checkbox per le colonne */}
        {/* Renderizzare tabella */}
      </div>
    );
  };
  export default TownsList;
  ```

- [ ] **Step 2: Scrivere il test per `TownsList` in `src/pages/database/TownsList.test.tsx`**
  ```tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import { MemoryRouter } from 'react-router-dom';
  import { expect, test, vi, beforeEach } from 'vitest';
  import { ServicesProvider } from '../../servicesContext';
  import TownsList from './TownsList';

  // Mock localStorage, fetch, e i18n come in GoodsList.test.tsx
  ```

- [ ] **Step 3: Rimuovere il vecchio file `src/pages/database/Towns.tsx`**
  Rimuovere o rinominare il vecchio file per evitare collisioni e confusione.

- [ ] **Step 4: Eseguire i test di verifica**
  Run: `npm test`
  Expected: PASS

---

### Task 3: Dettaglio Città (TownDetail)

**Files:**
- Create: `src/pages/database/TownDetail.tsx`
- Create: `src/pages/database/TownDetail.test.tsx`

**Interfaces:**
- Consumes: `townService.getTownById(id)` per estrarre la città dalla rotta.
- Produces: Pagina di dettaglio con le specifiche di porto, restrizioni fluviali e merci prodotte.

- [ ] **Step 1: Creare il componente `src/pages/database/TownDetail.tsx`**
  Utilizzare `useParams` per estrarre l'ID della città, caricare le informazioni ed elencare le merci prodotte cliccabili.
  ```tsx
  import React, { useState, useEffect } from 'react';
  import { useParams, Link, useNavigate } from 'react-router-dom';
  import { useTranslation } from 'react-i18next';
  import { useServices } from '../../servicesContext';
  import { ArrowLeft, MapPin, Waves, AlertTriangle, CheckCircle2 } from 'lucide-react';
  import { getGoodImagePath } from '../../utils/goodImage';
  import type { Town } from '../../types';

  const TownDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const { townService, goodService } = useServices();
    const navigate = useNavigate();

    const [town, setTown] = useState<Town | null>(null);
    const [goods, setGoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

    useEffect(() => {
      const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
          const loadedTown = await townService.getTownById(id);
          const loadedGoods = await goodService.getGoods(currentLang);
          setTown(loadedTown || null);
          setGoods(loadedGoods);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [id, townService, goodService, currentLang]);

    if (loading) return <div>{t('common.loading')}</div>;
    if (!town) return <div>Città non trovata</div>;

    return (
      <div className="space-y-6 text-neutral-dark">
        {/* Pulsante Torna alle città */}
        {/* Header con coordinate e badge Porto Marittimo/Fluviale */}
        {/* Box Avviso Restrizioni Fluviali (se isRiverTown è true) */}
        {/* Griglia delle specializzazioni prodotte (con link di navigazione a /database/goods/:goodId) */}
        {/* Box info sulla penalità di produzione del 25% */}
      </div>
    );
  };
  export default TownDetail;
  ```

- [ ] **Step 2: Scrivere il test per `TownDetail` in `src/pages/database/TownDetail.test.tsx`**
  Verificare il caricamento corretto dei dati e la visibilità degli avvisi sul porto fluviale.

---

### Task 4: Tabella delle Imprese (BusinessesList)

**Files:**
- Create: `src/pages/database/BusinessesList.tsx`
- Create: `src/pages/database/BusinessesList.test.tsx`

**Interfaces:**
- Consumes: `businessService.getBusinesses(lang)` per caricare tutte le attività industriali.
- Produces: Vista tabellare delle imprese con colonne configurabili salvate in `localStorage` con la chiave `patrician3_businesses_columns`.

- [ ] **Step 1: Creare il componente `src/pages/database/BusinessesList.tsx`**
  Creare l'elenco tabellare delle imprese. Visualizzare Nome, Bene Prodotto, Produzione/Giorno, Manutenzione, Consumi/Giorno, Lavoratori e Costi.
  ```tsx
  import React, { useState, useEffect, useRef } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useTranslation } from 'react-i18next';
  import { useServices } from '../../servicesContext';
  import { SlidersHorizontal, ArrowRight, Hammer } from 'lucide-react';
  import { getGoodImagePath } from '../../utils/goodImage';

  const ALL_COLUMNS = [
    { id: 'product', labelIt: 'Bene Prodotto', labelEn: 'Produced Good' },
    { id: 'production', labelIt: 'Produzione', labelEn: 'Production' },
    { id: 'maintenance', labelIt: 'Manutenzione/G.', labelEn: 'Maintenance/D.' },
    { id: 'inputs', labelIt: 'Materie Prime', labelEn: 'Raw Materials' },
    { id: 'workers', labelIt: 'Lavoratori', labelEn: 'Workers' },
    { id: 'cost', labelIt: 'Costi Edificazione', labelEn: 'Build Cost' }
  ];

  const BusinessesList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { businessService, goodService } = useServices();
    const navigate = useNavigate();

    const [businesses, setBusinesses] = useState<any[]>([]);
    const [goods, setGoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

    useEffect(() => {
      const saved = localStorage.getItem('patrician3_businesses_columns');
      if (saved) {
        try {
          setVisibleColumns(JSON.parse(saved));
        } catch {
          setVisibleColumns(ALL_COLUMNS.map(c => c.id));
        }
      } else {
        setVisibleColumns(ALL_COLUMNS.map(c => c.id));
      }

      const loadData = async () => {
        setLoading(true);
        try {
          const loadedB = await businessService.getBusinesses(currentLang);
          const loadedG = await goodService.getGoods(currentLang);
          setBusinesses(loadedB);
          setGoods(loadedG);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [businessService, goodService, currentLang]);

    // Aggiungere logica di toggleColumn, handleClickOutside e rendering UI...
  ```

- [ ] **Step 2: Scrivere il test per `BusinessesList` in `src/pages/database/BusinessesList.test.tsx`**
  Mockare i dati delle imprese e validare il comportamento del toggle delle colonne e il redirect all'ID.

---

### Task 5: Dettaglio Impresa (BusinessDetail)

**Files:**
- Create: `src/pages/database/BusinessDetail.tsx`
- Create: `src/pages/database/BusinessDetail.test.tsx`

**Interfaces:**
- Consumes: `businessService.getBusinessById(id, lang)` e `townService.getTowns()` per la mappatura geografica.
- Produces: Scheda informativa con costi di edificazione, materie prime (cliccabili) e geolocalizzazione ideale nell'Hansa (città in cui produrre al 100% di rendimento).

- [ ] **Step 1: Creare il componente `src/pages/database/BusinessDetail.tsx`**
  ```tsx
  import React, { useState, useEffect } from 'react';
  import { useParams, Link } from 'react-router-dom';
  import { useTranslation } from 'react-i18next';
  import { useServices } from '../../servicesContext';
  import { ArrowLeft, Hammer, Landmark, Coins, Users, Sparkles } from 'lucide-react';
  import { getGoodImagePath } from '../../utils/goodImage';

  const BusinessDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const { businessService, goodService, townService } = useServices();

    const [business, setBusiness] = useState<any | null>(null);
    const [goodsList, setGoodsList] = useState<any[]>([]);
    const [producingTowns, setProducingTowns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

    useEffect(() => {
      const loadDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
          const foundBus = await businessService.getBusinessById(id, currentLang);
          const allGoods = await goodService.getGoods(currentLang);
          const allTowns = await townService.getTowns();

          setBusiness(foundBus || null);
          setGoodsList(allGoods);

          if (foundBus) {
            const prod = allTowns.filter((town: any) => town.produces.includes(foundBus.producedGoodId));
            setProducingTowns(prod);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadDetails();
    }, [id, businessService, goodService, townService, currentLang]);

    if (loading) return <div>{t('common.loading')}</div>;
    if (!business) return <div>Impresa non trovata</div>;

    return (
      <div className="space-y-6 text-neutral-dark">
        {/* Pulsante Torna alle imprese */}
        {/* Header con nome impresa ed icona della merce prodotta */}
        {/* Griglia statistiche: Produzione/g, Manutenzione/g, Lavoratori */}
        {/* Materie Prime Consumate (con link alle merci) o Badge "Produzione Autonoma" */}
        {/* Requisiti di edificazione (Oro, Mattoni, Legno) */}
        {/* Lista Città dell'Hansa adatte alla produzione al 100% (con link a /database/towns/:townId) */}
      </div>
    );
  };
  export default BusinessDetail;
  ```

- [ ] **Step 2: Scrivere il test per `BusinessDetail` in `src/pages/database/BusinessDetail.test.tsx`**
  Assicurarsi che la lista delle città produttrici sia calcolata ed elencata correttamente e che le materie prime consumate siano visualizzate con le quantità attese.

- [ ] **Step 3: Eseguire la suite di test globale**
  Eseguire: `npm test`
  Expected: Tutti i test passano con successo (100% PASS).
