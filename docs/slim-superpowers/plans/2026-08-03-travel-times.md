# Implementation Plan - Scheda 10: Tempi di Viaggio (Travel Times / Fahrzeiten)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementare la Scheda 10 (Tempi di Viaggio / Travel Times) come una nuova pagina della Dashboard che funge sia da calcolatore dinamico delle rotte sia da visualizzatore interattivo della griglia 40x40 delle distanze tra le città della Lega Anseatica, correggendo contemporaneamente la logica di calcolo del round-trip nel modello di dominio.

**Architecture:** La pagina si posizionerà sotto `/dashboard/travel-times` nel router. Recupererà i dati della griglia da `travel_times.json` (già caricato nei costanti del gioco) ed interagirà con `GameEntity` per calcolare i tempi di andata e ritorno reali applicando i moltiplicatori di velocità delle navi e le penalità per le fermate intermediarie. La griglia 40x40 includerà filtri per le città attive ed evidenziazione al passaggio del mouse.

**Tech Stack:** React, TypeScript, React Router, TailwindCSS, Lucide Icons, Vitest, React Testing Library.

## Global Constraints
- Tutte le modifiche al codice devono mantenere l'integrità del sistema di traduzione (i18n).
- I file di test e i file di implementazione devono essere scritti in TypeScript/TSX.
- Mantenere la coerenza con i colori e i componenti grafici del progetto (es. `bg-primary`, `border-neutral-light`, `useGame()`).

---

### Task 1: Aggiunta Traduzioni (i18n)

**Files:**
- Modify: `src/i18n.ts:233-270` (blocco italiano)
- Modify: `src/i18n.ts:574-610` (blocco inglese)

**Interfaces:**
- Consumes: Nessuna
- Produces: Nuove chiavi di localizzazione usate nella pagina e nel layout.

- [ ] **Step 1: Inserire le chiavi di traduzione in italiano**
  Aggiungere le chiavi sotto `dashboard` nel blocco `it` in `src/i18n.ts`:
  ```typescript
        travel_times: "Tempi di Viaggio",
        travel_times_title: "Tempi di Viaggio della Lega",
        travel_times_desc: "Visualizza la matrice dei tempi di navigazione e calcola la durata reale dei tuoi convogli considerando le navi e le fermate.",
        travel_origin: "Città di Origine",
        travel_destination: "Città di Destinazione",
        travel_slowest_ship: "Nave più lenta nella rotta",
        travel_stops: "Fermate intermedie (A/R)",
        travel_results: "Risultati Calcolo Rotta",
        travel_one_way: "Solo Andata (Base)",
        travel_round_trip_base: "Andata e Ritorno (Base)",
        travel_round_trip_real: "Andata e Ritorno Reale",
        travel_ship_effect: "Moltiplicatore Nave",
        travel_stops_penalty: "Penalità Fermate",
        travel_show_active_only: "Mostra solo città attive nel gioco",
        travel_highlight_city: "Evidenzia Città nella griglia",
        travel_days: "giorni",
        travel_days_short: "g.",
        travel_legend: "Moltiplicatori Velocità Navigazione",
  ```

- [ ] **Step 2: Inserire le chiavi di traduzione in inglese**
  Aggiungere le chiavi sotto `dashboard` nel blocco `en` in `src/i18n.ts`:
  ```typescript
        travel_times: "Travel Times",
        travel_times_title: "Hanseatic Travel Times",
        travel_times_desc: "View the sailing times matrix and calculate the real duration of your convoys taking into account ship types and route stops.",
        travel_origin: "Origin City",
        travel_destination: "Destination City",
        travel_slowest_ship: "Slowest ship on route",
        travel_stops: "Intermediate stops (R/T)",
        travel_results: "Route Calculation Results",
        travel_one_way: "One Way (Base)",
        travel_round_trip_base: "Round Trip (Base)",
        travel_round_trip_real: "Real Round Trip",
        travel_ship_effect: "Ship Multiplier",
        travel_stops_penalty: "Stops Penalty",
        travel_show_active_only: "Show active cities only",
        travel_highlight_city: "Highlight City in grid",
        travel_days: "days",
        travel_days_short: "d.",
        travel_legend: "Sailing Speed Multipliers",
  ```

- [ ] **Step 3: Verificare che l'applicazione compili correttamente**
  Run: `npm run build`
  Expected: Successo della compilazione senza errori di sintassi in `src/i18n.ts`.

---

### Task 2: Aggiornamento e Test della Logica di Dominio (GameEntity)

**Files:**
- Modify: `src/services/GameEntity.ts:386-398`
- Modify: `src/services/GameEntity.test.ts:245-246`

**Interfaces:**
- Consumes: `this.state.towns[townId].logistics.slowestShipType`, `this.constants.shipSpeedModifiers`
- Produces: Aggiornamento del comportamento di `getTownConvoyRoundTripTime(townId)` per includere il moltiplicatore nave.

- [ ] **Step 1: Modificare il metodo `getTownConvoyRoundTripTime`**
  Modificare il corpo del metodo in `src/services/GameEntity.ts` per applicare il moltiplicatore velocità basato su `slowestShipType`:
  ```typescript
    getTownConvoyRoundTripTime(townId: string): number {
      const town = this.state.towns[townId];
      if (!town || !town.isActive) return 0;
      
      const hubId = town.logistics.centralHubId;
      if (!hubId || hubId === 'none' || hubId === townId) return 0;

      const sailingTime = this.getTravelTime(townId, hubId);
      const baseRoundTrip = 2 * sailingTime;
      
      const shipType = town.logistics.slowestShipType || 'crayer';
      const speedMod = this.constants.shipSpeedModifiers?.[shipType] ?? 1.0;
      const durationWithShip = baseRoundTrip * speedMod;

      const stops = town.logistics.convoyStops || 0;
      const penalty = this.constants.loadingPenaltyPerStopDays ?? 0.25;

      return durationWithShip + (stops * penalty);
    }
  ```

- [ ] **Step 2: Eseguire i test unitari esistenti per verificare la retrocompatibilità**
  Run: `npm run test`
  Expected: Tutti i test in `GameEntity.test.ts` e `Services.test.ts` passano correttamente.

- [ ] **Step 3: Aggiungere un test unitario per il calcolo con nave più lenta (es. Kogge)**
  Aggiungere in `src/services/GameEntity.test.ts` (in fondo al file):
  ```typescript
  test('Game Entity applies ship speed modifier to convoy travel time', () => {
    const customConstants = {
      ...mockConstants,
      travelTimes: {
        lubeck: { rostock: 0.5 },
        rostock: { lubeck: 0.5 }
      },
      shipSpeedModifiers: {
        crayer: 1.0,
        cog: 1.32
      },
      loadingPenaltyPerStopDays: 0.25
    };
    
    const customState = JSON.parse(JSON.stringify(mockRawState)) as GameRawState;
    customState.towns.rostock = {
      townId: 'rostock',
      isActive: true,
      population: { rich: 10, wealthy: 20, poor: 100 },
      houses: { fachwerk: 0, giebel: 0, kaufmann: 0 },
      businesses: {},
      logistics: {
        centralHubId: 'lubeck',
        slowestShipType: 'cog',
        transitHubId: 'none',
        convoySize: 0,
        convoyStops: 2,
        stockWeeks: 2
      }
    };

    const game = new Game(customState, customConstants);

    // Rostock round-trip time with Cog:
    // Base A/R = 2 * 0.5 = 1.0 giorni.
    // Durata con Kogge = 1.0 * 1.32 = 1.32 giorni.
    // Penale Fermate = 2 * 0.25 = 0.50 giorni.
    // Totale = 1.32 + 0.50 = 1.82 giorni.
    const roundTrip = game.getTownConvoyRoundTripTime('rostock');
    expect(roundTrip).toBeCloseTo(1.82, 3);
  });
  ```

- [ ] **Step 4: Eseguire i test unitari completi**
  Run: `npm run test`
  Expected: Successo totale di tutti i test inclusa la nuova asserzione sul modificatore velocità.

---

### Task 3: Configurazione Rotte e Skeleton della Pagina

**Files:**
- Create: `src/pages/dashboard/TravelTimes.tsx` (Skeleton iniziale)
- Modify: `src/router.tsx:25-27`, `src/router.tsx:117-121`
- Modify: `src/layouts/DashboardLayout.tsx:23-28`

**Interfaces:**
- Consumes: Nessuna
- Produces: Registrazione della pagina dei tempi di viaggio nel layout della dashboard.

- [ ] **Step 1: Creare lo skeleton iniziale di `TravelTimes.tsx`**
  Scrivere il file `src/pages/dashboard/TravelTimes.tsx` con un rendering elementare per validare la rotta:
  ```tsx
  import React from 'react';
  import { useGame } from '../../contexts/GameContext';
  import UninitializedWarning from '../../components/UninitializedWarning';
  import { useTranslation } from 'react-i18next';

  const TravelTimes: React.FC = () => {
    const { game } = useGame();
    const { t } = useTranslation();

    if (!game) {
      return <UninitializedWarning />;
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-dark">{t('dashboard.travel_times_title')}</h1>
          <p className="text-sm text-neutral-medium mt-1">
            {t('dashboard.travel_times_desc')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm text-neutral-dark">
          Skeleton Page
        </div>
      </div>
    );
  };

  export default TravelTimes;
  ```

- [ ] **Step 2: Registrare il componente nel router**
  In `src/router.tsx`, importare il componente e registrarlo nel sotto-ramo `/dashboard`:
  ```tsx
  // Aggiungere l'importatione
  import TravelTimes from './pages/dashboard/TravelTimes';

  // Inserire la rotta all'interno dei children di /dashboard:
  {
    path: 'travel-times',
    element: <TravelTimes />
  }
  ```

- [ ] **Step 3: Integrare il link nella Sidebar di DashboardLayout**
  In `src/layouts/DashboardLayout.tsx`, inserire l'elemento logistico `travel-times` dopo `convoy-manager`:
  ```typescript
      { path: '/dashboard/convoy-manager', key: 'convoy_manager' },
      { path: '/dashboard/travel-times', key: 'travel_times' },
      { path: '/dashboard/all-in-one', key: 'all_in_one' },
  ```

- [ ] **Step 4: Avviare l'app in locale e testare il caricamento della rotta**
  Run: `npm run build` (o verificare visivamente se l'ambiente di sviluppo compila correttamente)
  Expected: La rotta `/dashboard/travel-times` si carica e mostra il titolo tradotto correttamente.

---

### Task 4: Sviluppo Completo di `TravelTimes.tsx`

**Files:**
- Modify: `src/pages/dashboard/TravelTimes.tsx` (Sovrascrivere interamente)

**Interfaces:**
- Consumes: `useGame()`, `useServices()`, `useTranslation()`
- Produces: Pagina interattiva con calcolatore di rotta reattivo e matrice 40x40 con evidenziazione celle e filtri.

- [ ] **Step 1: Scrivere il codice definitivo in `src/pages/dashboard/TravelTimes.tsx`**
  Sostituire il contenuto del file con il codice React completo:
  ```tsx
  import React, { useEffect, useState } from 'react';
  import { useGame } from '../../contexts/GameContext';
  import { useServices } from '../../servicesContext';
  import UninitializedWarning from '../../components/UninitializedWarning';
  import type { Town } from '../../types';
  import type { LocalizedShipType } from '../../services/ShipService';
  import { useTranslation } from 'react-i18next';
  import { Navigation, Compass, Layers, CheckSquare, Info } from 'lucide-react';

  const TravelTimes: React.FC = () => {
    const { game } = useGame();
    const { townService, shipService } = useServices();
    const { t, i18n } = useTranslation();

    const [towns, setTowns] = useState<Town[]>([]);
    const [ships, setShips] = useState<LocalizedShipType[]>([]);

    const [originId, setOriginId] = useState<string>('');
    const [destId, setDestId] = useState<string>('');
    const [slowestShip, setSlowestShip] = useState<string>('crayer');
    const [stops, setStops] = useState<number>(0);

    const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
    const [highlightCity, setHighlightCity] = useState<string>('');
    const [hoveredCell, setHoveredCell] = useState<{ r: string; c: string } | null>(null);

    const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

    useEffect(() => {
      townService.getTowns().then(setTowns);
      shipService.getShips(lang).then(setShips);
    }, [townService, shipService, lang]);

    if (!game) {
      return <UninitializedWarning />;
    }

    const activeTowns = towns.filter(town => {
      const townState = game.state.towns[town.id];
      return townState && townState.isActive;
    });

    // Auto-inizializzazione del simulatore
    if (activeTowns.length > 0 && !originId) {
      setOriginId(activeTowns[0].id);
      
      const defaultDest = activeTowns[1]?.id || activeTowns[0].id;
      setDestId(defaultDest);
    }

    // Caricamento dei parametri logistici predefiniti quando cambia la città di origine (approccio ibrido)
    useEffect(() => {
      if (game && originId) {
        const townState = game.state.towns[originId];
        if (townState) {
          setSlowestShip(townState.logistics.slowestShipType || 'crayer');
          setStops(townState.logistics.convoyStops || 0);

          // Prova a impostare la destinazione sull'Hub centrale se valido
          const hubId = townState.logistics.centralHubId;
          if (hubId && hubId !== 'none' && hubId !== originId && game.state.towns[hubId]?.isActive) {
            setDestId(hubId);
          }
        }
      }
    }, [originId, game]);

    // Filtraggio e ordinamento delle città per la griglia 40x40
    const gridTowns = towns
      .filter(t => {
        if (showActiveOnly) {
          const ts = game.state.towns[t.id];
          return ts && ts.isActive;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Calcoli per il simulatore
    const baseOneWay = originId && destId ? game.getTravelTime(originId, destId) : 0;
    const baseRoundTrip = baseOneWay * 2;
    const shipMultiplier = game.constants.shipSpeedModifiers?.[slowestShip] ?? 1.0;
    const timeWithShip = baseRoundTrip * shipMultiplier;
    const loadingPenalty = game.constants.loadingPenaltyPerStopDays ?? 0.25;
    const penaltyTotal = stops * loadingPenalty;
    const realRoundTrip = originId === destId ? 0 : timeWithShip + penaltyTotal;

    const currentOriginName = towns.find(t => t.id === originId)?.name || originId;
    const currentDestName = towns.find(t => t.id === destId)?.name || destId;

    return (
      <div className="space-y-6 text-neutral-dark">
        {/* Title Block */}
        <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-dark">{t('dashboard.travel_times_title')}</h1>
          <p className="text-sm text-neutral-medium mt-1">
            {t('dashboard.travel_times_desc')}
          </p>
        </div>

        {activeTowns.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm">
            {t('dashboard.no_towns_added')}
          </div>
        ) : (
          <>
            {/* Top Grid: Simulator & Legend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Simulator Panel */}
              <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
                  <Compass className="h-4 w-4 text-primary" />
                  <span>{lang === 'it' ? 'Simulatore di Rotta' : 'Route Simulator'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origin */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1">{t('dashboard.travel_origin')}</label>
                    <select
                      value={originId}
                      onChange={(e) => setOriginId(e.target.value)}
                      className="w-full p-2 border border-neutral-medium rounded text-sm bg-white font-bold"
                    >
                      {activeTowns.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1">{t('dashboard.travel_destination')}</label>
                    <select
                      value={destId}
                      onChange={(e) => setDestId(e.target.value)}
                      className="w-full p-2 border border-neutral-medium rounded text-sm bg-white font-bold"
                    >
                      {activeTowns.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Slowest Ship */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1">{t('dashboard.travel_slowest_ship')}</label>
                    <select
                      value={slowestShip}
                      onChange={(e) => setSlowestShip(e.target.value)}
                      className="w-full p-2 border border-neutral-medium rounded text-sm bg-white font-medium"
                    >
                      {ships.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({game.constants.shipSpeedModifiers?.[s.id]?.toFixed(2)}x)</option>
                      ))}
                    </select>
                  </div>

                  {/* Stops */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1">{t('dashboard.travel_stops')}</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={stops}
                      onChange={(e) => setStops(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 border border-neutral-medium rounded text-sm font-bold text-center"
                    />
                  </div>
                </div>

                {/* Display Results */}
                {originId === destId ? (
                  <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded text-xs font-medium text-center">
                    {lang === 'it' 
                      ? 'L\'origine e la destinazione coincidono. Seleziona due città diverse.' 
                      : 'Origin and destination are the same. Select two different cities.'}
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-neutral-medium">{t('dashboard.travel_results')}</div>
                      <div className="mt-2 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span>{t('dashboard.travel_one_way')}:</span>
                          <span className="font-semibold text-neutral-dark">{baseOneWay.toFixed(3)} {t('dashboard.travel_days')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('dashboard.travel_round_trip_base')}:</span>
                          <span className="font-semibold text-neutral-dark">{baseRoundTrip.toFixed(3)} {t('dashboard.travel_days')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('dashboard.travel_ship_effect')} ({ships.find(s => s.id === slowestShip)?.name}):</span>
                          <span className="font-semibold text-neutral-dark">x{shipMultiplier.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-primary/10 pt-1">
                          <span>{t('dashboard.travel_stops_penalty')} ({stops} stop):</span>
                          <span className="font-semibold text-neutral-dark">+{penaltyTotal.toFixed(2)} {t('dashboard.travel_days')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-primary/10 pt-4 md:pt-0 md:pl-4">
                      <div className="text-xs font-bold text-primary uppercase tracking-wider">{t('dashboard.travel_round_trip_real')}</div>
                      <div className="text-3xl font-extrabold text-primary mt-1">
                        {realRoundTrip.toFixed(3)} <span className="text-sm font-bold">{t('dashboard.travel_days_short')}</span>
                      </div>
                      <div className="text-[10px] text-neutral-medium mt-1 font-semibold text-center">
                        {currentOriginName} ⇄ {currentDestName}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend Panel */}
              <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4 self-start">
                <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span>{t('dashboard.travel_legend')}</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  {ships.map(s => {
                    const mod = game.constants.shipSpeedModifiers?.[s.id] ?? 1.0;
                    return (
                      <div key={s.id} className="flex justify-between items-center p-2 rounded bg-neutral-light/10 border border-neutral-light/50">
                        <span className="font-bold">{s.name}</span>
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                          mod === 1.0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {mod === 1.0 ? '1.00 (Base)' : `+${Math.round((mod - 1.0) * 100)}% (${mod.toFixed(2)}x)`}
                        </span>
                      </div>
                    );
                  })}
                  <div className="p-3 bg-neutral-light/20 text-[10px] text-neutral-medium rounded flex items-start space-x-1.5 border border-neutral-light">
                    <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      {lang === 'it' 
                        ? 'I modificatori aumentano il tempo di percorrenza. Una Kogge impiega il 32% di tempo in più rispetto al Crayer standard.' 
                        : 'Speed multipliers increase duration. A Cog takes 32% more travel time compared to standard Crayers.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Panel: Matrix 40x40 */}
            <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
              <div className="p-4 bg-neutral-light/20 border-b border-neutral-light flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-2 font-bold text-neutral-dark text-sm">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>{lang === 'it' ? 'Matrice Distanze di Sola Andata' : 'One-Way Distance Matrix'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  {/* Highlight city dropdown */}
                  <div className="flex items-center space-x-2">
                    <label>{t('dashboard.travel_highlight_city')}:</label>
                    <select
                      value={highlightCity}
                      onChange={(e) => setHighlightCity(e.target.value)}
                      className="p-1 border border-neutral-medium rounded bg-white font-medium"
                    >
                      <option value="">-- {lang === 'it' ? 'Nessuna' : 'None'} --</option>
                      {gridTowns.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Show active only checkbox */}
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showActiveOnly}
                      onChange={(e) => setShowActiveOnly(e.target.checked)}
                      className="rounded border-neutral-medium text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>{t('dashboard.travel_show_active_only')}</span>
                  </label>
                </div>
              </div>

              {/* Scroll Grid Wrapper */}
              <div className="overflow-auto max-h-[500px] border border-neutral-light rounded-lg m-4 shadow-inner relative">
                <table className="table-fixed text-left text-[10px] border-collapse min-w-max">
                  <thead className="sticky top-0 bg-white z-20 shadow-[0_1px_0_0_rgba(223,217,192,1)]">
                    <tr>
                      {/* Top-Left empty header cell */}
                      <th className="p-2 border-b border-r border-neutral-light bg-card text-neutral-dark font-bold text-center sticky left-0 z-30 min-w-[90px] max-w-[90px] shadow-[1px_1px_0_0_rgba(223,217,192,1)]">
                        {lang === 'it' ? 'A / R ➔' : 'To / From ➔'}
                      </th>
                      {gridTowns.map(tData => {
                        const isLight = highlightCity === tData.id;
                        return (
                          <th
                            key={tData.id}
                            className={`p-2 border-b border-r border-neutral-light text-neutral-dark font-bold text-center min-w-[75px] max-w-[75px] truncate ${
                              isLight ? 'bg-secondary/20 text-neutral-dark' : 'bg-neutral-light/50'
                            }`}
                            title={tData.name}
                          >
                            {tData.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {gridTowns.map(rowTown => {
                      const isRowHighlighted = highlightCity === rowTown.id;
                      
                      return (
                        <tr key={rowTown.id} className="border-b border-neutral-light font-medium text-neutral-dark hover:bg-neutral-light/5">
                          {/* Row Header sticky column */}
                          <td className={`p-2 border-r border-neutral-light font-bold sticky left-0 z-10 shadow-[1px_0_0_rgba(223,217,192,1)] truncate min-w-[90px] max-w-[90px] ${
                            isRowHighlighted ? 'bg-secondary/20 text-neutral-dark' : 'bg-white'
                          }`} title={rowTown.name}>
                            {rowTown.name}
                          </td>

                          {/* Distance values */}
                          {gridTowns.map(colTown => {
                            const val = game.getTravelTime(rowTown.id, colTown.id);
                            const isColHighlighted = highlightCity === colTown.id;
                            const isExactIntersection = rowTown.id === colTown.id;
                            
                            const isHoverMatch = hoveredCell && (rowTown.id === hoveredCell.r || colTown.id === hoveredCell.c);
                            const isHoverSelf = hoveredCell && rowTown.id === hoveredCell.r && colTown.id === hoveredCell.c;
                            
                            // Determine cell bg color based on highlight/hover states
                            let cellBg = 'bg-white';
                            if (isExactIntersection) {
                              cellBg = 'bg-neutral-light/30 text-neutral-medium/40';
                            } else if (isHoverSelf) {
                              cellBg = 'bg-primary/20 text-primary font-bold';
                            } else if (isHoverMatch) {
                              cellBg = 'bg-primary/5';
                            } else if (isRowHighlighted || isColHighlighted) {
                              cellBg = 'bg-secondary/5';
                            }

                            return (
                              <td
                                key={`${rowTown.id}-${colTown.id}`}
                                onMouseEnter={() => setHoveredCell({ r: rowTown.id, c: colTown.id })}
                                onMouseLeave={() => setHoveredCell(null)}
                                onClick={() => {
                                  if (!isExactIntersection) {
                                    setOriginId(rowTown.id);
                                    setDestId(colTown.id);
                                  }
                                }}
                                className={`p-2 border-r border-neutral-light text-center cursor-pointer transition-colors ${cellBg}`}
                                title={`${rowTown.name} ➔ ${colTown.name}: ${val.toFixed(3)} ${t('dashboard.travel_days')}`}
                              >
                                {isExactIntersection ? '0.0' : val.toFixed(2)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-neutral-light/20 text-[10px] text-neutral-medium flex items-start space-x-1.5 border-t border-neutral-light">
                <CheckSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  {lang === 'it' 
                    ? 'Fai click su una cella della griglia per caricare istantaneamente il tragitto corrispondente all\'interno del Simulatore in alto.' 
                    : 'Click on any grid cell to instantly load that route route into the Simulator panel above.'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  export default TravelTimes;
  ```

- [ ] **Step 2: Compilare e validare sintatticamente il file**
  Run: `npm run build`
  Expected: La compilazione di produzione di Vite e TypeScript si conclude con successo senza alcun errore.

---

### Task 5: Scrittura Test di Integrazione per la Pagina

**Files:**
- Create: `src/pages/dashboard/TravelTimes.test.tsx`

**Interfaces:**
- Consumes: `@testing-library/react`, `vitest`, `useGame()`, `useServices()`
- Produces: Test di verifica caricamento del componente.

- [ ] **Step 1: Scrivere il test per verificare il rendering**
  Creare il file `src/pages/dashboard/TravelTimes.test.tsx` con i mock appropriati e il test di caricamento:
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { expect, test, vi, beforeEach } from 'vitest';
  import { ServicesProvider } from '../../servicesContext';
  import { GameProvider } from '../../contexts/GameContext';
  import TravelTimes from './TravelTimes';

  // Mock i18next
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'it', changeLanguage: async () => {} }
    })
  }));

  // Mock per evitare caricamento di dati reali in ambiente test
  vi.mock('../../contexts/GameContext', () => {
    const mockGame = {
      state: {
        towns: {
          lubeck: {
            townId: 'lubeck',
            isActive: true,
            population: { rich: 10, wealthy: 20, poor: 100 },
            houses: { fachwerk: 1, giebel: 1, kaufmann: 1 },
            businesses: {},
            logistics: {
              centralHubId: 'none',
              slowestShipType: 'crayer',
              transitHubId: 'none',
              convoySize: 0,
              convoyStops: 0,
              stockWeeks: 2
            }
          }
        }
      },
      constants: {
        shipSpeedModifiers: { crayer: 1.0, cog: 1.32 },
        loadingPenaltyPerStopDays: 0.25,
        travelTimes: { lubeck: { rostock: 0.5 } }
      },
      getTravelTime: () => 0.5
    };
    return {
      useGame: () => ({ game: mockGame }),
      GameProvider: ({ children }: any) => <div>{children}</div>
    };
  });

  test('TravelTimes page loads page header successfully', () => {
    render(
      <ServicesProvider>
        <TravelTimes />
      </ServicesProvider>
    );

    // Verifica la presenza dell'intestazione
    expect(screen.getByText('dashboard.travel_times_title')).toBeDefined();
  });
  ```

- [ ] **Step 2: Eseguire i test di integrazione**
  Run: `npm run test`
  Expected: Il nuovo test unitario e di integrazione passano con successo (codice d'uscita 0).
