# Patrician 3 Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Realizzare un'applicazione web interattiva (React, Vite, TypeScript, Tailwind CSS) che assista i giocatori di Patrician III nella gestione economica tramite un database statico di gioco e calcolatori di produzione, rotte e convogli.

**Architecture:** Struttura frontend a tre livelli (Clients per il fetch dei dati statici JSON -> Services per la business logic localizzata -> React Context & useServices per l'esposizione ai componenti). Interfaccia dark medievale premium con navigazione a schede tramite Top Navigation Bar.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS, react-router-dom, react-i18next, Vitest (per TDD).

## Global Constraints
- Naming ed estensioni: usare rigorosamente TypeScript (`.ts`, `.tsx`).
- Separazione delle responsabilità: i componenti UI non devono contenere calcoli matematici complessi o fetch, ma devono delegare ai rispettivi Services.
- I dati statici devono essere suddivisi in 5 file JSON separati nella cartella `/public/data/` (goods, towns, businesses, ships, buildings) e caricati in modo asincrono tramite i rispettivi Client dedicati.

---

### Task 1: Scaffolding del Progetto
Inizializzazione del progetto con Vite, configurazione di Tailwind CSS, TypeScript, Routing, Internazionalizzazione e Vitest per i test.

**Files:**
- Create: `/package.json`
- Create: `/vite.config.ts`
- Create: `/tsconfig.json`
- Create: `/tailwind.config.js`
- Create: `/postcss.config.js`
- Create: `/src/index.css`
- Create: `/src/main.tsx`
- Create: `/src/App.tsx`
- Create: `/vitest.config.ts`

**Interfaces:**
- Produces: Progetto configurato e pronto per la compilazione, esecuzione dei test e server di sviluppo.

- [ ] **Step 1: Scrivere il package.json**
Creare `/package.json` includendo le dipendenze per React, Tailwind CSS, react-router-dom, react-i18next e vitest.
```json
{
  "name": "patrician3-assistant",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.0",
    "react-i18next": "^16.0.0",
    "i18next": "^24.0.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vitest": "^2.0.0",
    "jsdom": "^24.0.0",
    "@testing-library/react": "^16.0.0"
  }
}
```

- [ ] **Step 2: Scrivere la configurazione di Vite e Vitest**
Creare `/vite.config.ts` e `/vitest.config.ts` per supportare React e l'aliasing `@`.
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Creare un test di fumo fail per verificare Vitest**
Creare `/src/smoke.test.ts` con un test destinato a fallire.
```typescript
import { expect, test } from 'vitest';

test('smoke test fail', () => {
  expect(1 + 1).toBe(3);
});
```
Eseguire: `npm run test`
Expected: FAIL con `smoke test fail` che fallisce.

- [ ] **Step 4: Correggere il test di fumo**
Modificare `/src/smoke.test.ts` per farlo passare.
```typescript
import { expect, test } from 'vitest';

test('smoke test pass', () => {
  expect(1 + 1).toBe(2);
});
```
Eseguire: `npm run test`
Expected: PASS.

- [ ] **Step 5: Configurare Tailwind CSS e file sorgente principali**
Creare `/tailwind.config.js`, `/postcss.config.js` e `/src/index.css` per agganciare le direttive di Tailwind. In `/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #0f172a;
  color: #f8fafc;
  font-family: 'Inter', sans-serif;
}
```

---

### Task 2: Modello Dati e File JSON per Entità
Creazione dei tipi TypeScript e dei 5 file JSON statici contenenti i dati del database di Patrician III.

**Files:**
- Create: `/src/types/index.ts`
- Create: `/public/data/goods.json`
- Create: `/public/data/towns.json`
- Create: `/public/data/businesses.json`
- Create: `/public/data/ships.json`
- Create: `/public/data/buildings.json`
- Test: `/src/types/types.test.ts`

**Interfaces:**
- Exporta le interfacce `Good`, `Business`, `Town`, `Building`, `ShipType` da `/src/types/index.ts`.

- [ ] **Step 1: Scrivere il test di validazione dei tipi**
Creare `/src/types/types.test.ts` per verificare che i record mock rispettino le interfacce.
```typescript
import { expect, test } from 'vitest';
import type { Town } from './index';

test('verify Town interface structure', () => {
  const mockTown: Town = {
    id: 'lubeck',
    name: 'Lubecca',
    isRiverTown: false,
    produces: ['beer', 'grain']
  };
  expect(mockTown.name).toBe('Lubecca');
});
```
Eseguire: `npm run test src/types/types.test.ts`
Expected: FAIL (il file `/src/types/index.ts` non esiste o non ha il tipo `Town`).

- [ ] **Step 2: Scrivere il file di tipi `/src/types/index.ts`**
Creare `/src/types/index.ts` con i tipi corretti.
```typescript
export interface LocalizedString {
  it: string;
  en: string;
}

export interface Good {
  id: string;
  name: LocalizedString;
  basePrice: number;
  buyPriceRange: [number, number];
  sellPriceRange: [number, number];
  maxSatisfactionPrice: number | null;
  volume: number;
  isRawMaterial: boolean;
  isImported: boolean;
}

export interface BusinessInput {
  goodId: string;
  amountPerDay: number;
}

export interface Business {
  id: string;
  name: LocalizedString;
  producedGoodId: string;
  baseProductionPerDay: number;
  inputs: BusinessInput[];
  constructionCost: {
    gold: number;
    bricks: number;
    timber: number;
  };
  workersNeeded: number;
  dailyMaintenance: number;
}

export interface Town {
  id: string;
  name: string;
  isRiverTown: boolean;
  produces: string[];
  coordinate?: { x: number; y: number };
}

export interface Building {
  id: string;
  name: LocalizedString;
  capacity: { poor: number; wealthy: number; rich: number };
  constructionCost: { gold: number; bricks: number; timber: number };
  weeklyRent: { poor: number; wealthy: number; rich: number };
}

export interface ShipType {
  id: string;
  name: LocalizedString;
  baseCapacity: number;
  minSailors: number;
  maxSailors: number;
  maxWeapons: number;
  isRiverFriendly: boolean;
  dailyCost: number;
}
```
Eseguire: `npm run test src/types/types.test.ts`
Expected: PASS.

- [ ] **Step 3: Creare i 5 file JSON sotto `/public/data/`**
Creare `/public/data/goods.json`, `/public/data/towns.json`, `/public/data/businesses.json`, `/public/data/ships.json` e `/public/data/buildings.json` inserendo i dati storici del database statico del gioco.

---

### Task 3: Client Indipendenti per le Entità
Creazione dei client TypeScript dedicati responsabili del fetch e caching di ogni singolo file JSON.

**Files:**
- Create: `/src/clients/GoodClient.ts`
- Create: `/src/clients/TownClient.ts`
- Create: `/src/clients/BusinessClient.ts`
- Create: `/src/clients/ShipClient.ts`
- Create: `/src/clients/BuildingClient.ts`
- Test: `/src/clients/Clients.test.ts`

**Interfaces:**
- `GoodClient`: `async getGoods(): Promise<Good[]>`
- `TownClient`: `async getTowns(): Promise<Town[]>`
- `BusinessClient`: `async getBusinesses(): Promise<Business[]>`
- `ShipClient`: `async getShips(): Promise<ShipType[]>`
- `BuildingClient`: `async getBuildings(): Promise<Building[]>`

- [ ] **Step 1: Scrivere il test asincrono per TownClient e GoodClient**
Creare `/src/clients/Clients.test.ts` verificando che i client facciano fetch del file corretto e mantengano i dati in cache locale.
```typescript
import { expect, test, vi, beforeEach } from 'vitest';
import TownClient from './TownClient';

beforeEach(() => {
  vi.restoreAllMocks();
});

test('TownClient fetches and caches towns', async () => {
  const mockTowns = [{ id: 'lubeck', name: 'Lubecca' }];
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockTowns,
  });
  vi.stubGlobal('fetch', mockFetch);

  const client = new TownClient();
  const res1 = await client.getTowns();
  const res2 = await client.getTowns();

  expect(res1[0].id).toBe('lubeck');
  expect(mockFetch).toHaveBeenCalledTimes(1);
});
```
Eseguire: `npm run test src/clients/Clients.test.ts`
Expected: FAIL (classe `TownClient` non trovata).

- [ ] **Step 2: Implementare TownClient e GoodClient**
Creare `/src/clients/TownClient.ts` e `/src/clients/GoodClient.ts` gestendo la cache interna e il fetch del proprio JSON.
```typescript
// TownClient.ts
import type { Town } from '../types';

export default class TownClient {
  private cache: Town[] | null = null;

  async getTowns(): Promise<Town[]> {
    if (this.cache) return this.cache;
    const res = await fetch('/data/towns.json');
    if (!res.ok) throw new Error(`Failed to fetch towns: ${res.status}`);
    this.cache = await res.json() as Town[];
    return this.cache;
  }
}
```
```typescript
// GoodClient.ts
import type { Good } from '../types';

export default class GoodClient {
  private cache: Good[] | null = null;

  async getGoods(): Promise<Good[]> {
    if (this.cache) return this.cache;
    const res = await fetch('/data/goods.json');
    if (!res.ok) throw new Error(`Failed to fetch goods: ${res.status}`);
    this.cache = await res.json() as Good[];
    return this.cache;
  }
}
```
Eseguire: `npm run test src/clients/Clients.test.ts`
Expected: PASS.

- [ ] **Step 3: Implementare BusinessClient, ShipClient e BuildingClient**
Creare `/src/clients/BusinessClient.ts`, `/src/clients/ShipClient.ts` e `/src/clients/BuildingClient.ts` implementando la stessa logica di caricamento asincrono dai rispettivi file JSON in `/public/data/`.

---

### Task 4: Implementazione dei Services
Creazione dei servizi che consumano i rispettivi client, applicando la business logic e le traduzioni.

**Files:**
- Create: `/src/services/GoodService.ts`
- Create: `/src/services/TownService.ts`
- Create: `/src/services/BusinessService.ts`
- Create: `/src/services/ShipService.ts`
- Create: `/src/services/BuildingService.ts`
- Test: `/src/services/Services.test.ts`

**Interfaces:**
- `GoodService`: `async getGoods(lang: 'it' | 'en'): Promise<Good[]>` (con nomi localizzati)
- `TownService`: `async getTowns(): Promise<Town[]>`, `async getTownById(id: string): Promise<Town | undefined>`
- `BusinessService`: `async getBusinesses(lang: 'it' | 'en'): Promise<Business[]>`
- `ShipService`: `async getShips(lang: 'it' | 'en'): Promise<ShipType[]>`
- `BuildingService`: `async getBuildings(lang: 'it' | 'en'): Promise<Building[]>`

- [ ] **Step 1: Scrivere i test unitari per i Services**
Creare `/src/services/Services.test.ts` testando che `TownService` carichi le città dal client e che `GoodService` applichi le traduzioni corrette della lingua.
```typescript
import { expect, test } from 'vitest';
import TownClient from '../clients/TownClient';
import GoodClient from '../clients/GoodClient';
import TownService from './TownService';
import GoodService from './GoodService';

test('Services format and localize data from clients', async () => {
  const mockTownClient = {
    getTowns: async () => [{ id: 'lubeck', name: 'Lubecca', isRiverTown: false, produces: [] }]
  } as unknown as TownClient;

  const mockGoodClient = {
    getGoods: async () => [{ id: 'beer', name: { it: 'Birra', en: 'Beer' } }]
  } as unknown as GoodClient;

  const townService = new TownService(mockTownClient);
  const goodService = new GoodService(mockGoodClient);

  const towns = await townService.getTowns();
  expect(towns[0].name).toBe('Lubecca');

  const goods = await goodService.getGoods('it');
  expect(goods[0].name).toBe('Birra');
});
```
Eseguire: `npm run test src/services/Services.test.ts`
Expected: FAIL.

- [ ] **Step 2: Implementare GoodService e TownService**
Creare `/src/services/GoodService.ts` e `/src/services/TownService.ts` consumando i rispettivi client.
```typescript
// GoodService.ts
import GoodClient from '../clients/GoodClient';

export default class GoodService {
  constructor(private client: GoodClient) {}

  async getGoods(lang: 'it' | 'en'): Promise<any[]> {
    const goods = await this.client.getGoods();
    return goods.map(g => ({
      ...g,
      name: g.name[lang] || g.name.en
    }));
  }
}
```
```typescript
// TownService.ts
import TownClient from '../clients/TownClient';
import type { Town } from '../types';

export default class TownService {
  constructor(private client: TownClient) {}

  async getTowns(): Promise<Town[]> {
    return this.client.getTowns();
  }

  async getTownById(id: string): Promise<Town | undefined> {
    const towns = await this.getTowns();
    return towns.find(t => t.id === id);
  }
}
```
Eseguire: `npm run test src/services/Services.test.ts`
Expected: PASS.

- [ ] **Step 3: Implementare BusinessService, ShipService e BuildingService**
Creare `/src/services/BusinessService.ts` (con `BusinessClient`), `/src/services/ShipService.ts` (con `ShipClient`) e `/src/services/BuildingService.ts` (con `BuildingClient`) localizzando i testi in base alla lingua richiesta.

---

### Task 5: ServicesContext e useServices Hook
Cablaggio centralizzato di tutti i client e di tutti i servizi in un contesto React unico per renderli fruibili nella UI.

**Files:**
- Create: `/src/servicesContext.tsx`
- Test: `/src/servicesContext.test.tsx`

**Interfaces:**
- `ServicesProvider`: inizializza i 5 client e i 5 servizi.
- `useServices()`: hook custom che fornisce `{ goodService, townService, businessService, shipService, buildingService }`.

- [ ] **Step 1: Scrivere il test per il Context**
Creare `/src/servicesContext.test.tsx` per testare la disponibilità di tutti i servizi tramite il Provider.
```typescript
import React from 'react';
import { renderHook } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ServicesProvider, useServices } from './servicesContext';

test('useServices hook loads correctly in ServicesProvider', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ServicesProvider>{children}</ServicesProvider>
  );

  const { result } = renderHook(() => useServices(), { wrapper });
  expect(result.current.goodService).toBeDefined();
  expect(result.current.townService).toBeDefined();
  expect(result.current.businessService).toBeDefined();
});
```
Eseguire: `npm run test src/servicesContext.test.tsx`
Expected: FAIL.

- [ ] **Step 2: Implementare il ServicesContext**
Creare `/src/servicesContext.tsx` istanziando client e servizi in modalità singleton e configurando il Provider.
```typescript
import React, { createContext, useContext, useMemo } from 'react';
import GoodClient from './clients/GoodClient';
import TownClient from './clients/TownClient';
import BusinessClient from './clients/BusinessClient';
import ShipClient from './clients/ShipClient';
import BuildingClient from './clients/BuildingClient';

import GoodService from './services/GoodService';
import TownService from './services/TownService';
import BusinessService from './services/BusinessService';
import ShipService from './services/ShipService';
import BuildingService from './services/BuildingService';

interface ServicesContextProps {
  goodService: GoodService;
  townService: TownService;
  businessService: BusinessService;
  shipService: ShipService;
  buildingService: BuildingService;
}

const ServicesContext = createContext<ServicesContextProps | null>(null);

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const services = useMemo(() => {
    const goodClient = new GoodClient();
    const townClient = new TownClient();
    const businessClient = new BusinessClient();
    const shipClient = new ShipClient();
    const buildingClient = new BuildingClient();

    return {
      goodService: new GoodService(goodClient),
      townService: new TownService(townClient),
      businessService: new BusinessService(businessClient),
      shipService: new ShipService(shipClient),
      buildingService: new BuildingService(buildingClient),
    };
  }, []);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) throw new Error('useServices must be used within a ServicesProvider');
  return context;
};
```
Eseguire: `npm run test src/servicesContext.test.tsx`
Expected: PASS.

---

### Task 6: Routing, Internazionalizzazione e Layout Principale
Configurazione del routing con react-router-dom, predisposizione dei file di traduzione con i18next e strutturazione del layout globale con Top Navigation Bar.

**Files:**
- Create: `/src/i18n.ts`
- Create: `/src/router.tsx`
- Create: `/src/layouts/DefaultLayout.tsx`
- Create: `/src/components/layout/Header.tsx`
- Create: `/src/components/layout/Footer.tsx`
- Modify: `/src/App.tsx`
- Test: `/src/layouts/DefaultLayout.test.tsx`

**Interfaces:**
- Navigazione responsive e multilingua configurata.

- [ ] **Step 1: Scrivere il test per la navigazione del layout**
Creare `/src/layouts/DefaultLayout.test.tsx` per testare la presenza del titolo dell'applicazione nell'header.
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { ServicesProvider } from '../servicesContext';
import DefaultLayout from './DefaultLayout';

test('DefaultLayout renders header with application title', () => {
  render(
    <ServicesProvider>
      <MemoryRouter>
        <DefaultLayout />
      </MemoryRouter>
    </ServicesProvider>
  );
  expect(screen.getByText(/Patrician III Assistant/i)).toBeInTheDocument();
});
```
Eseguire: `npm run test src/layouts/DefaultLayout.test.tsx`
Expected: FAIL.

- [ ] **Step 2: Configurare l'internazionalizzazione i18n**
Creare `/src/i18n.ts` per configurare `i18next` con traduzioni statiche cablate per le stringhe dell'interfaccia (titoli pagine, bottoni, calcolatori) in italiano ed inglese.

- [ ] **Step 3: Implementare Header, Footer e DefaultLayout**
Creare `/src/components/layout/Header.tsx` con la barra di navigazione classica superiore con i menù a discesa per "Database" e "Calcolatori" e il selettore lingua.
Creare `/src/components/layout/Footer.tsx` con copyright medievale.
Creare `/src/layouts/DefaultLayout.tsx` che unisce Header, `<Outlet />` per la rotta corrente e Footer in una struttura Flexbox verticale scura.
Eseguire: `npm run test src/layouts/DefaultLayout.test.tsx`
Expected: PASS.

- [ ] **Step 4: Configurare il router.tsx e App.tsx**
Creare `/src/router.tsx` impostando le rotte per `/` (Home), `/database/goods`, `/database/towns`, `/database/buildings`, `/calculators/production`, `/calculators/routes`, `/calculators/convoy`.
Modificare `/src/App.tsx` per agganciare il router e il provider dei servizi:
```typescript
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ServicesProvider } from './servicesContext';
import { router } from './router';
import './i18n';

function App() {
  return (
    <ServicesProvider>
      <RouterProvider router={router} />
    </ServicesProvider>
  );
}

export default App;
```

---

### Task 7: Pagine del Database Interattivo
Realizzazione delle pagine di sola consultazione delle merci, delle città e degli edifici residenziali.

**Files:**
- Create: `/src/pages/Home.tsx`
- Create: `/src/pages/database/GoodsAndBusinesses.tsx`
- Create: `/src/pages/database/Towns.tsx`
- Create: `/src/pages/database/Buildings.tsx`

**Interfaces:**
- Pagine visuali accessibili dal menu "Database".

- [ ] **Step 1: Creare la Home Page**
Creare `/src/pages/Home.tsx` con una splendida dashboard in stile medievale scuro, card riassuntive che collegano ai tre calcolatori principali, e una breve spiegazione storica della Lega Anseatica.

- [ ] **Step 2: Creare la pagina Merci & Imprese**
Creare `/src/pages/database/GoodsAndBusinesses.tsx` che mostra la lista delle 20 merci in una tabella Tailwind con i prezzi di acquisto e vendita ideali. Selezionando una merce, viene mostrato un pannello laterale con i dettagli dell'impresa che la produce (costi di costruzione, consumo materie prime e produzione giornaliera).

- [ ] **Step 3: Creare la pagina Database Città**
Creare `/src/pages/database/Towns.tsx`. Permette di selezionare una città da una griglia o da una lista; mostra i dettagli della città e le merci che produce in modo efficiente.

- [ ] **Step 4: Creare la pagina Edifici**
Creare `/src/pages/database/Buildings.tsx` che visualizza le tipologie di case, i costi di costruzione in mattoni/legno e gli affitti settimanali stimati per i cittadini.

---

### Task 8: Calcolatore di Produzione (Impero Commerciale)
Implementazione del calcolatore per stimare la produzione ed i consumi di materie prime per il proprio impero anseatico.

**Files:**
- Create: `/src/pages/calculators/Production.tsx`
- Test: `/src/services/ProductionCalculator.test.ts` (aggiunta di test per la logica di bilancio)

**Interfaces:**
- Persistenza automatica delle impostazioni dell'utente (numero di laboratori per città) nel `localStorage`.

- [ ] **Step 1: Scrivere test unitario per il calcolo della produzione con penalità**
Aggiungere a `/src/services/Services.test.ts` un test che calcoli il bilancio. Se produciamo birra a Lubecca (che ha la birra nelle sue specialità) la produzione è al 100%. Se la produciamo in una città non specializzata, la produzione deve calare del 25%.
```typescript
test('Production balance calculation with specialty penalty', () => {
  const baseProd = 40; // 40 barili al giorno
  // Città speciale per birra
  const prodSpecial = baseProd;
  // Città non speciale: -25% penalty
  const prodPenalty = baseProd * 0.75;

  expect(prodSpecial).toBe(40);
  expect(prodPenalty).toBe(30);
});
```
Eseguire: `npm run test`
Expected: PASS.

- [ ] **Step 2: Creare l'interfaccia utente del Calcolatore di Produzione**
Creare `/src/pages/calculators/Production.tsx`. 
- Permette all'utente di aggiungere città all'impero.
- In ogni città, l'utente può inserire il numero di imprese attive tramite input numerici puliti.
- L'app esegue la somma delle produzioni applicando la penalità del 25% alle imprese non efficienti localmente.
- Mostra il bilancio complessivo (Surplus/Deficit) giornaliero e settimanale per risorsa.
- I dati inseriti vengono salvati in `localStorage` in un hook React (es. `useEffect`) e ripristinati all'avvio.

---

### Task 9: Ottimizzatore di Rotte e Gestore Convogli
Implementazione degli ultimi due strumenti: l'ottimizzatore commerciale punto-punto e l'assemblatore di flotte con controllo fluviale e calcolo della stiva.

**Files:**
- Create: `/src/pages/calculators/Routes.tsx`
- Create: `/src/pages/calculators/Convoy.tsx`

**Interfaces:**
- Calcolo esatto dei convogli e stiva netta.

- [ ] **Step 1: Creare l'Ottimizzatore di Rotte**
Creare `/src/pages/calculators/Routes.tsx`.
- L'utente seleziona una Città A (Origine) e una Città B (Destinazione).
- L'applicazione elenca le merci prodotte localmente a basso prezzo in A che sono richieste in B.
- Fornisce i prezzi ideali di acquisto/vendita consigliati e calcola il guadagno stimato per barile.

- [ ] **Step 2: Creare il Gestore Convogli**
Creare `/src/pages/calculators/Convoy.tsx`.
- L'utente può inserire la quantità per tipo di nave (Snaikka, Crayer, Cog, Holk) e selezionare l'armamento (nessuno, parziale, massimo).
- L'applicazione esegue i calcoli:
  - Ogni cannone (punto arma) riduce lo spazio di stiva (es. -10 barili stiva per cannone).
  - Mostra il fabbisogno di marinai.
  - Verifica se il convoglio contiene navi marine (Cog o Holk), nel qual caso disabilita l'accesso ai fiumi mostrando un badge di avvertimento rosso: *"Questo convoglio non può risalire i fiumi (es. Colonia o Torun)!"*.
  - Calcola la stiva netta residua e i costi di manutenzione giornalieri totali.
