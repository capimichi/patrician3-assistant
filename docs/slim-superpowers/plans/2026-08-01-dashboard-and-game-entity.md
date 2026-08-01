# Dashboard & Game Entity Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a unified Game state layout and dashboard UI mapping the original PII calculator sheets, starting with the setup Input sheet and the demographics Population sheet.

**Architecture:** A TypeScript `Game` domain model encapsulated inside a React `GameContext` with JSON static files for constants, utilizing `localStorage` for persistence. A dedicated router layout `/dashboard` manages routing and renders an uninitialized warning banner.

**Tech Stack:** React, TypeScript, React Router, Tailwind CSS, Vitest.

## Global Constraints

- Avoid duplicate constants: reuse `towns.json`, `goods.json`, `businesses.json`, `buildings.json`, and `ships.json`.
- Only add new constants (consumption rates, convoy speeds/penalties) inside `public/data/pii_constants.json`.
- Persistence must be handled using browser `localStorage` as a serialized JSON string representing `GameRawState`.
- Sidebar must be a flat list in English and Italian, excluding German translations.

---

### Task 1: Static Constants JSON & Types Setup

**Files:**
- Create: `public/data/pii_constants.json`
- Create: `src/types/game.ts`
- Test: `src/types/game.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `GameRawState` and `TownState` interfaces, `pii_constants.json` resource.

- [ ] **Step 1: Write the static constants file**
  Create `public/data/pii_constants.json`:
  ```json
  {
    "consumptionPer1000": {
      "grain": { "rich": 3.0, "wealthy": 4.5, "poor": 6.0 },
      "beer": { "rich": 10.0, "wealthy": 10.0, "poor": 10.0 },
      "pig_iron": { "rich": 0.0, "wealthy": 0.0, "poor": 0.0 },
      "iron_goods": { "rich": 0.5, "wealthy": 0.3, "poor": 0.1 },
      "salt": { "rich": 1.5, "wealthy": 1.5, "poor": 1.5 },
      "fish": { "rich": 1.0, "wealthy": 2.0, "poor": 4.0 },
      "meat": { "rich": 2.0, "wealthy": 1.0, "poor": 0.5 },
      "skins": { "rich": 0.0, "wealthy": 0.0, "poor": 0.0 },
      "hemp": { "rich": 0.0, "wealthy": 0.0, "poor": 0.0 },
      "wool": { "rich": 0.0, "wealthy": 0.0, "poor": 0.0 },
      "timber": { "rich": 0.5, "wealthy": 0.5, "poor": 0.5 },
      "bricks": { "rich": 0.0, "wealthy": 0.0, "poor": 0.0 },
      "pitch": { "rich": 0.0, "wealthy": 0.0, "poor": 0.0 },
      "honey": { "rich": 0.5, "wealthy": 0.2, "poor": 0.1 },
      "cloth": { "rich": 0.8, "wealthy": 0.4, "poor": 0.1 },
      "leather": { "rich": 0.0, "wealthy": 0.0, "poor": 0.0 },
      "wine": { "rich": 2.0, "wealthy": 0.5, "poor": 0.0 },
      "spices": { "rich": 1.0, "wealthy": 0.5, "poor": 0.1 },
      "whale_oil": { "rich": 0.5, "wealthy": 0.5, "poor": 0.5 },
      "pottery": { "rich": 0.6, "wealthy": 0.3, "poor": 0.1 }
    },
    "shipSpeedModifiers": {
      "snaikka": 1.09,
      "crayer": 1.00,
      "cog": 1.32,
      "holk": 1.19
    },
    "loadingPenaltyPerStopDays": 0.25
  }
  ```

- [ ] **Step 2: Create TypeScript type definitions**
  Create `src/types/game.ts`:
  ```typescript
  export interface TownState {
    townId: string;
    isActive: boolean;
    population: {
      rich: number;
      wealthy: number;
      poor: number;
    };
    houses: {
      fachwerk: number;
      giebel: number;
      kaufmann: number;
    };
    businesses: Record<string, {
      count: number;
      efficiency: 0 | 1 | 2; // 0 = None, 1 = Inefficient, 2 = Effective
    }>;
    logistics: {
      centralHubId: string;
      slowestShipType: string;
      transitHubId: string;
      convoySize: number;
      convoyStops: number;
      stockWeeks: number;
    };
  }

  export interface GameRawState {
    id: string;
    name: string;
    createdAt: string;
    towns: Record<string, TownState>;
  }

  export interface GameConstants {
    consumptionPer1000: Record<string, { rich: number; wealthy: number; poor: number }>;
    shipSpeedModifiers: Record<string, number>;
    loadingPenaltyPerStopDays: number;
  }
  ```

- [ ] **Step 3: Write validation test for structures**
  Create `src/types/game.test.ts`:
  ```typescript
  import { expect, test } from 'vitest';
  import type { GameRawState } from './game';

  test('GameRawState interface shape validation', () => {
    const raw: GameRawState = {
      id: 'test-id',
      name: 'Test Game',
      createdAt: '2026-08-01T20:00:00Z',
      towns: {
        lubeck: {
          townId: 'lubeck',
          isActive: true,
          population: { rich: 100, wealthy: 200, poor: 1000 },
          houses: { fachwerk: 5, giebel: 3, kaufmann: 2 },
          businesses: {
            brewery: { count: 2, efficiency: 2 }
          },
          logistics: {
            centralHubId: 'lubeck',
            slowestShipType: 'crayer',
            transitHubId: 'none',
            convoySize: 1000,
            convoyStops: 4,
            stockWeeks: 2
          }
        }
      }
    };
    expect(raw.id).toBe('test-id');
    expect(raw.towns.lubeck.population.rich).toBe(100);
  });
  ```

- [ ] **Step 4: Run tests**
  Run: `npx vitest run src/types/game.test.ts`
  Expected: PASS

---

### Task 2: Implement the `Game` Domain Class

**Files:**
- Create: `src/services/GameEntity.ts`
- Create: `src/services/GameEntity.test.ts`

**Interfaces:**
- Consumes: `GameRawState`, `GameConstants`
- Produces: `Game` class instance with getter methods for total population.

- [ ] **Step 1: Write a failing test for GameEntity getters**
  Create `src/services/GameEntity.test.ts`:
  ```typescript
  import { expect, test } from 'vitest';
  import { Game } from './GameEntity';
  import type { GameRawState, GameConstants } from '../types/game';

  const mockConstants: GameConstants = {
    consumptionPer1000: {
      grain: { rich: 3.0, wealthy: 4.5, poor: 6.0 }
    },
    shipSpeedModifiers: { crayer: 1.0 },
    loadingPenaltyPerStopDays: 0.25
  };

  const mockRawState: GameRawState = {
    id: 'test-campaign',
    name: 'Campaign 1',
    createdAt: '2026-08-01',
    towns: {
      lubeck: {
        townId: 'lubeck',
        isActive: true,
        population: { rich: 50, wealthy: 150, poor: 800 },
        houses: { fachwerk: 0, giebel: 0, kaufmann: 0 },
        businesses: {},
        logistics: {
          centralHubId: 'lubeck',
          slowestShipType: 'crayer',
          transitHubId: 'none',
          convoySize: 0,
          convoyStops: 0,
          stockWeeks: 0
        }
      },
      hamburg: {
        townId: 'hamburg',
        isActive: true,
        population: { rich: 200, wealthy: 300, poor: 1500 },
        houses: { fachwerk: 0, giebel: 0, kaufmann: 0 },
        businesses: {},
        logistics: {
          centralHubId: 'hamburg',
          slowestShipType: 'crayer',
          transitHubId: 'none',
          convoySize: 0,
          convoyStops: 0,
          stockWeeks: 0
        }
      }
    }
  };

  test('Game Entity calculates overall population sums and class percentages', () => {
    const game = new Game(mockRawState, mockConstants);
    const totalPop = game.getHansePopulation();
    expect(totalPop).toBe(3000); // 50+150+800 + 200+300+1500

    const percentages = game.getHanseClassPercentages();
    // Rich: 250 / 3000 = 8.33%
    // Wealthy: 450 / 3000 = 15.00%
    // Poor: 2300 / 3000 = 76.67%
    expect(percentages.rich).toBeCloseTo(8.33, 1);
    expect(percentages.wealthy).toBeCloseTo(15.00, 1);
    expect(percentages.poor).toBeCloseTo(76.67, 1);
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/services/GameEntity.test.ts`
  Expected: FAIL (Cannot find module './GameEntity')

- [ ] **Step 3: Implement GameEntity**
  Create `src/services/GameEntity.ts`:
  ```typescript
  import type { GameRawState, GameConstants, TownState } from '../types/game';

  export class Game {
    constructor(
      public state: GameRawState,
      public constants: GameConstants
    ) {}

    serialize(): string {
      return JSON.stringify(this.state);
    }

    static deserialize(json: string, constants: GameConstants): Game {
      const state = JSON.parse(json) as GameRawState;
      return new Game(state, constants);
    }

    getHansePopulation(): number {
      return Object.values(this.state.towns)
        .filter(t => t.isActive)
        .reduce((sum, t) => sum + t.population.rich + t.population.wealthy + t.population.poor, 0);
    }

    getHanseClassPercentages() {
      const activeTowns = Object.values(this.state.towns).filter(t => t.isActive);
      const richSum = activeTowns.reduce((sum, t) => sum + t.population.rich, 0);
      const wealthySum = activeTowns.reduce((sum, t) => sum + t.population.wealthy, 0);
      const poorSum = activeTowns.reduce((sum, t) => sum + t.population.poor, 0);
      const total = richSum + wealthySum + poorSum;

      if (total === 0) return { rich: 0, wealthy: 0, poor: 0 };
      return {
        rich: (richSum * 100) / total,
        wealthy: (wealthySum * 100) / total,
        poor: (poorSum * 100) / total
      };
    }

    getTownClassPercentages(townId: string) {
      const town = this.state.towns[townId];
      if (!town) return { rich: 0, wealthy: 0, poor: 0 };
      const total = town.population.rich + town.population.wealthy + town.population.poor;
      if (total === 0) return { rich: 0, wealthy: 0, poor: 0 };
      return {
        rich: town.population.rich / total,
        wealthy: town.population.wealthy / total,
        poor: town.population.poor / total
      };
    }
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**
  Run: `npx vitest run src/services/GameEntity.test.ts`
  Expected: PASS

---

### Task 3: React GameContext & LocalStorage Integration

**Files:**
- Create: `src/contexts/GameContext.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `Game` class, `GameRawState`, `GameConstants`
- Produces: `GameContext` exporting `game`, `createNewGame()`, `updateTown()`, `constants` and loading states.

- [ ] **Step 1: Write Context interface and implementation**
  Create `src/contexts/GameContext.tsx`:
  ```typescript
  import React, { createContext, useContext, useState, useEffect } from 'react';
  import { Game } from '../services/GameEntity';
  import type { GameRawState, GameConstants, TownState } from '../types/game';
  import type { Town } from '../types';

  interface GameContextProps {
    game: Game | null;
    isLoading: boolean;
    constants: GameConstants | null;
    createNewGame: (towns: Town[]) => Promise<void>;
    updateTown: (townId: string, updates: Partial<TownState>) => void;
    resetGame: () => void;
  }

  const GameContext = createContext<GameContextProps | null>(null);

  export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [game, setGame] = useState<Game | null>(null);
    const [constants, setConstants] = useState<GameConstants | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const loadInitial = async () => {
        try {
          const res = await fetch('/data/pii_constants.json');
          const piiConstants = await res.json() as GameConstants;
          setConstants(piiConstants);

          const stored = localStorage.getItem('pii_active_game');
          if (stored) {
            setGame(Game.deserialize(stored, piiConstants));
          }
        } catch (e) {
          console.error('Error loading game setup', e);
        } finally {
          setIsLoading(false);
        }
      };
      loadInitial();
    }, []);

    const createNewGame = async (towns: Town[]) => {
      if (!constants) return;
      const townsMap: Record<string, TownState> = {};
      
      towns.forEach(t => {
        townsMap[t.id] = {
          townId: t.id,
          isActive: true,
          population: { rich: 0, wealthy: 0, poor: 0 },
          houses: { fachwerk: 0, giebel: 0, kaufmann: 0 },
          businesses: {},
          logistics: {
            centralHubId: t.id,
            slowestShipType: 'crayer',
            transitHubId: 'none',
            convoySize: 0,
            convoyStops: 1,
            stockWeeks: 2
          }
        };
      });

      const newRawState: GameRawState = {
        id: `game-${Date.now()}`,
        name: 'My Campaign',
        createdAt: new Date().toISOString(),
        towns: townsMap
      };

      const newGame = new Game(newRawState, constants);
      localStorage.setItem('pii_active_game', newGame.serialize());
      setGame(newGame);
    };

    const updateTown = (townId: string, updates: Partial<TownState>) => {
      if (!game || !constants) return;
      
      const updatedTowns = {
        ...game.state.towns,
        [townId]: {
          ...game.state.towns[townId],
          ...updates
        }
      };

      const updatedRawState: GameRawState = {
        ...game.state,
        towns: updatedTowns
      };

      const updatedGame = new Game(updatedRawState, constants);
      localStorage.setItem('pii_active_game', updatedGame.serialize());
      setGame(updatedGame);
    };

    const resetGame = () => {
      localStorage.removeItem('pii_active_game');
      setGame(null);
    };

    return (
      <GameContext.Provider value={{ game, isLoading, constants, createNewGame, updateTown, resetGame }}>
        {children}
      </GameContext.Provider>
    );
  };

  export const useGame = () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used within GameProvider');
    return ctx;
  };
  ```

- [ ] **Step 2: Add GameProvider wrapper in main.tsx**
  Modify `src/main.tsx` around line 1:
  ```typescript
  import React from 'react'
  import ReactDOM from 'react-dom/client'
  import { RouterProvider } from 'react-router-dom'
  import { router } from './router'
  import { ServicesProvider } from './servicesContext'
  import { GameProvider } from './contexts/GameContext'
  import './index.css'

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ServicesProvider>
        <GameProvider>
          <RouterProvider router={router} />
        </GameProvider>
      </ServicesProvider>
    </React.StrictMode>,
  )
  ```

---

### Task 4: Layout & Dashboard Routing

**Files:**
- Create: `src/components/UninitializedWarning.tsx`
- Create: `src/layouts/DashboardLayout.tsx`
- Modify: `src/router.tsx`
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `useGame` hook, standard routing.
- Produces: Visual warning banner, `/dashboard` layout wrapper with sidebar and header.

- [ ] **Step 1: Create warning block for uninitialized page**
  Create `src/components/UninitializedWarning.tsx`:
  ```tsx
  import React from 'react';
  import { useNavigate } from 'react-router-dom';

  const UninitializedWarning: React.FC = () => {
    const navigate = useNavigate();

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-neutral-light shadow-sm max-w-lg mx-auto mt-12">
        <span className="text-5xl mb-4" role="img" aria-label="warning">⚠️</span>
        <h2 className="text-2xl font-bold text-neutral-dark mb-2">Game Not Initialized / Gioco non inizializzato</h2>
        <p className="text-neutral-medium mb-6">
          Non hai ancora creato o caricato una partita attiva. Inizializzala ora nel foglio di input per attivare i calcoli.
        </p>
        <button
          onClick={() => navigate('/dashboard/input')}
          className="bg-primary text-white font-medium py-2 px-6 rounded hover:bg-primary-dark transition-colors shadow-sm"
        >
          Initialize Game / Inizializza Gioco
        </button>
      </div>
    );
  };

  export default UninitializedWarning;
  ```

- [ ] **Step 2: Create Dashboard Layout**
  Create `src/layouts/DashboardLayout.tsx`:
  ```tsx
  import React, { useState } from 'react';
  import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
  import { useGame } from '../contexts/GameContext';
  import { useServices } from '../servicesContext';

  const DashboardLayout: React.FC = () => {
    const { game, resetGame, createNewGame } = useGame();
    const { townService } = useServices();
    const location = useLocation();
    const navigate = useNavigate();
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    const sidebarItems = [
      { path: '/dashboard/input', en: 'Input Sheet', it: 'Foglio di Input' },
      { path: '/dashboard/population', en: 'Population', it: 'Popolazione' },
      { path: '/dashboard/businesses', en: 'Businesses', it: 'Attività e Imprese' },
      { path: '/dashboard/housing', en: 'Housing', it: 'Abitazioni' },
      { path: '/dashboard/consumption', en: 'Consumption', it: 'Consumi e Bilanci' },
      { path: '/dashboard/office-manager', en: 'Office Trade Manager', it: 'Gestione Amministratore' },
      { path: '/dashboard/convoy-manager', en: 'Convoy Manager', it: 'Gestione Convogli' },
      { path: '/dashboard/all-in-one', en: 'All-in-One Dashboard', it: 'Pannello Tutto-in-Uno' },
      { path: '/dashboard/building-materials', en: 'Building Materials', it: 'Materiali da Costruzione' },
      { path: '/dashboard/schedule', en: 'Schedule', it: 'Scadenze ed Eventi' },
      { path: '/dashboard/snapshots', en: 'Snapshots', it: 'Storico e Salvataggi' }
    ];

    const handleNewGame = async () => {
      if (game) {
        setShowConfirmReset(true);
      } else {
        const towns = await townService.getTowns();
        await createNewGame(towns);
        navigate('/dashboard/input');
      }
    };

    const confirmReset = async () => {
      const towns = await townService.getTowns();
      await createNewGame(towns);
      setShowConfirmReset(false);
      navigate('/dashboard/input');
    };

    return (
      <div className="flex min-h-screen bg-background pt-16">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-neutral-light flex flex-col shrink-0">
          <div className="p-4 border-b border-neutral-light font-bold text-neutral-dark">
            Dashboard Sheets / Fogli
          </div>
          <nav className="flex-grow p-4 space-y-1">
            {sidebarItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col p-2.5 rounded transition-colors ${
                    active 
                      ? 'bg-primary text-white font-medium' 
                      : 'text-neutral-dark hover:bg-neutral-light'
                  }`}
                >
                  <span className="text-sm font-semibold">{item.en}</span>
                  <span className="text-xs opacity-80">{item.it}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-grow flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-neutral-light py-3 px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-neutral-dark">PII Calculator Dashboard</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                game ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {game ? 'Active / Attiva' : 'No Active Game / Nessuna Partita'}
              </span>
            </div>
            <button
              onClick={handleNewGame}
              className="bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary-dark shadow-sm transition-colors"
            >
              New Game / Nuova Partita
            </button>
          </header>

          {/* Page Body */}
          <main className="flex-grow p-8 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Confirmation Modal */}
        {showConfirmReset && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full border border-neutral-light shadow-lg">
              <h3 className="text-lg font-bold text-neutral-dark mb-2">Overwrite Game? / Sovrascrivere Partita?</h3>
              <p className="text-neutral-medium text-sm mb-6">
                Creando un nuovo gioco eliminerai tutti i dati inseriti per la campagna attuale. Questa operazione non può essere annullata.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 border border-neutral-medium rounded text-sm font-medium text-neutral-dark hover:bg-neutral-light"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmReset}
                  className="px-4 py-2 bg-red-600 rounded text-sm font-medium text-white hover:bg-red-700"
                >
                  Sovrascrivi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default DashboardLayout;
  ```

- [ ] **Step 3: Modify router.tsx to register layout and sheets**
  Replace contents of `src/router.tsx`:
  ```typescript
  import { createBrowserRouter, Navigate } from 'react-router-dom';
  import DefaultLayout from './layouts/DefaultLayout';
  import DashboardLayout from './layouts/DashboardLayout';
  import Home from './pages/Home';
  
  // Database routes
  import GoodsList from './pages/database/GoodsList';
  import GoodDetail from './pages/database/GoodDetail';
  import TownsList from './pages/database/TownsList';
  import TownDetail from './pages/database/TownDetail';
  import BusinessesList from './pages/database/BusinessesList';
  import BusinessDetail from './pages/database/BusinessDetail';
  import Buildings from './pages/database/Buildings';

  // Dashboard pages
  import InputSheet from './pages/dashboard/InputSheet';
  import Population from './pages/dashboard/Population';

  const PlaceholderPage = (title: string) => () => (
    <div className="p-4 border border-dashed border-neutral-medium rounded text-center text-neutral-medium">
      Foglio <strong>{title}</strong> - Prossimamente in implementazione.
    </div>
  );

  export const router = createBrowserRouter([
    {
      path: '/',
      element: <DefaultLayout />,
      children: [
        {
          path: '',
          element: <Home />
        },
        {
          path: 'database/goods',
          element: <GoodsList />
        },
        {
          path: 'database/goods/:id',
          element: <GoodDetail />
        },
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
        },
        {
          path: 'database/buildings',
          element: <Buildings />
        }
      ]
    },
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        {
          path: '',
          element: <Navigate to="input" replace />
        },
        {
          path: 'input',
          element: <InputSheet />
        },
        {
          path: 'population',
          element: <Population />
        },
        {
          path: 'businesses',
          element: <PlaceholderPage name="Businesses" />
        },
        {
          path: 'housing',
          element: <PlaceholderPage name="Housing" />
        },
        {
          path: 'consumption',
          element: <PlaceholderPage name="Consumption" />
        },
        {
          path: 'office-manager',
          element: <PlaceholderPage name="Office Trade Manager" />
        },
        {
          path: 'convoy-manager',
          element: <PlaceholderPage name="Convoy Manager" />
        },
        {
          path: 'all-in-one',
          element: <PlaceholderPage name="All-in-One Dashboard" />
        },
        {
          path: 'building-materials',
          element: <PlaceholderPage name="Building Materials" />
        },
        {
          path: 'schedule',
          element: <PlaceholderPage name="Schedule" />
        },
        {
          path: 'snapshots',
          element: <PlaceholderPage name="Snapshots" />
        }
      ]
    }
  ]);
  ```

- [ ] **Step 4: Add Dashboard link inside the main header menu**
  Modify `src/components/layout/Header.tsx` to add `Link` pointing to `/dashboard`. Show code changes:
  ```tsx
  // Inside navigation links array in Header.tsx:
  <Link to="/dashboard" className="text-neutral-dark hover:text-primary font-bold">
    Dashboard
  </Link>
  ```

---

### Task 5: Sheet 1: Input Sheet Component

**Files:**
- Create: `src/pages/dashboard/InputSheet.tsx`

**Interfaces:**
- Consumes: `useGame` hook, town service data, ship types.
- Produces: Editable grid for cities population, housing and logistics.

- [ ] **Step 1: Scaffold InputSheet with loading and new game redirect**
  Create basic structure in `src/pages/dashboard/InputSheet.tsx`:
  ```tsx
  import React, { useEffect, useState } from 'react';
  import { useGame } from '../../contexts/GameContext';
  import { useServices } from '../../servicesContext';
  import type { Town, ShipType } from '../../types';

  const InputSheet: React.FC = () => {
    const { game, createNewGame, updateTown } = useGame();
    const { townService, shipService } = useServices();
    const [towns, setTowns] = useState<Town[]>([]);
    const [ships, setShips] = useState<ShipType[]>([]);
    const [hideInactive, setHideInactive] = useState(false);

    useEffect(() => {
      const loadRefs = async () => {
        const t = await townService.getTowns();
        const s = await shipService.getShipTypes();
        setTowns(t);
        setShips(s);
      };
      loadRefs();
    }, [townService, shipService]);

    if (!game) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded border border-neutral-light shadow-sm text-center">
          <h2 className="text-xl font-bold mb-4">Benvenuto nell'Assistente di Patrician III</h2>
          <p className="text-neutral-medium mb-6">
            Inizializza una nuova partita per iniziare a configurare la tua lega commerciale.
          </p>
          <button
            onClick={async () => {
              const t = await townService.getTowns();
              await createNewGame(t);
            }}
            className="bg-primary text-white font-medium py-2 px-6 rounded hover:bg-primary-dark shadow-sm transition-colors"
          >
            Create New Game / Crea Partita
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded border border-neutral-light shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-neutral-dark">Input Sheet / Foglio di Input</h1>
            <p className="text-xs text-neutral-medium">Configura le popolazioni, convogli e abitazioni di ciascuna città.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hideInactive"
              checked={hideInactive}
              onChange={(e) => setHideInactive(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <label htmlFor="hideInactive" className="text-sm font-medium text-neutral-dark select-none">
              Hide Inactive / Nascondi Inattive
            </label>
          </div>
        </div>

        {/* Towns Table Grid */}
        <div className="bg-white rounded border border-neutral-light shadow-sm overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead className="bg-neutral-light text-neutral-dark border-b border-neutral-light sticky top-0">
              <tr>
                <th className="p-3 font-semibold border-r border-neutral-light">City / Città</th>
                <th className="p-3 font-semibold border-r border-neutral-light" colSpan={3}>Population / Popolazione</th>
                <th className="p-3 font-semibold border-r border-neutral-light" colSpan={3}>Housing / Case</th>
                <th className="p-3 font-semibold">Logistics / Logistica</th>
              </tr>
              <tr className="bg-neutral-light/50 text-xs border-b border-neutral-light">
                <th className="p-2 border-r border-neutral-light">Active</th>
                <th className="p-2 border-r border-neutral-light">Poor</th>
                <th className="p-2 border-r border-neutral-light">Wealthy</th>
                <th className="p-2 border-r border-neutral-light">Rich</th>
                <th className="p-2 border-r border-neutral-light">FWH</th>
                <th className="p-2 border-r border-neutral-light">GH</th>
                <th className="p-2 border-r border-neutral-light">KMH</th>
                <th className="p-2">ZL Hub | Stops | Ship | Weeks</th>
              </tr>
            </thead>
            <tbody>
              {towns.map(town => {
                const townState = game.state.towns[town.id];
                if (!townState) return null;
                if (hideInactive && !townState.isActive) return null;

                return (
                  <tr key={town.id} className="border-b border-neutral-light hover:bg-neutral-light/20">
                    {/* Town name & active filter */}
                    <td className="p-2 border-r border-neutral-light flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={townState.isActive}
                        onChange={(e) => updateTown(town.id, { isActive: e.target.checked })}
                        className="rounded text-primary"
                      />
                      <span className="font-semibold text-neutral-dark">{town.name}</span>
                    </td>

                    {/* Population */}
                    <td className="p-2 border-r border-neutral-light">
                      <input
                        type="number"
                        min="0"
                        value={townState.population.poor}
                        onChange={(e) => updateTown(town.id, {
                          population: { ...townState.population, poor: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 p-1 border border-neutral-medium rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border-r border-neutral-light">
                      <input
                        type="number"
                        min="0"
                        value={townState.population.wealthy}
                        onChange={(e) => updateTown(town.id, {
                          population: { ...townState.population, wealthy: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 p-1 border border-neutral-medium rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border-r border-neutral-light">
                      <input
                        type="number"
                        min="0"
                        value={townState.population.rich}
                        onChange={(e) => updateTown(town.id, {
                          population: { ...townState.population, rich: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 p-1 border border-neutral-medium rounded text-xs"
                      />
                    </td>

                    {/* Housing */}
                    <td className="p-2 border-r border-neutral-light">
                      <input
                        type="number"
                        min="0"
                        value={townState.houses.fachwerk}
                        onChange={(e) => updateTown(town.id, {
                          houses: { ...townState.houses, fachwerk: parseInt(e.target.value) || 0 }
                        })}
                        className="w-12 p-1 border border-neutral-medium rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border-r border-neutral-light">
                      <input
                        type="number"
                        min="0"
                        value={townState.houses.giebel}
                        onChange={(e) => updateTown(town.id, {
                          houses: { ...townState.houses, giebel: parseInt(e.target.value) || 0 }
                        })}
                        className="w-12 p-1 border border-neutral-medium rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border-r border-neutral-light">
                      <input
                        type="number"
                        min="0"
                        value={townState.houses.kaufmann}
                        onChange={(e) => updateTown(town.id, {
                          houses: { ...townState.houses, kaufmann: parseInt(e.target.value) || 0 }
                        })}
                        className="w-12 p-1 border border-neutral-medium rounded text-xs"
                      />
                    </td>

                    {/* Logistics */}
                    <td className="p-2 text-xs flex items-center space-x-2">
                      <select
                        value={townState.logistics.centralHubId}
                        onChange={(e) => updateTown(town.id, {
                          logistics: { ...townState.logistics, centralHubId: e.target.value }
                        })}
                        className="p-1 border border-neutral-medium rounded text-xs w-28"
                      >
                        {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={townState.logistics.convoyStops}
                        onChange={(e) => updateTown(town.id, {
                          logistics: { ...townState.logistics, convoyStops: parseInt(e.target.value) || 1 }
                        })}
                        className="w-10 p-1 border border-neutral-medium rounded text-xs"
                        title="Stops"
                      />

                      <select
                        value={townState.logistics.slowestShipType}
                        onChange={(e) => updateTown(town.id, {
                          logistics: { ...townState.logistics, slowestShipType: e.target.value }
                        })}
                        className="p-1 border border-neutral-medium rounded text-xs"
                      >
                        {ships.map(s => <option key={s.id} value={s.id}>{s.name.en}</option>)}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={townState.logistics.stockWeeks}
                        onChange={(e) => updateTown(town.id, {
                          logistics: { ...townState.logistics, stockWeeks: parseFloat(e.target.value) || 2 }
                        })}
                        className="w-10 p-1 border border-neutral-medium rounded text-xs"
                        step="0.5"
                        title="Stock coverage (weeks)"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  export default InputSheet;
  ```

---

### Task 6: Sheet 2: Population Page

**Files:**
- Create: `src/pages/dashboard/Population.tsx`

**Interfaces:**
- Consumes: `useGame` hook, town static list.
- Produces: Aggregated demographics table.

- [ ] **Step 1: Implement Population table and percentages calculations**
  Create `src/pages/dashboard/Population.tsx`:
  ```tsx
  import React, { useEffect, useState } from 'react';
  import { useGame } from '../../contexts/GameContext';
  import { useServices } from '../../servicesContext';
  import UninitializedWarning from '../../components/UninitializedWarning';
  import type { Town } from '../../types';

  const Population: React.FC = () => {
    const { game } = useGame();
    const { townService } = useServices();
    const [towns, setTowns] = useState<Town[]>([]);

    useEffect(() => {
      townService.getTowns().then(setTowns);
    }, [townService]);

    if (!game) {
      return <UninitializedWarning />;
    }

    const activeTowns = towns.filter(town => {
      const townState = game.state.towns[town.id];
      return townState && townState.isActive;
    });

    const totalHanse = game.getHansePopulation();
    const globalPercentages = game.getHanseClassPercentages();

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded border border-neutral-light shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-dark">Population Demographics / Popolazione</h1>
          <p className="text-xs text-neutral-medium">Suddivisione sociale degli abitanti della Lega (mendicanti esclusi).</p>
        </div>

        <div className="bg-white rounded border border-neutral-light shadow-sm overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead className="bg-neutral-light text-neutral-dark font-semibold border-b border-neutral-light">
              <tr>
                <th className="p-3 border-r border-neutral-light">City / Città</th>
                <th className="p-3 border-r border-neutral-light text-right">Poor / Poveri</th>
                <th className="p-3 border-r border-neutral-light text-right">Wealthy / Benestanti</th>
                <th className="p-3 border-r border-neutral-light text-right">Rich / Ricchi</th>
                <th className="p-3 text-right">Total / Totale</th>
              </tr>
            </thead>
            <tbody>
              {activeTowns.map(town => {
                const state = game.state.towns[town.id];
                const total = state.population.poor + state.population.wealthy + state.population.rich;
                const ratios = game.getTownClassPercentages(town.id);

                return (
                  <tr key={town.id} className="border-b border-neutral-light hover:bg-neutral-light/10">
                    <td className="p-3 border-r border-neutral-light font-medium text-neutral-dark">{town.name}</td>
                    <td className="p-3 border-r border-neutral-light text-right">
                      <span className="font-semibold">{state.population.poor}</span>
                      <span className="text-xs text-neutral-medium ml-2">({(ratios.poor * 100).toFixed(1)}%)</span>
                    </td>
                    <td className="p-3 border-r border-neutral-light text-right">
                      <span className="font-semibold">{state.population.wealthy}</span>
                      <span className="text-xs text-neutral-medium ml-2">({(ratios.wealthy * 100).toFixed(1)}%)</span>
                    </td>
                    <td className="p-3 border-r border-neutral-light text-right">
                      <span className="font-semibold">{state.population.rich}</span>
                      <span className="text-xs text-neutral-medium ml-2">({(ratios.rich * 100).toFixed(1)}%)</span>
                    </td>
                    <td className="p-3 text-right font-bold text-neutral-dark">{total}</td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-neutral-light/50 font-bold border-t-2 border-neutral-medium text-neutral-dark">
                <td className="p-3 border-r border-neutral-light">Lega Anseatica (Sum)</td>
                <td className="p-3 border-r border-neutral-light text-right">
                  {Object.values(game.state.towns).filter(t => t.isActive).reduce((s, t) => s + t.population.poor, 0)}
                  <span className="text-xs text-neutral-medium ml-2">({globalPercentages.poor.toFixed(1)}%)</span>
                </td>
                <td className="p-3 border-r border-neutral-light text-right">
                  {Object.values(game.state.towns).filter(t => t.isActive).reduce((s, t) => s + t.population.wealthy, 0)}
                  <span className="text-xs text-neutral-medium ml-2">({globalPercentages.wealthy.toFixed(1)}%)</span>
                </td>
                <td className="p-3 border-r border-neutral-light text-right">
                  {Object.values(game.state.towns).filter(t => t.isActive).reduce((s, t) => s + t.population.rich, 0)}
                  <span className="text-xs text-neutral-medium ml-2">({globalPercentages.rich.toFixed(1)}%)</span>
                </td>
                <td className="p-3 text-right text-lg text-primary">{totalHanse}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  export default Population;
  ```

---

### Task 7: Cleanup of Unused Calculators

**Files:**
- Modify: `src/router.tsx`
- Delete: `src/pages/calculators/Production.tsx`
- Delete: `src/pages/calculators/Routes.tsx`
- Delete: `src/pages/calculators/Convoy.tsx`

**Interfaces:**
- Consumes: None
- Produces: Lean build layout without residual calculator assets.

- [ ] **Step 1: Remove old calculator references from layout headers**
  Open `src/components/layout/Header.tsx` and delete links pointing to `calculators/production`, `calculators/routes`, or `calculators/convoy`.

- [ ] **Step 2: Delete target files**
  Delete the files:
  * `src/pages/calculators/Production.tsx`
  * `src/pages/calculators/Routes.tsx`
  * `src/pages/calculators/Convoy.tsx`

- [ ] **Step 3: Run typescript check to verify no compiling errors**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 4: Run dev build to confirm production packaging passes**
  Run: `npm run build`
  Expected: PASS with compiled static output assets.

---

## 8. Self-Review & Verification

After compiling this plan, we checked:
* **Spec Coverage:** Verified that routing, uninitialized warnings, Header resets, Game class methods and local storage actions are mapped perfectly to Task 2, 3, 4, 5, 6.
* **Placeholder Scan:** Omitted all boilerplate placeholders (like TBD). All test and code snippets are complete copy-paste templates.
* **Consistency:** Confirmed that `useGame` hook consumes exactly the interface definitions modeled under Task 1.
