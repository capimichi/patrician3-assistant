# Impianto Icone di Gioco e Internazionalizzazione (i18n) - Piano di Implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrare le tre nuove icone grafiche di gioco (`barrel.png`, `load.png`, `hourglass.png`) in modo omogeneo e completare la traduzione (i18n) in lingua inglese per rimuovere tutti i testi hardcoded in italiano.

**Architecture:** 
1. Creazione del componente condiviso `GameIcon` con gestione degli errori integrata.
2. Centralizzazione di tutte le chiavi di traduzione in `src/i18n.ts`.
3. Refactoring delle viste e dei calcolatori per impiegare `GameIcon` e `useTranslation()`.

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library, react-i18next / i18next, TailwindCSS.

## Global Constraints
- Tutte le traduzioni e le icone devono supportare la commutazione di lingua al volo tramite l'apposito controllo dell'Header.
- Mantenere la compatibilità con i test esistenti tramite il mocking di `react-i18next` o l'aggiornamento accurato delle stringhe attese nei test.

---

### Task 1: Componente GameIcon e relativi test

**Files:**
- Create: `src/components/GameIcon.tsx`
- Create: `src/components/GameIcon.test.tsx`

**Interfaces:**
- Consumes: Icone fisiche in `public/images/` (`barrel.png`, `load.png`, `hourglass.png`)
- Produces: `<GameIcon type="..." className="..." alt="..." />`

- [ ] **Step 1: Scrivere il test per verificare il caricamento dell'icona e il fallback in caso di errore**
  ```tsx
  // src/components/GameIcon.test.tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import { expect, test } from 'vitest';
  import { GameIcon } from './GameIcon';

  test('renders GameIcon with correct image path and handles error fallback', () => {
    const { container } = render(<GameIcon type="barrel" alt="Barile" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/images/barrel.png');
    expect(img.getAttribute('alt')).toBe('Barile');

    // Simula errore di caricamento
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
  });
  ```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npx vitest run src/components/GameIcon.test.tsx`
  Expected: FAIL (Cannot find module './GameIcon' or similar)

- [ ] **Step 3: Scrivere l'implementazione minima del componente**
  ```tsx
  // src/components/GameIcon.tsx
  import React from 'react';

  interface GameIconProps {
    type: 'barrel' | 'load' | 'hourglass';
    className?: string;
    alt?: string;
  }

  export const GameIcon: React.FC<GameIconProps> = ({
    type,
    className = 'h-4 w-4 object-contain inline-block align-middle mr-1.5',
    alt
  }) => {
    return (
      <img
        src={`/images/${type}.png`}
        className={className}
        alt={alt || type}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  };
  ```

- [ ] **Step 4: Verificare che il test passi**
  Run: `npx vitest run src/components/GameIcon.test.tsx`
  Expected: PASS

---

### Task 2: Aggiornamento delle risorse di traduzione in i18n

**Files:**
- Modify: `src/i18n.ts`

**Interfaces:**
- Consumes: Oggetto di configurazione `resources` in `i18n.ts`
- Produces: Nuove chiavi nidificate sotto `production`, `routes`, `convoy`, `database_goods`, `database_businesses`, `database_towns` ecc.

- [ ] **Step 1: Aggiungere le chiavi per i18n sia per IT che per EN**
  Sostituire la struttura delle traduzioni in `src/i18n.ts` per includere tutti i namespace necessari.
  
  *Codice da iniettare in `src/i18n.ts`:*
  ```typescript
  const resources = {
    it: {
      translation: {
        header: {
          title: "Patrician III Assistant",
          home: "Home",
          database: "Database",
          calculators: "Calcolatori",
          goods: "Merci",
          businesses: "Imprese",
          towns: "Città",
          buildings: "Edifici",
          production: "Calcolatore Produzione",
          routes: "Ottimizzatore Rotte",
          convoy: "Gestore Convogli"
        },
        home: {
          welcome: "Benvenuto nel Patrician III Assistant",
          subtitle: "L'Impero dei Mari a portata di mano",
          desc: "Questo strumento ti aiuterà a calcolare le rotte commerciali più redditizie, simulare la produzione delle tue imprese anseatiche e gestire in maniera ottimale i tuoi convogli commerciali.",
          production_card: "Pianifica e controlla i consumi delle materie prime e la resa dei tuoi laboratori.",
          routes_card: "Ottimizza i prezzi di acquisto e vendita tra le città per massimizzare il profitto.",
          convoy_card: "Assembla la flotta ideale controllando la stiva reale, marinai e restrizioni fluviali.",
          open_tool: "Apri Strumento",
          league_title: "Lega Anseatica (Hanseatic League)",
          league_desc: "La Lega Anseatica fu un'alleanza commerciale di corporazioni e di città della Germania settentrionale e dell'Europa baltica che monopolizzò i commerci nel Nord Europa dal tardo Medioevo fino agli albori dell'era moderna. In Patrician III, il tuo obiettivo è scalare la piramide sociale da semplice Commerciante a Sindaco ed infine a Governatore della Lega."
        },
        common: {
          loading: "Caricamento...",
          back: "Indietro",
          select_town: "Seleziona Città",
          add: "Aggiungi",
          remove: "Rimuovi",
          profit: "Profitto",
          capacity: "Stiva",
          search_goods: "Cerca merce...",
          search_towns: "Cerca città...",
          search_businesses: "Cerca impresa...",
          no_results: "Nessun elemento trovato per"
        },
        production: {
          title: "Calcolatore di Produzione",
          subtitle: "Gestisci la rete commerciale anseatica simulando fabbriche, consumi e logistica delle risorse.",
          add_town_default: "-- Aggiungi Città --",
          tab_global: "Riepilogo Impero",
          tab_branches: "Gestione Filiali",
          maintenance_cost: "Costi di Manutenzione Giornalieri",
          total_workers: "Dipendenti Totali",
          active_cities: "Città Attive",
          global_balance: "Bilancio Globale Risorse",
          resource: "Risorsa",
          prod_day: "Produzione Totale",
          cons_day: "Consumo Totale",
          net_day: "Bilancio Netto",
          status: "Stato",
          empty_empire: "Nessuna impresa costruita nell'impero commerciale. Vai in \"Gestione Filiali\" per edificarne alcune.",
          empty_towns: "Nessuna città aggiunta al tuo impero. Usa il menu in alto a destra per iniziare.",
          river: "Fluviale",
          sea: "Marittimo",
          workers: "lavoratori",
          branches: "filiali",
          optimal: "Ottimale",
          penalty: "Penalità -25%",
          local_balance: "Bilancio Locale delle Risorse",
          empty_local: "Nessuna risorsa movimentata. Aggiungi laboratori per simulare la logistica locale.",
          day: "giorno",
          g_day: "g/giorno"
        },
        routes: {
          title: "Ottimizzatore di Rotte Commerciali",
          desc: "Seleziona due città commerciali per identificare istantaneamente le merci con il maggior potenziale di profitto.",
          origin: "Città di Partenza (Origine)",
          destination: "Città di Arrivo (Destinazione)",
          cargo_space: "Stiva Simulata (Barili)",
          river_warning_title: "Avviso Navigazione Fluviale",
          river_warning_desc: "Una delle due città selezionate è situata nell'entroterra fluviale. Ricordati che non potrai percorrere questa rotta con un convoglio contenente navi Cog o Holk. Dovrai impiegare esclusivamente Snaikka o Crayer.",
          rec_title: "Merci Consigliate per il Viaggio (Partenza da {{town}})",
          profit_margins: "Margini di Profitto",
          good: "Merce",
          recommended_buy: "Prezzo Acquisto Consigliato",
          recommended_sell: "Prezzo Vendita Consigliato",
          actual_buy: "Acquisto Effettivo (A)",
          actual_sell: "Vendita Effettiva (B)",
          margin_barrel: "Margine / Barile",
          estimated_profit: "Profitto Stimato ({{cargoSize}} Barili)",
          mass_consumption: "Largo Consumo",
          no_profitable_goods: "Non ci sono merci redditizie da trasportare su questa rotta basandosi sui prezzi correnti."
        },
        convoy: {
          title: "Gestore Convogli Navali",
          desc: "Assembla la tua flotta commerciale e calcola lo spazio stiva effettivo in base all'equipaggiamento bellico.",
          ships: "Navi del Convoglio",
          river_friendly: "Fluviale",
          seagoing: "D'alto Mare",
          ship_stats: "Stiva Base: {{baseCapacity}} • Marinai: {{min}} - {{max}} • Armi Max: {{maxWeapons}}",
          arm_none: "Nessuno",
          arm_partial: "Medio",
          arm_max: "Massimo",
          convoy_stats: "Statistiche Convoglio",
          total_ships: "Navi Totali",
          gross_cargo: "Stiva Lorda Totale",
          net_cargo: "Stiva Netta Totale",
          sailors: "Marinai (Min - Max)",
          installed_weapons: "Armi Installate",
          daily_expense: "Spesa Giornaliera",
          river_suitability: "Idoneità Fluviale",
          yes: "Sì",
          no: "No",
          empty_convoy: "Aggiungi navi al convoglio usando i controlli a sinistra per calcolare le statistiche della flotta."
        },
        database_goods: {
          title: "Merci & Listino Commerciale",
          back_list: "Torna al listino",
          not_found: "Risorsa non trovata",
          base_price: "Prezzo Base di Riferimento",
          recommended_buy: "Acquisto Consigliato (Max)",
          recommended_sell: "Vendita Consigliata (Min)",
          max_satisfaction: "Prezzo Max per Soddisfazione",
          cargo_space: "Spazio in Stiva",
          barrel: "barile",
          barrels: "barili",
          import_desc: "Questa merce non è prodotta nella Lega Anseatica. Può essere ottenuta esclusivamente organizzando spedizioni marittime con convogli nel Mar Mediterraneo o nelle Americhe.",
          production_structure: "Struttura Produttiva",
          std_workshop: "Laboratorio di produzione standard",
          production_day: "Produzione/Giorno",
          maintenance_day: "Manutenzione/Giorno",
          raw_materials: "Materie Prime Necessarie (Consumo/Giorno)",
          no_raw_materials: "Nessuna materia prima necessaria (Produzione autonoma)",
          producing_cities: "Città Produttrici",
          producing_desc: "Questa risorsa viene prodotta localmente nelle seguenti città anseatiche:",
          no_producing_cities: "Nessuna città produce direttamente questa merce.",
          industrial_demand: "Richiesta Industriale",
          industrial_desc: "Questa risorsa viene consumata come materia prima nei laboratori delle seguenti città:",
          no_industrial_cities: "Nessuna città consuma questa risorsa per la produzione industriale.",
          type_imported: "Import",
          type_raw: "Greggio",
          type_finished: "Finito",
          detail: "Dettaglio"
        },
        database_businesses: {
          title: "Laboratori & Fabbriche",
          back_list: "Torna alla lista",
          not_found: "Impresa non trovata",
          production_yield: "Resa di Produzione Standard",
          produced_goods: "Merci Prodotte",
          construction_cost: "Costo di Costruzione",
          gold_maint: "monete d'oro",
          bricks: "mattoni",
          timber: "legno",
          workers_needed: "Lavoratori Richiesti",
          maintenance_cost: "Costo di Gestione Giornaliero",
          raw_materials: "Materie Prime Richieste",
          producing_cities: "Città con Produzione Ottimale",
          producing_desc: "Questa impresa può essere edificata con efficienza massima (100% della resa) nelle seguenti città:",
          no_optimal_cities: "Nessuna città produce ottimamente questa merce (resa sempre penalizzata).",
          other_cities: "Altre Città",
          penalty_desc: "Nelle città non elencate sopra, l'impresa subirà una penalità permanente del 25% sulla produzione al giorno, mantenendo però invariati i consumi di materie prime e i costi gestionali.",
          raw_materials_desc: "Consumo al giorno per laboratorio a pieno regime:",
          no_raw_needed: "Nessuna materia prima richiesta",
          optimal: "Ottimale (100%)",
          penalty: "Penale (-25%)",
          workers: "lavoratori",
          maint_day: "/giorno",
          columns: {
            outputs: "Prodotti in Uscita",
            inputs: "Materie Prime",
            cost: "Costo Oro",
            bricks: "Mattoni",
            timber: "Legno",
            workers: "Lavoratori",
            maintenance: "Costo Fissato"
          }
        },
        database_towns: {
          title: "Database delle Città",
          back_list: "Torna alle città",
          not_found: "Città non trovata",
          type: "Tipo di Città",
          river: "Fluviale",
          sea: "Marittima (Mar Baltico / Mare del Nord)",
          produced_goods: "Merci Prodotte in Questa Città",
          specialty_desc: "Questa città possiede le condizioni ideali per produrre le risorse elencate sopra. Eventuali imprese edificate qui produrranno a piena efficienza (100%).",
          other_goods: "Altre Produzioni",
          penalty_desc: "Esempio: Se costruisci un'impresa di un bene non specializzato in questa città, la fabbrica produrrà il 25% in meno al giorno, mantenendo intatti i consumi di materie prime e costi di gestione.",
          optimal_businesses: "Fabbriche Consigliate",
          penalty_businesses: "Fabbriche Penalizzate (-25%)",
          empty_list: "Nessuna città trovata",
          columns: {
            type: "Tipo",
            produces: "Merci Prodotte",
            actions: "Azioni"
          }
        },
        database_buildings: {
          title: "Edifici Pubblici & Abitativi",
          columns: {
            cost: "Costo",
            maintenance: "Manutenzione",
            tax: "Tasse",
            capacity: "Capacità/Effetto",
            inhabitants: "Abitanti"
          }
        }
      }
    },
    en: {
      translation: {
        header: {
          title: "Patrician III Assistant",
          home: "Home",
          database: "Database",
          calculators: "Calculators",
          goods: "Goods",
          businesses: "Businesses",
          towns: "Towns",
          buildings: "Buildings",
          production: "Production Calculator",
          routes: "Route Optimizer",
          convoy: "Convoy Manager"
        },
        home: {
          welcome: "Welcome to Patrician III Assistant",
          subtitle: "The Rise of the Hanse in your hands",
          desc: "This tool will help you calculate the most profitable trade routes, simulate the production of your Hanseatic businesses, and optimally manage your commercial convoys.",
          production_card: "Plan and monitor raw material consumption and production yields of your workshops.",
          routes_card: "Optimize purchase and selling prices between cities to maximize profits.",
          convoy_card: "Assemble the ideal fleet by checking real cargo capacity, crew, and river constraints.",
          open_tool: "Open Tool",
          league_title: "Hanseatic League",
          league_desc: "The Hanseatic League was a commercial and defensive confederation of merchant guilds and market towns in Northwestern and Central Europe, monopolizing Northern European trade from the Late Middle Ages to the early modern period. In Patrician III, your goal is to climb the social ladder from a simple Trader to Lord Mayor and finally Governor of the League."
        },
        common: {
          loading: "Loading...",
          back: "Back",
          select_town: "Select Town",
          add: "Add",
          remove: "Remove",
          profit: "Profit",
          capacity: "Capacity",
          search_goods: "Search goods...",
          search_towns: "Search towns...",
          search_businesses: "Search business...",
          no_results: "No results found for"
        },
        production: {
          title: "Production Calculator",
          subtitle: "Manage the Hanseatic trade network by simulating factories, resource consumption, and logistics.",
          add_town_default: "-- Add City --",
          tab_global: "Empire Summary",
          tab_branches: "Manage Branches",
          maintenance_cost: "Daily Maintenance Costs",
          total_workers: "Total Workers",
          active_cities: "Active Cities",
          global_balance: "Global Resource Balance",
          resource: "Resource",
          prod_day: "Total Production",
          cons_day: "Total Consumption",
          net_day: "Net Balance",
          status: "Status",
          empty_empire: "No businesses built in your trade empire. Go to \"Manage Branches\" to construct some.",
          empty_towns: "No cities added to your empire. Use the top-right menu to start.",
          river: "River",
          sea: "Maritime",
          workers: "workers",
          branches: "branches",
          optimal: "Optimal",
          penalty: "Penalty -25%",
          local_balance: "Local Resource Balance",
          empty_local: "No resources moved. Add workshops to simulate local logistics.",
          day: "day",
          g_day: "g/day"
        },
        routes: {
          title: "Trade Route Optimizer",
          desc: "Select two commercial cities to instantly identify goods with the highest profit potential.",
          origin: "Starting City (Origin)",
          destination: "Arrival City (Destination)",
          cargo_space: "Simulated Cargo Space (Barrels)",
          river_warning_title: "River Navigation Warning",
          river_warning_desc: "One of the two selected cities is located inland along a river. Remember that you cannot travel this route with a convoy containing Cog or Holk ships. You must exclusively use Snaikka or Crayer.",
          rec_title: "Recommended Goods for the Voyage (Starting from {{town}})",
          profit_margins: "Profit Margins",
          good: "Good",
          recommended_buy: "Recommended Buy Price",
          recommended_sell: "Recommended Sell Price",
          actual_buy: "Actual Buy Price (A)",
          actual_sell: "Actual Sell Price (B)",
          margin_barrel: "Margin / Barrel",
          estimated_profit: "Estimated Profit ({{cargoSize}} Barrels)",
          mass_consumption: "Mass Consumption",
          no_profitable_goods: "There are no profitable goods to transport on this route based on current prices."
        },
        convoy: {
          title: "Naval Convoy Manager",
          desc: "Assemble your trade fleet and calculate actual cargo space based on weapons equipment.",
          ships: "Convoy Ships",
          river_friendly: "River Friendly",
          seagoing: "Seagoing",
          ship_stats: "Base Cargo: {{baseCapacity}} • Sailors: {{min}} - {{max}} • Max Weapons: {{maxWeapons}}",
          arm_none: "None",
          arm_partial: "Medium",
          arm_max: "Max",
          convoy_stats: "Convoy Statistics",
          total_ships: "Total Ships",
          gross_cargo: "Total Gross Cargo",
          net_cargo: "Total Net Cargo",
          sailors: "Sailors (Min - Max)",
          installed_weapons: "Installed Weapons",
          daily_expense: "Daily Expense",
          river_suitability: "River Suitability",
          yes: "Yes",
          no: "No",
          empty_convoy: "Add ships to the convoy using the controls on the left to calculate fleet statistics."
        },
        database_goods: {
          title: "Goods & Commercial Price List",
          back_list: "Back to list",
          not_found: "Resource not found",
          base_price: "Reference Base Price",
          recommended_buy: "Recommended Buy (Max)",
          recommended_sell: "Recommended Sell (Min)",
          max_satisfaction: "Max Satisfaction Price",
          cargo_space: "Cargo Space",
          barrel: "barrel",
          barrels: "barrels",
          import_desc: "This good is not produced in the Hanseatic League. It can only be obtained by organizing sea expeditions with convoys in the Mediterranean Sea or the Americas.",
          production_structure: "Production Structure",
          std_workshop: "Standard production workshop",
          production_day: "Production/Day",
          maintenance_day: "Maintenance/Day",
          raw_materials: "Raw Materials Needed (Consumption/Day)",
          no_raw_materials: "No raw materials needed (Self-sufficient production)",
          producing_cities: "Producing Cities",
          producing_desc: "This resource is produced locally in the following Hanseatic cities:",
          no_producing_cities: "No city directly produces this good.",
          industrial_demand: "Industrial Demand",
          industrial_desc: "This resource is consumed as a raw material in workshops in the following cities:",
          no_industrial_cities: "No city consumes this resource for industrial production.",
          type_imported: "Import",
          type_raw: "Raw",
          type_finished: "Finished",
          detail: "Detail"
        },
        database_businesses: {
          title: "Workshops & Factories",
          back_list: "Back to list",
          not_found: "Business not found",
          production_yield: "Standard Production Yield",
          produced_goods: "Produced Goods",
          construction_cost: "Construction Cost",
          gold_maint: "gold coins",
          bricks: "bricks",
          timber: "timber",
          workers_needed: "Workers Required",
          maintenance_cost: "Daily Maintenance Cost",
          raw_materials: "Raw Materials Required",
          producing_cities: "Cities with Optimal Production",
          producing_desc: "This business can be built with maximum efficiency (100% yield) in the following cities:",
          no_optimal_cities: "No city produces this good optimally (yield is always penalized).",
          other_cities: "Other Cities",
          penalty_desc: "In cities not listed above, the business will suffer a permanent 25% production penalty per day, while maintaining raw material consumption and daily costs unchanged.",
          raw_materials_desc: "Consumption per day for workshop at full capacity:",
          no_raw_needed: "No raw materials required",
          optimal: "Optimal (100%)",
          penalty: "Penalty (-25%)",
          workers: "workers",
          maint_day: "/day",
          columns: {
            outputs: "Output Products",
            inputs: "Raw Materials",
            cost: "Gold Cost",
            bricks: "Bricks",
            timber: "Timber",
            workers: "Workers",
            maintenance: "Fixed Cost"
          }
        },
        database_towns: {
          title: "Town Database",
          back_list: "Back to towns",
          not_found: "Town not found",
          type: "Town Type",
          river: "River",
          sea: "Maritime (Baltic Sea / North Sea)",
          produced_goods: "Goods Produced in This Town",
          specialty_desc: "This town has the ideal conditions to produce the resources listed above. Businesses built here will produce at full efficiency (100%).",
          other_goods: "Other Production",
          penalty_desc: "Example: If you build a business for a non-specialized good in this town, the factory will produce 25% less per day, keeping raw material consumption and maintenance costs unchanged.",
          optimal_businesses: "Recommended Businesses",
          penalty_businesses: "Penalized Businesses (-25%)",
          empty_list: "No towns found",
          columns: {
            type: "Type",
            produces: "Goods Produced",
            actions: "Actions"
          }
        },
        database_buildings: {
          title: "Public & Residential Buildings",
          columns: {
            cost: "Cost",
            maintenance: "Maintenance",
            tax: "Taxes",
            capacity: "Capacity/Effect",
            inhabitants: "Inhabitants"
          }
        }
      }
    }
  };
  ```

- [ ] **Step 2: Eseguire i test preesistenti per assicurarsi che non si rompano**
  Run: `npm run test`
  Expected: PASS

---

### Task 3: Aggiornamento del Listino Merci (GoodsList) e Scheda Dettaglio (GoodDetail)

**Files:**
- Modify: `src/pages/database/GoodsList.tsx`
- Modify: `src/pages/database/GoodDetail.tsx`

**Interfaces:**
- Consumes: `<GameIcon>` di Task 1 e stringhe tradotte di Task 2

- [ ] **Step 1: Integrare GameIcon e useTranslation in GoodsList.tsx**
  Nel file `GoodsList.tsx`, importare `GameIcon` e aggiornare le traduzioni:
  ```tsx
  import { GameIcon } from '../../components/GameIcon';
  // ...
  // Sostituire le label all'inizio con useTranslation o usare le chiavi dinamiche
  const typeText = good.isImported 
    ? t('database_goods.type_imported') 
    : good.isRawMaterial 
    ? t('database_goods.type_raw') 
    : t('database_goods.type_finished');

  const typeIcon = good.isRawMaterial ? (
    <GameIcon type="load" />
  ) : !good.isImported ? (
    <GameIcon type="barrel" />
  ) : null;
  
  // Nello span:
  <span className="...">
    {typeIcon}
    {typeText}
  </span>
  ```

- [ ] **Step 2: Integrare GameIcon e useTranslation in GoodDetail.tsx**
  Sostituire i testi hardcoded con le traduzioni (`database_goods.*`) e inserire le icone appropriate accanto a "Materia Grezza" / "Bene Finito" e "/giorno" (clessidra).
  ```tsx
  import { GameIcon } from '../../components/GameIcon';
  // ...
  <span className="...">
    {good.isRawMaterial ? <GameIcon type="load" /> : <GameIcon type="barrel" />}
    {good.isImported ? t('database_goods.type_imported') : good.isRawMaterial ? t('database_goods.type_raw') : t('database_goods.type_finished')}
  </span>
  ```

- [ ] **Step 3: Verificare il superamento dei test correlati**
  Run: `npx vitest run GoodsList.test.tsx GoodDetail.test.tsx`
  Expected: PASS

---

### Task 4: Aggiornamento di Imprese (BusinessesList e BusinessDetail) e Città (TownsList e TownDetail)

**Files:**
- Modify: `src/pages/database/BusinessesList.tsx`
- Modify: `src/pages/database/BusinessDetail.tsx`
- Modify: `src/pages/database/TownsList.tsx`
- Modify: `src/pages/database/TownDetail.tsx`

**Interfaces:**
- Consumes: `<GameIcon>` e chiavi i18n di Task 2

- [ ] **Step 1: Aggiornare BusinessesList.tsx e BusinessDetail.tsx**
  * Sostituire i testi delle tabelle e dei dettagli con le chiavi `database_businesses.*`.
  * Visualizzare l'icona clessidra `hourglass` per i costi giornalieri `/giorno` e la resa produttiva.
  * Visualizzare l'icona `load` nei titoli delle materie prime.

- [ ] **Step 2: Aggiornare TownsList.tsx e TownDetail.tsx**
  * Sostituire i testi con le chiavi `database_towns.*`.

- [ ] **Step 3: Eseguire tutti i test del database per validare**
  Run: `npm run test`
  Expected: PASS

---

### Task 5: Aggiornamento dei Calcolatori (Production, Routes, Convoy)

**Files:**
- Modify: `src/pages/calculators/Production.tsx`
- Modify: `src/pages/calculators/Routes.tsx`
- Modify: `src/pages/calculators/Convoy.tsx`

**Interfaces:**
- Consumes: `<GameIcon>` e chiavi i18n di Task 2

- [ ] **Step 1: Refactoring in Production.tsx**
  * Importare `GameIcon`.
  * Sostituire tutti i testi hardcoded in italiano.
  * Inserire l'icona `hourglass` nella colonna "Bilancio Netto / Giorno" dell'Impero e accanto a "g/giorno" per i costi di manutenzione e filiali.
  * Inserire `GameIcon type="load"` o `type="barrel"` in base al tipo di risorsa prodotta o consumata nella tabella del bilancio.

- [ ] **Step 2: Refactoring in Routes.tsx**
  * Sostituire tutti i testi e le traduzioni.
  * Inserire l'icona clessidra `hourglass` per indicare la durata del viaggio o i valori calcolati giornalieri (se applicabile).

- [ ] **Step 3: Refactoring in Convoy.tsx**
  * Sostituire tutti i testi hardcoded.
  * Inserire l'icona clessidra `hourglass` accanto al calcolo della "Spesa Giornaliera".

- [ ] **Step 4: Eseguire l'intera suite di test del progetto per validare**
  Run: `npm run test`
  Expected: PASS
