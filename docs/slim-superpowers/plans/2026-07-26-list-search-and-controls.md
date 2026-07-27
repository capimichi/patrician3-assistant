# Area Controlli e Barra di Ricerca per le Liste del Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduzione di una barra di ricerca e di un'area controlli unificata sopra le liste del database delle merci, città e imprese, con filtraggio istantaneo a partire da 3 caratteri e stile coerente.

**Architecture:** Creazione del componente React riutilizzabile `ListControls` per gestire in modo flessibile il layout dei controlli (barra di ricerca ed elementi personalizzati). Integrazione dello stato di ricerca locale nei componenti delle tre liste del database, filtrando i dati per nome (case-insensitive) e visualizzando un feedback nel caso in cui non vengano trovati elementi.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, React Testing Library.

## Global Constraints

*   Filtro attivo solo a partire da 3 caratteri (lunghezza >= 3). Con meno di 3 caratteri viene mostrata la lista intera.
*   Filtro limitato esclusivamente al Nome principale dell'elemento, case-insensitive.
*   Area controlli stilizzata con sfondo bianco, bordo primario leggero (`border-primary/20`) e angoli arrotondati (`rounded-lg`).
*   Mostrare feedback chiaro "Nessun elemento trovato per <query>" in caso di risultati vuoti.

---

### Task 1: Aggiunta Traduzioni a i18n

**Files:**
*   Modify: `src/i18n.ts`

**Interfaces:**
*   Consumes: None
*   Produces: Nuove chiavi di localizzazione in `src/i18n.ts`: `common.search_goods`, `common.search_towns`, `common.search_businesses`, `common.no_results`.

- [ ] **Step 1: Modificare il file `src/i18n.ts` per aggiungere le chiavi in italiano ed inglese**
  Aggiungere nei blocchi `translation` del dizionario `it` ed `en`:
  ```typescript
  // In it.translation.common:
  search_goods: "Cerca merce...",
  search_towns: "Cerca città...",
  search_businesses: "Cerca impresa...",
  no_results: "Nessun elemento trovato per"

  // In en.translation.common:
  search_goods: "Search goods...",
  search_towns: "Search towns...",
  search_businesses: "Search business...",
  no_results: "No results found for"
  ```

- [ ] **Step 2: Eseguire una compilazione di prova per verificare che non ci siano errori di sintassi**
  Run: `npm run build`
  Expected: Success.

---

### Task 2: Creare il componente `ListControls`

**Files:**
*   Create: `src/components/ListControls.tsx`
*   Create: `src/components/ListControls.test.tsx`

**Interfaces:**
*   Consumes: Nuove icone da `lucide-react`.
*   Produces: Componente `ListControls` esportato con interfaccia:
    ```typescript
    export interface ListControlsProps {
      searchValue: string;
      onSearchChange: (value: string) => void;
      placeholder?: string;
      rightActions?: React.ReactNode;
    }
    ```

- [ ] **Step 1: Scrivere il test unitario per `ListControls`**
  Creare `src/components/ListControls.test.tsx` con il seguente codice:
  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react';
  import { expect, test, vi } from 'vitest';
  import { ListControls } from './ListControls';

  test('ListControls renders input with placeholder, triggers change callback, and renders rightActions', () => {
    const handleSearchChange = vi.fn();
    
    render(
      <ListControls
        searchValue=""
        onSearchChange={handleSearchChange}
        placeholder="Cerca elemento..."
        rightActions={<button data-testid="right-btn">Colonne</button>}
      />
    );

    const input = screen.getByPlaceholderText('Cerca elemento...') as HTMLInputElement;
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: 'Lubecca' } });
    expect(handleSearchChange).toHaveBeenCalledWith('Lubecca');

    const rightBtn = screen.getByTestId('right-btn');
    expect(rightBtn).toBeDefined();
  });
  ```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npx vitest run src/components/ListControls.test.tsx`
  Expected: FAIL (il componente non esiste ancora).

- [ ] **Step 3: Implementare il componente `ListControls`**
  Creare `src/components/ListControls.tsx` con il codice:
  ```typescript
  import React from 'react';
  import { Search } from 'lucide-react';

  export interface ListControlsProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    rightActions?: React.ReactNode;
  }

  export const ListControls: React.FC<ListControlsProps> = ({
    searchValue,
    onSearchChange,
    placeholder = 'Cerca...',
    rightActions
  }) => {
    return (
      <div className="bg-white border border-primary/20 rounded-lg shadow-xs p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-primary/60" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-4 py-2 border border-primary/20 rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/40 placeholder-gray-400 text-sm transition-colors text-neutral-dark"
          />
        </div>
        {rightActions && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {rightActions}
          </div>
        )}
      </div>
    );
  };
  ```

- [ ] **Step 4: Eseguire il test per verificare che passi**
  Run: `npx vitest run src/components/ListControls.test.tsx`
  Expected: PASS.

---

### Task 3: Integrazione in `GoodsList.tsx`

**Files:**
*   Modify: `src/pages/database/GoodsList.tsx`
*   Modify: `src/pages/database/GoodsList.test.tsx`

**Interfaces:**
*   Consumes: Componente `ListControls` da `src/components/ListControls`.

- [ ] **Step 1: Aggiornare il test in `GoodsList.test.tsx` per validare la ricerca**
  Aggiungere alla fine di `src/pages/database/GoodsList.test.tsx` i test per la ricerca:
  ```typescript
  test('GoodsList filters goods by query when query length >= 3', async () => {
    render(
      <ServicesProvider>
        <MemoryRouter>
          <GoodsList />
        </MemoryRouter>
      </ServicesProvider>
    );

    // Attende il caricamento dei dati
    const input = await screen.findByPlaceholderText('common.search_goods');
    expect(screen.queryByText('Birra')).toBeDefined();

    // Digita meno di 3 caratteri - non deve filtrare
    fireEvent.change(input, { target: { value: 'Bi' } });
    expect(screen.queryByText('Birra')).toBeDefined();

    // Digita 3 caratteri corretti - deve filtrare e trovare Birra
    fireEvent.change(input, { target: { value: 'Bir' } });
    expect(screen.queryByText('Birra')).toBeDefined();

    // Digita un testo che non corrisponde - deve mostrare nessun risultato
    fireEvent.change(input, { target: { value: 'Xyz' } });
    expect(screen.queryByText('Birra')).toBeNull();
    expect(screen.getByText(/common.no_results/i)).toBeDefined();
  });
  ```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npx vitest run src/pages/database/GoodsList.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Modificare `GoodsList.tsx` per integrare la ricerca**
  Importare `ListControls` ed effettuare le modifiche:
  1. Aggiungere lo stato: `const [searchQuery, setSearchQuery] = useState('');`
  2. Spostare il blocco pulsante/dropdown delle colonne in `rightActions`.
  3. Sostituire il layout superiore con il titolo/descrizione e `<ListControls>`.
  4. Filtrare le merci prima del rendering:
     ```typescript
     const filteredGoods = goods.filter(good => {
       if (searchQuery.trim().length < 3) return true;
       return good.name.toLowerCase().includes(searchQuery.toLowerCase());
     });
     ```
  5. Nel rendering della tabella, mappare `filteredGoods` e mostrare la riga per risultati vuoti:
     ```tsx
     {filteredGoods.length === 0 ? (
       <tr>
         <td colSpan={visibleColumns.length + 2} className="px-6 py-12 text-center text-gray-500 italic font-serif">
           {t('common.no_results')} "{searchQuery}"
         </td>
       </tr>
     ) : (
       filteredGoods.map(good => (...))
     )}
     ```

- [ ] **Step 4: Eseguire il test per verificare che passi**
  Run: `npx vitest run src/pages/database/GoodsList.test.tsx`
  Expected: PASS.

---

### Task 4: Integrazione in `TownsList.tsx`

**Files:**
*   Modify: `src/pages/database/TownsList.tsx`
*   Modify: `src/pages/database/TownsList.test.tsx`

**Interfaces:**
*   Consumes: Componente `ListControls` da `src/components/ListControls`.

- [ ] **Step 1: Aggiornare il test in `TownsList.test.tsx` per validare la ricerca**
  Aggiungere alla fine di `src/pages/database/TownsList.test.tsx`:
  ```typescript
  test('TownsList filters towns by query when query length >= 3', async () => {
    render(
      <ServicesProvider>
        <MemoryRouter>
          <TownsList />
        </MemoryRouter>
      </ServicesProvider>
    );

    const input = await screen.findByPlaceholderText('common.search_towns');
    expect(screen.queryByText('Lubecca (Lübeck)')).toBeDefined();

    // Minore di 3 caratteri - mostra tutto
    fireEvent.change(input, { target: { value: 'Lu' } });
    expect(screen.queryByText('Lubecca (Lübeck)')).toBeDefined();

    // Almeno 3 caratteri - filtra
    fireEvent.change(input, { target: { value: 'Lub' } });
    expect(screen.queryByText('Lubecca (Lübeck)')).toBeDefined();

    // Nessuna corrispondenza
    fireEvent.change(input, { target: { value: 'Xyz' } });
    expect(screen.queryByText('Lubecca (Lübeck)')).toBeNull();
    expect(screen.getByText(/common.no_results/i)).toBeDefined();
  });
  ```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npx vitest run src/pages/database/TownsList.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Modificare `TownsList.tsx` per integrare la ricerca**
  Importare `ListControls`, aggiungere lo stato `searchQuery`, spostare il dropdown colonne, ed effettuare il filtraggio prima del mapping (incluso lo stato vuoto all'interno della tabella con `colSpan={visibleColumns.length + 2}`).

- [ ] **Step 4: Eseguire il test per verificare che passi**
  Run: `npx vitest run src/pages/database/TownsList.test.tsx`
  Expected: PASS.

---

### Task 5: Integrazione in `BusinessesList.tsx`

**Files:**
*   Modify: `src/pages/database/BusinessesList.tsx`
*   Modify: `src/pages/database/BusinessesList.test.tsx`

**Interfaces:**
*   Consumes: Componente `ListControls` da `src/components/ListControls`.

- [ ] **Step 1: Aggiornare il test in `BusinessesList.test.tsx` per validare la ricerca**
  Aggiungere alla fine di `src/pages/database/BusinessesList.test.tsx`:
  ```typescript
  test('BusinessesList filters businesses by query when query length >= 3', async () => {
    render(
      <ServicesProvider>
        <MemoryRouter>
          <BusinessesList />
        </MemoryRouter>
      </ServicesProvider>
    );

    const input = await screen.findByPlaceholderText('common.search_businesses');
    expect(screen.queryByText('Birreria')).toBeDefined();

    // Minore di 3 caratteri - mostra tutto
    fireEvent.change(input, { target: { value: 'Bi' } });
    expect(screen.queryByText('Birreria')).toBeDefined();

    // Almeno 3 caratteri - filtra
    fireEvent.change(input, { target: { value: 'Bir' } });
    expect(screen.queryByText('Birreria')).toBeDefined();

    // Nessuna corrispondenza
    fireEvent.change(input, { target: { value: 'Xyz' } });
    expect(screen.queryByText('Birreria')).toBeNull();
    expect(screen.getByText(/common.no_results/i)).toBeDefined();
  });
  ```

- [ ] **Step 2: Eseguire il test per verificare che fallisca**
  Run: `npx vitest run src/pages/database/BusinessesList.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Modificare `BusinessesList.tsx` per integrare la ricerca**
  Importare `ListControls`, aggiungere lo stato `searchQuery`, spostare il dropdown colonne, ed effettuare il filtraggio prima del mapping (incluso lo stato vuoto all'interno della tabella con `colSpan={visibleColumns.length + 2}`).

- [ ] **Step 4: Eseguire il test per verificare che passi**
  Run: `npx vitest run src/pages/database/BusinessesList.test.tsx`
  Expected: PASS.

---

### Task 6: Verifica globale e build di produzione

- [ ] **Step 1: Eseguire tutti i test di regressione del progetto**
  Run: `npm run test`
  Expected: Tutti i test passano con successo (inclusi quelli preesistenti).

- [ ] **Step 2: Verificare la corretta build di produzione**
  Run: `npm run build`
  Expected: Success senza errori TypeScript o di bundle di Vite.
