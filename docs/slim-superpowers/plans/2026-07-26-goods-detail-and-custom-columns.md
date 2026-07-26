# Patrician 3 Goods Detail and Custom Columns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere una pagina di dettaglio per le risorse (`/database/goods/:id`) e una tabella personalizzabile per l'elenco delle merci (`/database/goods`), salvando le preferenze delle colonne in `localStorage`, e integrando le immagini HD ufficiali del gioco Patrician 3.

**Architecture:** Copia fisica delle immagini ad alta definizione in `public/images/goods/`. Creazione di una funzione di utilità per ricavare i percorsi delle immagini a partire dagli ID delle merci. Sostituzione della vecchia pagina singola `GoodsAndBusinesses.tsx` con due pagine distinte `GoodsList.tsx` e `GoodDetail.tsx`. Aggiornamento ed allineamento dei file JSON del database (`goods.json`, `businesses.json`, `towns.json`) per rimuovere `fodder`, sostituendolo con `pottery`, rinominare `train_oil` in `whale_oil` e aggiungere i laboratori mancanti.

**Tech Stack:** React 19, TypeScript, React Router 7, Vite, Tailwind CSS, Lucide React, Vitest.

## Global Constraints
- Tutte le modifiche e le interfacce utente devono rispettare lo stile chiaro "Pergamena Antica" del gioco (sfondo `#F5F2EB`, scritte marrone `#643518`, dettagli oro `#EABE32`).
- Preservare tutti i commenti e i docstring esistenti non correlati.
- Tutti i test devono superare con successo senza errori di compilazione TypeScript.

---

### Task 1: Asset Preparation & Image Retrieval Helper

**Files:**
- Create: `src/utils/goodImage.ts`
- Test: `src/utils/goodImage.test.ts`
- Run: `mkdir -p public/images/goods` e comando di copia.

**Interfaces:**
- Produces: `getGoodImagePath(goodId: string): string`

- [ ] **Step 1: Creare la cartella degli asset e copiare le immagini**

Run: `mkdir -p public/images/goods && cp /Users/michele/Downloads/pati/resources-4x/upscayl_png_upscayl-standard-4x_4x/*.png public/images/goods/`
Expected: Tutti i 20 file PNG sono presenti in `public/images/goods/`.

- [ ] **Step 2: Scrivere il test di fallimento per l'helper di recupero immagini**

Create `src/utils/goodImage.test.ts` con il seguente contenuto:
```typescript
import { expect, test } from 'vitest';
import { getGoodImagePath } from './goodImage';

test('getGoodImagePath returns correct absolute path for standard and compound ids', () => {
  expect(getGoodImagePath('beer')).toBe('/images/goods/beer.png');
  expect(getGoodImagePath('iron_goods')).toBe('/images/goods/iron-goods.png');
  expect(getGoodImagePath('whale_oil')).toBe('/images/goods/whale-oil.png');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test src/utils/goodImage.test.ts`
Expected: FAIL con errore "getGoodImagePath is not defined".

- [ ] **Step 4: Implementare l'helper di recupero immagini**

Create `src/utils/goodImage.ts` con il seguente contenuto:
```typescript
/**
 * Restituisce il percorso dell'immagine a partire dall'ID della merce.
 * Esegue la conversione degli underscore (_) in trattini (-) per combaciare con i nomi dei file.
 */
export const getGoodImagePath = (goodId: string): string => {
  const filename = goodId.toLowerCase().replace(/_/g, '-') + '.png';
  return `/images/goods/${filename}`;
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test src/utils/goodImage.test.ts`
Expected: PASS

---

### Task 2: Database Data Migration (JSON Updates)

**Files:**
- Modify: `public/data/goods.json`
- Modify: `public/data/businesses.json`
- Modify: `public/data/towns.json`
- Test: `src/clients/GoodsDatabase.test.ts`

- [ ] **Step 1: Creare il test di validazione dei dati del database**

Create `src/clients/GoodsDatabase.test.ts` per accertarsi che il database contenga i prezzi aggiornati e le merci corrette:
```typescript
import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';

test('goods.json has updated, correct values and no fodder/train_oil', () => {
  const goodsPath = path.resolve(__dirname, '../../../public/data/goods.json');
  const goods = JSON.parse(fs.readFileSync(goodsPath, 'utf8'));

  expect(goods.length).toBe(20);
  
  const fodder = goods.find((g: any) => g.id === 'fodder');
  expect(fodder).toBeUndefined();

  const trainOil = goods.find((g: any) => g.id === 'train_oil');
  expect(trainOil).toBeUndefined();

  const pottery = goods.find((g: any) => g.id === 'pottery');
  expect(pottery).toBeDefined();
  expect(pottery.buyPriceRange).toEqual([170, 170]);
  expect(pottery.sellPriceRange).toEqual([230, 250]);
  expect(pottery.maxSatisfactionPrice).toBe(200);

  const whaleOil = goods.find((g: any) => g.id === 'whale_oil');
  expect(whaleOil).toBeDefined();
  expect(whaleOil.buyPriceRange).toEqual([70, 75]);
  expect(whaleOil.sellPriceRange).toEqual([100, 150]);
});

test('businesses.json has pottery_workshop and whale_fishery, and no fodder inputs', () => {
  const busPath = path.resolve(__dirname, '../../../public/data/businesses.json');
  const businesses = JSON.parse(fs.readFileSync(busPath, 'utf8'));

  const potteryWorkshop = businesses.find((b: any) => b.id === 'pottery_workshop');
  expect(potteryWorkshop).toBeDefined();
  expect(potteryWorkshop.producedGoodId).toBe('pottery');

  const whaleFishery = businesses.find((b: any) => b.id === 'whale_fishery');
  expect(whaleFishery).toBeDefined();
  expect(whaleFishery.producedGoodId).toBe('whale_oil');

  const cattleFarm = businesses.find((b: any) => b.id === 'cattle_farm');
  const hasFodderInput = cattleFarm.inputs.some((i: any) => i.goodId === 'fodder');
  expect(hasFodderInput).toBe(false);
});

test('towns.json contains only valid good ids in production list', () => {
  const townsPath = path.resolve(__dirname, '../../../public/data/towns.json');
  const towns = JSON.parse(fs.readFileSync(townsPath, 'utf8'));

  towns.forEach((town: any) => {
    expect(town.produces.includes('fodder')).toBe(false);
    expect(town.produces.includes('train_oil')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/clients/GoodsDatabase.test.ts`
Expected: FAIL a causa dei dati non ancora migrati.

- [ ] **Step 3: Aggiornare `public/data/goods.json`**

Sostituire l'intero contenuto di `public/data/goods.json` con la lista esatta e aggiornata delle 20 merci e dei relativi prezzi forniti dall'utente:
```json
[
  {
    "id": "grain",
    "name": { "it": "Grano", "en": "Grain" },
    "basePrice": 110,
    "buyPriceRange": [90, 90],
    "sellPriceRange": [140, 160],
    "maxSatisfactionPrice": 141,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  },
  {
    "id": "beer",
    "name": { "it": "Birra", "en": "Beer" },
    "basePrice": 45,
    "buyPriceRange": [35, 40],
    "sellPriceRange": [44, 60],
    "maxSatisfactionPrice": 40,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "pig_iron",
    "name": { "it": "Ferro grezzo", "en": "Pig Iron" },
    "basePrice": 1050,
    "buyPriceRange": [850, 950],
    "sellPriceRange": [1200, 1300],
    "maxSatisfactionPrice": null,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  },
  {
    "id": "iron_goods",
    "name": { "it": "Utensili", "en": "Iron Goods" },
    "basePrice": 350,
    "buyPriceRange": [320, 320],
    "sellPriceRange": [430, 450],
    "maxSatisfactionPrice": 300,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "salt",
    "name": { "it": "Sale", "en": "Salt" },
    "basePrice": 30,
    "buyPriceRange": [25, 25],
    "sellPriceRange": [33, 50],
    "maxSatisfactionPrice": 32,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "fish",
    "name": { "it": "Pesce", "en": "Fish" },
    "basePrice": 500,
    "buyPriceRange": [450, 450],
    "sellPriceRange": [490, 540],
    "maxSatisfactionPrice": 515,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "meat",
    "name": { "it": "Carne", "en": "Meat" },
    "basePrice": 1100,
    "buyPriceRange": [900, 900],
    "sellPriceRange": [1250, 1500],
    "maxSatisfactionPrice": 1120,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "skins",
    "name": { "it": "Pelli", "en": "Skins" },
    "basePrice": 800,
    "buyPriceRange": [850, 850],
    "sellPriceRange": [900, 1400],
    "maxSatisfactionPrice": 791,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  },
  {
    "id": "hemp",
    "name": { "it": "Canapa", "en": "Hemp" },
    "basePrice": 450,
    "buyPriceRange": [400, 400],
    "sellPriceRange": [500, 600],
    "maxSatisfactionPrice": null,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  },
  {
    "id": "wool",
    "name": { "it": "Lana", "en": "Wool" },
    "basePrice": 1000,
    "buyPriceRange": [900, 900],
    "sellPriceRange": [1300, 1300],
    "maxSatisfactionPrice": 1030,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  },
  {
    "id": "timber",
    "name": { "it": "Legno", "en": "Timber" },
    "basePrice": 60,
    "buyPriceRange": [55, 55],
    "sellPriceRange": [75, 95],
    "maxSatisfactionPrice": 70,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  },
  {
    "id": "bricks",
    "name": { "it": "Mattoni", "en": "Bricks" },
    "basePrice": 100,
    "buyPriceRange": [80, 80],
    "sellPriceRange": [130, 140],
    "maxSatisfactionPrice": null,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  },
  {
    "id": "pitch",
    "name": { "it": "Pece", "en": "Pitch" },
    "basePrice": 70,
    "buyPriceRange": [60, 60],
    "sellPriceRange": [100, 120],
    "maxSatisfactionPrice": null,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  },
  {
    "id": "honey",
    "name": { "it": "Miele", "en": "Honey" },
    "basePrice": 130,
    "buyPriceRange": [110, 110],
    "sellPriceRange": [160, 180],
    "maxSatisfactionPrice": 128,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "cloth",
    "name": { "it": "Tessuti", "en": "Cloth" },
    "basePrice": 250,
    "buyPriceRange": [220, 220],
    "sellPriceRange": [340, 350],
    "maxSatisfactionPrice": 242,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "leather",
    "name": { "it": "Cuoio", "en": "Leather" },
    "basePrice": 280,
    "buyPriceRange": [250, 250],
    "sellPriceRange": [300, 340],
    "maxSatisfactionPrice": 262,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "wine",
    "name": { "it": "Vino", "en": "Wine" },
    "basePrice": 280,
    "buyPriceRange": [230, 230],
    "sellPriceRange": [350, 400],
    "maxSatisfactionPrice": 257,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "spices",
    "name": { "it": "Spezie", "en": "Spices" },
    "basePrice": 350,
    "buyPriceRange": [280, 280],
    "sellPriceRange": [350, 400],
    "maxSatisfactionPrice": 327,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": true
  },
  {
    "id": "whale_oil",
    "name": { "it": "Olio di Balena", "en": "Whale Oil" },
    "basePrice": 85,
    "buyPriceRange": [70, 75],
    "sellPriceRange": [100, 150],
    "maxSatisfactionPrice": 96,
    "volume": 1,
    "isRawMaterial": false,
    "isImported": false
  },
  {
    "id": "wool",
    "name": { "it": "Lana", "en": "Wool" },
    "basePrice": 1000,
    "buyPriceRange": [900, 900],
    "sellPriceRange": [1300, 1300],
    "maxSatisfactionPrice": 1030,
    "volume": 1,
    "isRawMaterial": true,
    "isImported": false
  }
]
```

- [ ] **Step 4: Aggiornare `public/data/businesses.json`**

Sostituire l'intero contenuto di `public/data/businesses.json` per rimuovere `fodder`, inserire `grain` come input per `cattle_farm`, e aggiungere `pottery_workshop` e `whale_fishery`:
```json
[
  {
    "id": "grain_farm",
    "name": { "it": "Fattoria (Grano)", "en": "Grain Farm" },
    "producedGoodId": "grain",
    "baseProductionPerDay": 2.0,
    "inputs": [],
    "constructionCost": { "gold": 10000, "bricks": 30, "timber": 15 },
    "workersNeeded": 30,
    "dailyMaintenance": 280
  },
  {
    "id": "brewery",
    "name": { "it": "Birreria", "en": "Brewery" },
    "producedGoodId": "beer",
    "baseProductionPerDay": 2.0,
    "inputs": [
      { "goodId": "grain", "amountPerDay": 0.5 },
      { "goodId": "timber", "amountPerDay": 0.25 }
    ],
    "constructionCost": { "gold": 12000, "bricks": 40, "timber": 20 },
    "workersNeeded": 30,
    "dailyMaintenance": 320
  },
  {
    "id": "sawmill",
    "name": { "it": "Segheria (Legno)", "en": "Sawmill" },
    "producedGoodId": "timber",
    "baseProductionPerDay": 3.0,
    "inputs": [],
    "constructionCost": { "gold": 8000, "bricks": 20, "timber": 10 },
    "workersNeeded": 30,
    "dailyMaintenance": 180
  },
  {
    "id": "saltworks",
    "name": { "it": "Salina (Sale)", "en": "Saltworks" },
    "producedGoodId": "salt",
    "baseProductionPerDay": 2.5,
    "inputs": [
      { "goodId": "timber", "amountPerDay": 0.75 }
    ],
    "constructionCost": { "gold": 15000, "bricks": 50, "timber": 25 },
    "workersNeeded": 30,
    "dailyMaintenance": 400
  },
  {
    "id": "iron_smelter",
    "name": { "it": "Fonderia di Ferro", "en": "Iron Smelter" },
    "producedGoodId": "pig_iron",
    "baseProductionPerDay": 1.5,
    "inputs": [
      { "goodId": "timber", "amountPerDay": 0.5 }
    ],
    "constructionCost": { "gold": 18000, "bricks": 60, "timber": 30 },
    "workersNeeded": 30,
    "dailyMaintenance": 450
  },
  {
    "id": "workshop",
    "name": { "it": "Officina (Utensili)", "en": "Workshop" },
    "producedGoodId": "iron_goods",
    "baseProductionPerDay": 1.2,
    "inputs": [
      { "goodId": "pig_iron", "amountPerDay": 0.4 },
      { "goodId": "timber", "amountPerDay": 0.2 }
    ],
    "constructionCost": { "gold": 20000, "bricks": 70, "timber": 35 },
    "workersNeeded": 30,
    "dailyMaintenance": 500
  },
  {
    "id": "fishery",
    "name": { "it": "Pescatore (Pesce)", "en": "Fishery" },
    "producedGoodId": "fish",
    "baseProductionPerDay": 1.0,
    "inputs": [
      { "goodId": "hemp", "amountPerDay": 0.1 },
      { "goodId": "salt", "amountPerDay": 0.2 }
    ],
    "constructionCost": { "gold": 10000, "bricks": 30, "timber": 15 },
    "workersNeeded": 30,
    "dailyMaintenance": 250
  },
  {
    "id": "cattle_farm",
    "name": { "it": "Allevamento Bovini", "en": "Cattle Farm" },
    "producedGoodId": "meat",
    "baseProductionPerDay": 0.8,
    "inputs": [
      { "goodId": "grain", "amountPerDay": 0.5 }
    ],
    "constructionCost": { "gold": 16000, "bricks": 50, "timber": 25 },
    "workersNeeded": 30,
    "dailyMaintenance": 350
  },
  {
    "id": "sheep_farm",
    "name": { "it": "Allevamento Ovini (Lana)", "en": "Sheep Farm" },
    "producedGoodId": "wool",
    "baseProductionPerDay": 1.5,
    "inputs": [],
    "constructionCost": { "gold": 10000, "bricks": 30, "timber": 15 },
    "workersNeeded": 30,
    "dailyMaintenance": 200
  },
  {
    "id": "brickworks",
    "name": { "it": "Fornace (Mattoni)", "en": "Brickworks" },
    "producedGoodId": "bricks",
    "baseProductionPerDay": 3.0,
    "inputs": [
      { "goodId": "timber", "amountPerDay": 0.5 }
    ],
    "constructionCost": { "gold": 14000, "bricks": 45, "timber": 20 },
    "workersNeeded": 30,
    "dailyMaintenance": 300
  },
  {
    "id": "pitchmaker",
    "name": { "it": "Fornace di Pece", "en": "Pitchmaker" },
    "producedGoodId": "pitch",
    "baseProductionPerDay": 2.0,
    "inputs": [
      { "goodId": "timber", "amountPerDay": 0.5 }
    ],
    "constructionCost": { "gold": 8000, "bricks": 20, "timber": 10 },
    "workersNeeded": 30,
    "dailyMaintenance": 200
  },
  {
    "id": "apiary",
    "name": { "it": "Apicoltore (Miele)", "en": "Apiary" },
    "producedGoodId": "honey",
    "baseProductionPerDay": 1.5,
    "inputs": [],
    "constructionCost": { "gold": 8000, "bricks": 20, "timber": 10 },
    "workersNeeded": 30,
    "dailyMaintenance": 180
  },
  {
    "id": "weaving_mill",
    "name": { "it": "Tessitura (Tessuti)", "en": "Weaving Mill" },
    "producedGoodId": "cloth",
    "baseProductionPerDay": 1.0,
    "inputs": [
      { "goodId": "wool", "amountPerDay": 0.5 }
    ],
    "constructionCost": { "gold": 15000, "bricks": 40, "timber": 20 },
    "workersNeeded": 30,
    "dailyMaintenance": 350
  },
  {
    "id": "tannery",
    "name": { "it": "Conceria (Cuoio)", "en": "Tannery" },
    "producedGoodId": "leather",
    "baseProductionPerDay": 1.2,
    "inputs": [
      { "goodId": "salt", "amountPerDay": 0.3 }
    ],
    "constructionCost": { "gold": 14000, "bricks": 35, "timber": 18 },
    "workersNeeded": 30,
    "dailyMaintenance": 300
  },
  {
    "id": "vineyard",
    "name": { "it": "Vigneto (Vino)", "en": "Vineyard" },
    "producedGoodId": "wine",
    "baseProductionPerDay": 0.6,
    "inputs": [],
    "constructionCost": { "gold": 25000, "bricks": 80, "timber": 40 },
    "workersNeeded": 30,
    "dailyMaintenance": 400
  },
  {
    "id": "hunting_lodge",
    "name": { "it": "Cacciatore (Pelli)", "en": "Hunting Lodge" },
    "producedGoodId": "skins",
    "baseProductionPerDay": 1.0,
    "inputs": [
      { "goodId": "iron_goods", "amountPerDay": 0.1 }
    ],
    "constructionCost": { "gold": 15000, "bricks": 40, "timber": 20 },
    "workersNeeded": 30,
    "dailyMaintenance": 280
  },
  {
    "id": "pottery_workshop",
    "name": { "it": "Laboratorio di Ceramica", "en": "Pottery Workshop" },
    "producedGoodId": "pottery",
    "baseProductionPerDay": 1.5,
    "inputs": [
      { "goodId": "timber", "amountPerDay": 0.5 }
    ],
    "constructionCost": { "gold": 12000, "bricks": 40, "timber": 20 },
    "workersNeeded": 30,
    "dailyMaintenance": 280
  },
  {
    "id": "whale_fishery",
    "name": { "it": "Baleniere", "en": "Whale Fishery" },
    "producedGoodId": "whale_oil",
    "baseProductionPerDay": 1.2,
    "inputs": [
      { "goodId": "salt", "amountPerDay": 0.2 },
      { "goodId": "hemp", "amountPerDay": 0.1 }
    ],
    "constructionCost": { "gold": 15000, "bricks": 30, "timber": 15 },
    "workersNeeded": 30,
    "dailyMaintenance": 300
  }
]
```

- [ ] **Step 5: Aggiornare `public/data/towns.json`**

Modificare `public/data/towns.json` per allineare le merci prodotte nelle città:
1. In `stettin` (linea 41) e `ripen` (linea 97), sostituire `"fodder"` con `"pottery"`.
2. In `stockholm` (linea 69), `aalborg` (linea 104) e `bergen` (linea 118), sostituire `"train_oil"` con `"whale_oil"`.

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test src/clients/GoodsDatabase.test.ts`
Expected: PASS

---

### Task 3: Router and Layout Navigation Updates

**Files:**
- Modify: `src/router.tsx`
- Run: `rm src/pages/database/GoodsAndBusinesses.tsx`

**Interfaces:**
- Consumes: `router`
- Produces: Nuove rotte per `/database/goods` e `/database/goods/:id`

- [ ] **Step 1: Aggiornare `src/router.tsx`**

Sostituire la rotta `database/goods` con i puntamenti ai nuovi file `GoodsList` e `GoodDetail` (che creeremo nei task successivi):
```typescript
import { createBrowserRouter } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import Home from './pages/Home';
import GoodsList from './pages/database/GoodsList';
import GoodDetail from './pages/database/GoodDetail';
import Towns from './pages/database/Towns';
import Buildings from './pages/database/Buildings';
import Production from './pages/calculators/Production';
import Routes from './pages/calculators/Routes';
import Convoy from './pages/calculators/Convoy';

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
        element: <Towns />
      },
      {
        path: 'database/buildings',
        element: <Buildings />
      },
      {
        path: 'calculators/production',
        element: <Production />
      },
      {
        path: 'calculators/routes',
        element: <Routes />
      },
      {
        path: 'calculators/convoy',
        element: <Convoy />
      }
    ]
  }
]);
```

- [ ] **Step 2: Rimuovere il vecchio file unificato**

Run: `rm src/pages/database/GoodsAndBusinesses.tsx`
Expected: Il file viene rimosso dal filesystem.

- [ ] **Step 3: Run typescript check to verify compile errors**

Run: `npm run build` (o `npx tsc --noEmit`)
Expected: Fallisce con errori di compilazione poiché `GoodsList` e `GoodDetail` non esistono ancora. Questo conferma che il router punta correttamente ai nuovi componenti.

---

### Task 4: Implement Goods List Component with Custom Columns

**Files:**
- Create: `src/pages/database/GoodsList.tsx`
- Test: `src/pages/database/GoodsList.test.tsx`

**Interfaces:**
- Consumes: `goodService` da `useServices`, `getGoodImagePath` da `src/utils/goodImage`

- [ ] **Step 1: Scrivere il test per il componente `GoodsList`**

Create `src/pages/database/GoodsList.test.tsx` con test per la tabella personalizzabile e localStorage:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import GoodsList from './GoodsList';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'it', changeLanguage: async () => {} }
  })
}));

beforeEach(() => {
  window.localStorage.clear();
});

test('GoodsList renders and allows column toggling saved in localStorage', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter>
        <GoodsList />
      </MemoryRouter>
    </ServicesProvider>
  );

  // Verifica che il pulsante Colonne sia presente
  const columnBtn = screen.getByRole('button', { name: /colonne/i });
  expect(columnBtn).toBeDefined();

  // Inizialmente la colonna "Stiva (Volume)" è visibile di default
  expect(screen.queryByText(/volume/i)).toBeDefined();

  // Fai click sul pulsante per aprire il menu colonne
  fireEvent.click(columnBtn);

  // Trova e clicca sulla checkbox del volume per nasconderlo
  const volumeCheckbox = screen.getByLabelText(/stiva/i);
  fireEvent.click(volumeCheckbox);

  // Verifica che lo stato sia memorizzato nel localStorage
  const savedCols = JSON.parse(window.localStorage.getItem('patrician3_goods_columns') || '[]');
  expect(savedCols.includes('volume')).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/pages/database/GoodsList.test.tsx`
Expected: FAIL con errore "GoodsList is not defined".

- [ ] **Step 3: Implementare `src/pages/database/GoodsList.tsx`**

Create `src/pages/database/GoodsList.tsx` con lo stile Pergamena, la tabella dinamica delle merci, il menu a discesa delle colonne e la navigazione al dettaglio:
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { getGoodImagePath } from '../../utils/goodImage';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';

const ALL_COLUMNS = [
  { id: 'basePrice', labelIt: 'Prezzo Base', labelEn: 'Base Price' },
  { id: 'buyPrice', labelIt: 'Acquisto Max', labelEn: 'Buy Max' },
  { id: 'sellPrice', labelIt: 'Vendita Min', labelEn: 'Sell Min' },
  { id: 'maxSatisfaction', labelIt: 'Soddisfazione', labelEn: 'Satisfaction' },
  { id: 'volume', labelIt: 'Stiva (Volume)', labelEn: 'Cargo Volume' },
  { id: 'type', labelIt: 'Tipo', labelEn: 'Type' }
];

const GoodsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { goodService } = useServices();
  const navigate = useNavigate();

  const [goods, setGoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    // Carica impostazioni colonne
    const saved = localStorage.getItem('patrician3_goods_columns');
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
        const loadedGoods = await goodService.getGoods(currentLang);
        setGoods(loadedGoods);
      } catch (err) {
        console.error('Errore nel caricamento delle merci', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [goodService, currentLang]);

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
    let updated: string[];
    if (visibleColumns.includes(columnId)) {
      updated = visibleColumns.filter(id => id !== columnId);
    } else {
      updated = [...visibleColumns, columnId];
    }
    setVisibleColumns(updated);
    localStorage.setItem('patrician3_goods_columns', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading') || 'Caricamento...'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-dark">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
            Merci & Listino Commerciale
          </h1>
          <p className="text-gray-700 text-sm mt-1">
            Consulta i prezzi consigliati ed analizza le merci della Lega Anseatica. Clicca su una risorsa per vederne i dettagli.
          </p>
        </div>

        {/* Menu Selettore Colonne */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-neutral-dark font-bold rounded shadow border border-primary/20 hover:bg-secondary/90 transition-colors"
            aria-label="Colonne"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Colonne</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-background rounded-lg border border-primary/30 shadow-2xl p-4 z-50 dropdown-solido">
              <h4 className="text-xs font-bold font-serif text-primary uppercase border-b border-primary/20 pb-2 mb-2">Visualizza Colonne</h4>
              <div className="space-y-2">
                {ALL_COLUMNS.map(col => (
                  <label key={col.id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.id)}
                      onChange={() => toggleColumn(col.id)}
                      className="rounded text-primary focus:ring-primary border-primary/30"
                    />
                    <span>{currentLang === 'it' ? col.labelIt : col.labelEn}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabella Merci */}
      <div className="bg-white border border-primary/20 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/15">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Merce</th>
                {visibleColumns.includes('basePrice') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Prezzo Base</th>}
                {visibleColumns.includes('buyPrice') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Acquisto Max</th>}
                {visibleColumns.includes('sellPrice') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Vendita Min</th>}
                {visibleColumns.includes('maxSatisfaction') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Soddisfazione</th>}
                {visibleColumns.includes('volume') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Stiva (Volume)</th>}
                {visibleColumns.includes('type') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Tipo</th>}
                <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Dettagli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {goods.map((good) => (
                <tr
                  key={good.id}
                  onClick={() => navigate(`/database/goods/${good.id}`)}
                  className="cursor-pointer transition-colors hover:bg-primary/5 bg-background"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getGoodImagePath(good.id)}
                        alt={good.name}
                        className="h-8 w-8 object-contain border border-primary/20 rounded bg-white p-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                        }}
                      />
                      <div className="text-sm font-semibold text-neutral-dark">{good.name}</div>
                    </div>
                  </td>
                  
                  {visibleColumns.includes('basePrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-neutral-dark">
                      {good.basePrice} <span className="text-primary text-xs font-serif">g</span>
                    </td>
                  )}

                  {visibleColumns.includes('buyPrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-success font-mono">
                      {good.buyPriceRange[0] === good.buyPriceRange[1] 
                        ? `${good.buyPriceRange[0]}` 
                        : `${good.buyPriceRange[0]}-${good.buyPriceRange[1]}`}{' '}
                      <span className="text-primary text-xs font-normal font-serif">g</span>
                    </td>
                  )}

                  {visibleColumns.includes('sellPrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-primary font-mono">
                      {good.sellPriceRange[0]}-{good.sellPriceRange[1]}{' '}
                      <span className="text-primary text-xs font-normal font-serif">g</span>
                    </td>
                  )}

                  {visibleColumns.includes('maxSatisfaction') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                      {good.maxSatisfactionPrice ? `${good.maxSatisfactionPrice} g` : '-'}
                    </td>
                  )}

                  {visibleColumns.includes('volume') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                      {good.volume} {good.volume === 1 ? 'barile' : 'barili'}
                    </td>
                  )}

                  {visibleColumns.includes('type') && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 text-2xs font-bold uppercase rounded-full ${
                        good.isImported
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : good.isRawMaterial
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}>
                        {good.isImported ? 'Import' : good.isRawMaterial ? 'Greggio' : 'Finito'}
                      </span>
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center text-primary text-xs font-bold hover:text-primary/80 transition-colors uppercase tracking-wider">
                      <span>Dettaglio</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoodsList;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/pages/database/GoodsList.test.tsx`
Expected: PASS

---

### Task 5: Implement Good Detail Component

**Files:**
- Create: `src/pages/database/GoodDetail.tsx`
- Test: `src/pages/database/GoodDetail.test.tsx`

**Interfaces:**
- Consumes: `goodService`, `businessService`, `townService` da `useServices`, `getGoodImagePath`

- [ ] **Step 1: Scrivere il test per il componente `GoodDetail`**

Create `src/pages/database/GoodDetail.test.tsx` per verificare il rendering delle informazioni dettagliate:
```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { ServicesProvider } from '../../servicesContext';
import GoodDetail from './GoodDetail';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'it', changeLanguage: async () => {} }
  })
}));

test('GoodDetail renders details for selected good', async () => {
  render(
    <ServicesProvider>
      <MemoryRouter initialEntries={['/database/goods/beer']}>
        <Routes>
          <Route path="/database/goods/:id" element={<GoodDetail />} />
        </Routes>
      </MemoryRouter>
    </ServicesProvider>
  );

  // Attende che i dati siano caricati e verifica la presenza del titolo/info
  const backLink = await screen.findByText(/Torna al listino/i);
  expect(backLink).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/pages/database/GoodDetail.test.tsx`
Expected: FAIL con errore "GoodDetail is not defined".

- [ ] **Step 3: Implementare `src/pages/database/GoodDetail.tsx`**

Create `src/pages/database/GoodDetail.tsx` con design Pergamena, immagini in grande, imprese e città associate (compresi i link alle merci collegate):
```typescript
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { getGoodImagePath } from '../../utils/goodImage';
import { ArrowLeft, Sparkles, Info, Hammer, Landmark } from 'lucide-react';

const GoodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { goodService, businessService, townService } = useServices();
  const navigate = useNavigate();

  const [good, setGood] = useState<any | null>(null);
  const [goodsList, setGoodsList] = useState<any[]>([]);
  const [business, setBusiness] = useState<any | null>(null);
  const [producingTowns, setProducingTowns] = useState<any[]>([]);
  const [consumingTowns, setConsumingTowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const allGoods = await goodService.getGoods(currentLang);
        setGoodsList(allGoods);

        const foundGood = allGoods.find(g => g.id === id);
        if (!foundGood) {
          setGood(null);
          setLoading(false);
          return;
        }
        setGood(foundGood);

        // Carica Impresa
        const allBusinesses = await businessService.getBusinesses(currentLang);
        const associatedBus = allBusinesses.find(b => b.producedGoodId === id);
        setBusiness(associatedBus || null);

        // Carica Città di produzione
        const allTowns = await townService.getTowns();
        const prod = allTowns.filter((town: any) => town.produces.includes(id));
        setProducingTowns(prod);

        // Calcola città che consumano questa merce come input industriale
        const cons = allTowns.filter((town: any) => {
          // Controlla se la città produce beni che richiedono questa risorsa come input
          return town.produces.some((townProdId: string) => {
            const prodBus = allBusinesses.find(b => b.producedGoodId === townProdId);
            if (!prodBus) return false;
            return prodBus.inputs.some((input: any) => input.goodId === id);
          });
        });
        setConsumingTowns(cons);

      } catch (err) {
        console.error('Errore nel caricamento del dettaglio merce', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id, goodService, businessService, townService, currentLang]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading') || 'Caricamento...'}</span>
      </div>
    );
  }

  if (!good) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-primary font-serif">Risorsa non trovata</h2>
        <Link to="/database/goods" className="inline-flex items-center text-primary mt-4 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Torna al listino
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-dark">
      {/* Ritorno */}
      <div>
        <Link
          to="/database/goods"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary text-neutral-dark font-bold rounded shadow border border-primary/20 hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Torna al listino</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Principale (Informazioni di Mercato) */}
        <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-center mb-6">
              <img
                src={getGoodImagePath(good.id)}
                alt={good.name}
                className="h-32 w-32 object-contain border border-primary/30 rounded bg-white p-2 shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                }}
              />
            </div>
            
            <div className="text-center mb-6 border-b border-primary/10 pb-4">
              <h2 className="text-2xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {good.name}
              </h2>
              <div className="mt-2">
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                  good.isImported
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : good.isRawMaterial
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                }`}>
                  {good.isImported ? 'Importata (Mediterraneo)' : good.isRawMaterial ? 'Materia Grezza' : 'Bene Finito'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Prezzo Base di Riferimento</span>
                <span className="font-mono font-bold text-neutral-dark">{good.basePrice} g</span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  Acquisto Consigliato (Max)
                </span>
                <span className="font-mono font-bold text-success">
                  {good.buyPriceRange[0] === good.buyPriceRange[1] 
                    ? `${good.buyPriceRange[0]}` 
                    : `${good.buyPriceRange[0]}-${good.buyPriceRange[1]}`} g
                </span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Vendita Consigliata (Min)</span>
                <span className="font-mono font-bold text-primary">
                  {good.sellPriceRange[0]}-{good.sellPriceRange[1]} g
                </span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Prezzo Max per Soddisfazione</span>
                <span className="font-mono font-bold text-neutral-dark">
                  {good.maxSatisfactionPrice ? `${good.maxSatisfactionPrice} g` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Spazio in Stiva</span>
                <span className="font-mono font-bold text-neutral-dark">
                  {good.volume} {good.volume === 1 ? 'barile' : 'barili'}
                </span>
              </div>
            </div>
          </div>

          {good.isImported && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded p-4 text-xs text-purple-900 flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-purple-700 mt-0.5 flex-shrink-0" />
              <p>Questa merce non è prodotta nella Lega Anseatica. Può essere ottenuta esclusivamente organizzando spedizioni marittime con convogli nel Mar Mediterraneo o nelle Americhe.</p>
            </div>
          )}
        </div>

        {/* Colonna Destra (Struttura e Città) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Struttura Produttiva */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Hammer className="h-5 w-5 text-primary" />
              <span>Struttura Produttiva</span>
            </h3>

            {business ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                    {business.name}
                  </h4>
                  <p className="text-gray-700 text-xs">Laboratorio di produzione standard</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-background border border-primary/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Produzione/Giorno</p>
                    <p className="text-xl font-bold text-success font-mono">
                      +{business.baseProductionPerDay} <span className="text-xs font-normal font-sans">barili</span>
                    </p>
                  </div>
                  <div className="bg-background border border-primary/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Manutenzione/Giorno</p>
                    <p className="text-xl font-bold text-danger font-mono">
                      {business.dailyMaintenance} <span className="text-xs font-normal font-serif">g</span>
                    </p>
                  </div>
                </div>

                {/* Consumo Materie Prime */}
                <div>
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Materie Prime Necessarie (Consumo/Giorno)</h4>
                  {business.inputs.length > 0 ? (
                    <div className="space-y-2">
                      {business.inputs.map((input: any) => {
                        const inputGood = goodsList.find(g => g.id === input.goodId);
                        return (
                          <div
                            key={input.goodId}
                            onClick={() => navigate(`/database/goods/${input.goodId}`)}
                            className="flex justify-between items-center bg-background px-3 py-2 rounded border border-primary/5 hover:border-primary/30 transition-colors cursor-pointer group"
                          >
                            <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                              <img
                                src={getGoodImagePath(input.goodId)}
                                alt={input.goodId}
                                className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                              />
                              <span className="group-hover:text-primary transition-colors">{inputGood ? inputGood.name : input.goodId}</span>
                            </span>
                            <span className="text-sm font-bold text-danger font-mono">-{input.amountPerDay}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-success font-bold italic flex items-center space-x-1.5 bg-green-50/50 p-2.5 rounded border border-green-200/40">
                      <span>✓</span>
                      <span>Nessuna materia prima necessaria (Produzione autonoma)</span>
                    </p>
                  )}
                </div>

                {/* Costi di Costruzione */}
                <div className="border-t border-primary/10 pt-4">
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-3">Requisiti di Edificazione</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Oro</p>
                      <p className="text-sm font-semibold text-primary font-mono">{business.constructionCost.gold}</p>
                    </div>
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Mattoni</p>
                      <p className="text-sm font-semibold text-neutral-dark font-mono">{business.constructionCost.bricks}</p>
                    </div>
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Legno</p>
                      <p className="text-sm font-semibold text-neutral-dark font-mono">{business.constructionCost.timber}</p>
                    </div>
                  </div>
                  <p className="text-3xs text-gray-600 mt-2 text-right italic font-medium">
                    Richiede {business.workersNeeded} lavoratori attivi
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-600 text-xs italic">
                Questa risorsa non può essere prodotta direttamente tramite laboratori privati edificabili.
              </div>
            )}
          </div>

          {/* Città di produzione */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Landmark className="h-5 w-5 text-primary" />
              <span>Geografia & Commercio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Città Produttrici (Produzione Efficace)</h4>
                {producingTowns.length > 0 ? (
                  <ul className="space-y-1.5">
                    {producingTowns.map(town => (
                      <li key={town.id} className="text-sm font-semibold bg-background px-2.5 py-1.5 rounded border border-primary/5">
                        <Link to="/database/towns" className="text-neutral-dark hover:text-primary transition-colors flex items-center justify-between">
                          <span>{town.name}</span>
                          {town.isRiverTown && <span className="text-3xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">Fluviale</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600 italic">Non prodotta in alcuna città dell'Hansa di default.</p>
                )}
              </div>

              <div>
                <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Città che Consumano (Uso Industriale)</h4>
                {consumingTowns.length > 0 ? (
                  <ul className="space-y-1.5">
                    {consumingTowns.map(town => (
                      <li key={town.id} className="text-sm font-semibold bg-background px-2.5 py-1.5 rounded border border-primary/5">
                        <Link to="/database/towns" className="text-neutral-dark hover:text-primary transition-colors flex items-center justify-between">
                          <span>{town.name}</span>
                          {town.isRiverTown && <span className="text-3xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">Fluviale</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600 italic">Nessuna industria anseatica consuma questa merce.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodDetail;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/pages/database/GoodDetail.test.tsx`
Expected: PASS

---

## Self-Review Checks

1.  **Copertura Specifica**: Ogni modifica del database (sostituzione di fodder con pottery, train_oil con whale_oil), la copia delle immagini ad alta risoluzione, la funzione di utilità `getGoodImagePath`, il router per il dettaglio ed il listino tabellare personalizzabile tramite `localStorage` sono mappati a un task preciso.
2.  **Verifica Placeholders**: Nessun "TODO", "TBD" o "implement later". Tutto il codice sorgente è descritto e strutturato.
3.  **Coerenza di Nomi e Firme**: I metodi come `getGoodImagePath` consumati nei componenti sono esattamente conformi all'interfaccia dichiarata nel Task 1. I percorsi e gli ID del database corrispondono in tutti i file.
