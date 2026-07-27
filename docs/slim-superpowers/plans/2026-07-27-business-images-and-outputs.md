# Immagini Imprese e Struttura ad Output Multipli - Piano di Implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementare il caricamento delle immagini reali per i laboratori e le fabbriche del gioco Patrician III, rimuovere la conceria virtuale, aggiungere la piantagione di canapa e ristrutturare il database in un modello ad array di prodotti in uscita (`outputs`) per supportare la produzione simultanea di carne e cuoio da parte dell'allevamento bovini.

**Architecture:** Modifica del tipo `Business` in `src/types/index.ts` e aggiornamento del file `public/data/businesses.json`. Aggiornamento del calcolatore di produzione `Production.tsx` e delle liste/dettagli nel database delle città/imprese per mostrare immagini e gestire prodotti multipli in uscita.

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library.

## Global Constraints
- Tutte le modifiche al codice devono mantenere la compatibilità con TypeScript ed evitare tipi `any`.
- Le immagini devono essere gestite in modo automatico mappando l'ID del business convertendo gli underscore in trattini.
- Non introdurre dipendenze npm non presenti nel package.json.
- Verificare costantemente che i test esistenti e nuovi passino tramite `npm run test`.

---

### Task 1: Copia delle Immagini e Utility di Asset

**Files:**
- Create: `src/utils/businessImage.ts`
- Create: `src/utils/businessImage.test.ts`

**Interfaces:**
- Produces: `getBusinessImagePath(businessId: string): string`

- [ ] **Step 1: Creare la cartella di destinazione delle immagini**
  Esegui il comando in shell per creare la cartella:
  Run: `mkdir -p public/images/businesses`
  Expected: Cartella creata.

- [ ] **Step 2: Copiare le immagini dei download nella nuova cartella**
  Esegui il comando in shell per copiare tutti i file PNG:
  Run: `cp /Users/michele/Downloads/pati/businesses-4x/upscayl_png_upscayl-standard-4x_4x/*.png public/images/businesses/`
  Expected: 17 file copiati.

- [ ] **Step 3: Copiare/Rinominare le immagini non perfettamente coincidenti**
  Esegui i comandi in shell per rinominare l'argilla/ceramica e duplicare la pesca per la baleniera:
  Run: `mv public/images/businesses/pottery-business.png public/images/businesses/pottery-workshop.png && cp public/images/businesses/fishery.png public/images/businesses/whale-fishery.png`
  Expected: File rinominati/creati.

- [ ] **Step 4: Creare il file di utility `src/utils/businessImage.ts`**
  Scrivi il seguente codice per mappare l'ID dell'impresa al percorso dell'immagine:
  ```typescript
  /**
   * Restituisce il percorso dell'immagine dell'impresa a partire dal suo ID.
   * Converte gli underscore (_) in trattini (-) per combaciare con i nomi dei file.
   */
  export const getBusinessImagePath = (businessId: string): string => {
    const filename = businessId.toLowerCase().replace(/_/g, '-') + '.png';
    return `/images/businesses/${filename}`;
  };
  ```

- [ ] **Step 5: Scrivere il test per la utility `src/utils/businessImage.test.ts`**
  Crea il test per confermare la corretta conversione dei nomi dei file:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { getBusinessImagePath } from './businessImage';

  describe('getBusinessImagePath', () => {
    it('dovrebbe convertire gli ID in percorsi immagine corretti', () => {
      expect(getBusinessImagePath('grain_farm')).toBe('/images/businesses/grain-farm.png');
      expect(getBusinessImagePath('brewery')).toBe('/images/businesses/brewery.png');
      expect(getBusinessImagePath('whale_fishery')).toBe('/images/businesses/whale-fishery.png');
    });
  });
  ```

- [ ] **Step 6: Eseguire il test per verificare che passi**
  Run: `npx vitest run src/utils/businessImage.test.ts`
  Expected: 1 test superato.

---

### Task 2: Refactoring del Modello Dati e Riorganizzazione JSON

**Files:**
- Modify: `src/types/index.ts`
- Modify: `public/data/businesses.json`
- Modify: `src/services/BusinessService.ts`
- Modify: `src/clients/GoodsDatabase.test.ts`

**Interfaces:**
- Modifica `Business` rimuovendo `producedGoodId: string` e `baseProductionPerDay: number` a favore di `outputs: BusinessOutput[]`.

- [ ] **Step 1: Aggiornare le interfacce TypeScript in `src/types/index.ts`**
  Sostituire la riga 23-36 in `src/types/index.ts` con il seguente codice:
  ```typescript
  export interface BusinessOutput {
    goodId: string;
    amountPerDay: number;
  }

  export interface Business {
    id: string; // es. 'brewery', 'workshop'
    name: LocalizedString;
    outputs: BusinessOutput[];
    inputs: BusinessInput[];
    constructionCost: {
      gold: number;
      bricks: number;
      timber: number;
    };
    workersNeeded: number; // Solitamente 30
    dailyMaintenance: number;
  }
  ```

- [ ] **Step 2: Aggiornare il database JSON `public/data/businesses.json`**
  Riscrivere l'intero file `public/data/businesses.json` rimuovendo `tannery`, aggiungendo `hemp_farm`, inserendo `salt` (0.3) a `cattle_farm` e convertendo tutti in formato `outputs`:
  ```json
  [
    {
      "id": "grain_farm",
      "name": { "it": "Fattoria (Grano)", "en": "Grain Farm" },
      "outputs": [{ "goodId": "grain", "amountPerDay": 2.0 }],
      "inputs": [],
      "constructionCost": { "gold": 10000, "bricks": 30, "timber": 15 },
      "workersNeeded": 30,
      "dailyMaintenance": 280
    },
    {
      "id": "brewery",
      "name": { "it": "Birreria", "en": "Brewery" },
      "outputs": [{ "goodId": "beer", "amountPerDay": 2.0 }],
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
      "outputs": [{ "goodId": "timber", "amountPerDay": 3.0 }],
      "inputs": [],
      "constructionCost": { "gold": 8000, "bricks": 20, "timber": 10 },
      "workersNeeded": 30,
      "dailyMaintenance": 180
    },
    {
      "id": "saltworks",
      "name": { "it": "Salina (Sale)", "en": "Saltworks" },
      "outputs": [{ "goodId": "salt", "amountPerDay": 2.5 }],
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
      "outputs": [{ "goodId": "pig_iron", "amountPerDay": 1.5 }],
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
      "outputs": [{ "goodId": "iron_goods", "amountPerDay": 1.2 }],
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
      "outputs": [{ "goodId": "fish", "amountPerDay": 1.0 }],
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
      "outputs": [
        { "goodId": "meat", "amountPerDay": 0.8 },
        { "goodId": "leather", "amountPerDay": 1.2 }
      ],
      "inputs": [
        { "goodId": "grain", "amountPerDay": 0.5 },
        { "goodId": "salt", "amountPerDay": 0.3 }
      ],
      "constructionCost": { "gold": 16000, "bricks": 50, "timber": 25 },
      "workersNeeded": 30,
      "dailyMaintenance": 350
    },
    {
      "id": "sheep_farm",
      "name": { "it": "Allevamento Ovini (Lana)", "en": "Sheep Farm" },
      "outputs": [{ "goodId": "wool", "amountPerDay": 1.5 }],
      "inputs": [],
      "constructionCost": { "gold": 10000, "bricks": 30, "timber": 15 },
      "workersNeeded": 30,
      "dailyMaintenance": 200
    },
    {
      "id": "brickworks",
      "name": { "it": "Fornace (Mattoni)", "en": "Brickworks" },
      "outputs": [{ "goodId": "bricks", "amountPerDay": 3.0 }],
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
      "outputs": [{ "goodId": "pitch", "amountPerDay": 2.0 }],
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
      "outputs": [{ "goodId": "honey", "amountPerDay": 1.5 }],
      "inputs": [],
      "constructionCost": { "gold": 8000, "bricks": 20, "timber": 10 },
      "workersNeeded": 30,
      "dailyMaintenance": 180
    },
    {
      "id": "weaving_mill",
      "name": { "it": "Tessitura (Tessuti)", "en": "Weaving Mill" },
      "outputs": [{ "goodId": "cloth", "amountPerDay": 1.0 }],
      "inputs": [
        { "goodId": "wool", "amountPerDay": 0.5 }
      ],
      "constructionCost": { "gold": 15000, "bricks": 40, "timber": 20 },
      "workersNeeded": 30,
      "dailyMaintenance": 350
    },
    {
      "id": "vineyard",
      "name": { "it": "Vigneto (Vino)", "en": "Vineyard" },
      "outputs": [{ "goodId": "wine", "amountPerDay": 0.6 }],
      "inputs": [],
      "constructionCost": { "gold": 25000, "bricks": 80, "timber": 40 },
      "workersNeeded": 30,
      "dailyMaintenance": 400
    },
    {
      "id": "hunting_lodge",
      "name": { "it": "Cacciatore (Pelli)", "en": "Hunting Lodge" },
      "outputs": [{ "goodId": "skins", "amountPerDay": 1.0 }],
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
      "outputs": [{ "goodId": "pottery", "amountPerDay": 1.5 }],
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
      "outputs": [{ "goodId": "whale_oil", "amountPerDay": 1.2 }],
      "inputs": [
        { "goodId": "salt", "amountPerDay": 0.2 },
        { "goodId": "hemp", "amountPerDay": 0.1 }
      ],
      "constructionCost": { "gold": 15000, "bricks": 30, "timber": 15 },
      "workersNeeded": 30,
      "dailyMaintenance": 300
    },
    {
      "id": "hemp_farm",
      "name": { "it": "Piantagione di Canapa", "en": "Hemp Farm" },
      "outputs": [{ "goodId": "hemp", "amountPerDay": 2.0 }],
      "inputs": [],
      "constructionCost": { "gold": 10000, "bricks": 30, "timber": 15 },
      "workersNeeded": 30,
      "dailyMaintenance": 280
    }
  ]
  ```

- [ ] **Step 3: Aggiornare i Test di Integrità dei Dati (`src/clients/GoodsDatabase.test.ts`)**
  Aggiorna le asserzioni deprecate che cercavano `producedGoodId`:
  Modifica `src/clients/GoodsDatabase.test.ts` alle righe 35-39:
  ```typescript
  expect(potteryWorkshop.outputs[0].goodId).toBe('pottery');
  expect(whaleFishery.outputs[0].goodId).toBe('whale_oil');
  ```

- [ ] **Step 4: Eseguire i test globali per identificare le rotture di compilazione**
  Run: `npm run test`
  Expected: La compilazione fallirà su `Production.tsx` e le altre viste DB a causa delle proprietà rimosse.

---

### Task 3: Aggiornamento del Calcolatore di Produzione

**Files:**
- Modify: `src/pages/calculators/Production.tsx:142-148` e `src/pages/calculators/Production.tsx:403`

- [ ] **Step 1: Aggiornare il calcolo del bilancio di produzione giornaliera in `Production.tsx`**
  Modifica `src/pages/calculators/Production.tsx` da riga 142 a 149, sostituendo la logica a singolo prodotto con l'iterazione di `outputs`:
  ```typescript
          // Calcola efficacia per ciascun output (penalità 25% se la merce non è prodotta localmente)
          business.outputs.forEach((output) => {
            const isSpecialty = town.produces.includes(output.goodId);
            const dailyProd = output.amountPerDay * (isSpecialty ? 1.0 : 0.75) * count;

            // Somma produzione
            balances[output.goodId].produced += dailyProd;
            branchReports[townId].balances[output.goodId] += dailyProd;
          });
  ```

- [ ] **Step 2: Aggiornare la visualizzazione della specializzazione in `Production.tsx`**
  Modificare riga 403 per verificare se almeno una delle merci in output fa parte della produzione ottimale della città:
  ```typescript
  const isSpecialty = business.outputs.some(out => townObj.produces.includes(out.goodId));
  ```

---

### Task 4: Aggiornamento della Lista e Dettaglio Imprese (UI)

**Files:**
- Modify: `src/pages/database/BusinessesList.tsx`
- Modify: `src/pages/database/BusinessDetail.tsx`

- [ ] **Step 1: Visualizzare l'immagine reale del Business e gli output multipli in `BusinessesList.tsx`**
  Importa `getBusinessImagePath` e aggiorna le righe da 170 a 191 per scorrere gli outputs:
  ```typescript
  import { getBusinessImagePath } from '../../utils/businessImage';
  import { getGoodImagePath } from '../../utils/goodImage';
  ```
  Sostituisci il rendering del prodotto e dell'immagine con:
  ```tsx
  // Nella tabella/card dei business:
  const outputsList = business.outputs.map(out => {
    const productGood = goods.find(g => g.id === out.goodId);
    const productName = productGood ? productGood.name[currentLang] : out.goodId;
    return (
      <div key={out.goodId} className="flex items-center space-x-1 mt-0.5 text-xs text-gray-700">
        <img
          src={getGoodImagePath(out.goodId)}
          alt={productName}
          className="h-4 w-4 object-contain"
        />
        <span>{productName} ({out.amountPerDay}/g)</span>
      </div>
    );
  });
  ```
  E sostituisci l'immagine della card:
  ```tsx
  <img
    src={getBusinessImagePath(business.id)}
    alt={business.name[currentLang]}
    className="h-16 w-16 object-cover rounded border border-primary/20 bg-background"
  />
  ```

- [ ] **Step 2: Aggiornare la visualizzazione in `BusinessDetail.tsx`**
  Importa `getBusinessImagePath` e aggiorna la pagina per iterare su `business.outputs`:
  Sostituisci la ricerca del singolo prodotto `productGood` (righe 66-67) con l'iterazione di `outputs` e l'uso dell'immagine dell'impresa:
  ```tsx
  {/* Nel dettaglio dell'edificio: */}
  <img
    src={getBusinessImagePath(business.id)}
    alt={business.name[currentLang]}
    className="w-full h-48 object-cover rounded-lg border border-primary/20"
  />
  ```
  E per la sezione merci prodotte:
  ```tsx
  <div className="space-y-2">
    {business.outputs.map((out) => {
      const gObj = goodsList.find(g => g.id === out.goodId);
      const gName = gObj ? gObj.name[currentLang] : out.goodId;
      return (
        <div key={out.goodId} className="flex items-center space-x-2 p-2 bg-background rounded border border-primary/10">
          <img src={getGoodImagePath(out.goodId)} alt={gName} className="h-6 w-6 object-contain" />
          <span className="font-semibold">{gName}</span>
          <span className="text-gray-700">({out.amountPerDay} unità/giorno)</span>
        </div>
      );
    })}
  </div>
  ```

---

### Task 5: Aggiornamento della Pagina Dettaglio Merce e Risoluzione Test

**Files:**
- Modify: `src/pages/database/GoodDetail.tsx`
- Modify: `src/pages/database/BusinessDetail.test.tsx`
- Modify: `src/pages/database/BusinessesList.test.tsx`
- Modify: `src/pages/database/GoodDetail.test.tsx`

- [ ] **Step 1: Aggiornare la ricerca delle imprese associate alla merce in `GoodDetail.tsx`**
  Modifica le righe 41 e 53 per usare `outputs.some`:
  ```typescript
  const associatedBus = allBusinesses.find(b => b.outputs.some(out => out.goodId === id));
  // ...
  const prodBus = allBusinesses.find(b => b.outputs.some(out => out.goodId === townProdId));
  ```

- [ ] **Step 2: Aggiornare i dati mock dei Test**
  Aggiorna le dichiarazioni mock di `Business` in tutti i test unitari (`BusinessDetail.test.tsx`, `BusinessesList.test.tsx`, `GoodDetail.test.tsx`) affinché abbiano `outputs` anziché `producedGoodId` e `baseProductionPerDay`.
  Esempio in `BusinessDetail.test.tsx`:
  ```typescript
  const mockBusiness = {
    id: 'brewery',
    name: { it: 'Birreria', en: 'Brewery' },
    outputs: [{ goodId: 'beer', amountPerDay: 2.0 }],
    inputs: [{ goodId: 'grain', amountPerDay: 0.5 }],
    constructionCost: { gold: 12000, bricks: 40, timber: 20 },
    workersNeeded: 30,
    dailyMaintenance: 320
  };
  ```

- [ ] **Step 3: Eseguire la suite di test globale per verificare che tutto sia verde**
  Run: `npm run test`
  Expected: Tutti i test passano con successo.
