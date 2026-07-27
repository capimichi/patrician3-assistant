# Specifica di Design: Area Controlli e Barra di Ricerca per le Liste del Database

Questo documento descrive il design e il piano di implementazione per aggiungere una barra di ricerca filtrante e riorganizzare i controlli superiori in tutte le liste del database di **Patrician 3 Assistant**:
*   **Merci e Listino Commerciale** (`/database/goods`)
*   **Database Imprese e Officine** (`/database/businesses`)
*   **Database Città dell'Hansa** (`/database/towns`)

---

## 1. Obiettivi e Funzionalità

1.  **Barra di Ricerca Integrata**:
    *   Un input di ricerca testuale posizionato sopra ciascuna lista.
    *   Filtro attivo automaticamente alla digitazione (**a partire da 3 caratteri**). Se la ricerca contiene meno di 3 caratteri, l'elenco viene visualizzato interamente.
    *   Filtro limitato al **Nome** principale dell'elemento (es. nome della merce, nome della città, o nome dell'impresa), case-insensitive.
2.  **Area Controlli Unificata (`ListControls`)**:
    *   Un pannello (`card`) posizionato sopra la tabella e sotto il titolo della pagina, destinato a contenere tutti i controlli della lista.
    *   A sinistra, l'input di ricerca con icona.
    *   A destra, il menu a tendina "Colonne" (spostato dall'header principale della pagina).
    *   Layout responsive: gli elementi si dispongono in colonna su mobile e in riga su schermi desktop.
3.  **Feedback Risultati Vuoti**:
    *   Se il filtro non produce risultati, viene mostrato un messaggio amichevole all'interno della tabella: *"Nessun elemento trovato per \"<testo_cerca>\""*.

---

## 2. Architettura del Componente `ListControls`

Creeremo un componente riutilizzabile in [src/components/ListControls.tsx](file:///Users/michele/Sites/patrician3-assistant/src/components/ListControls.tsx).

### A. Tipi e Interfaccia
```typescript
interface ListControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  rightActions?: React.ReactNode;
}
```

### B. Struttura JSX & Classi Tailwind
```tsx
import React from 'react';
import { Search } from 'lucide-react';

export const ListControls: React.FC<ListControlsProps> = ({
  searchValue,
  onSearchChange,
  placeholder = 'Cerca...',
  rightActions
}) => {
  return (
    <div className="bg-white border border-primary/20 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
      {/* Barra di Ricerca (Sinistra) */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-primary/60" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-2 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/40 placeholder-gray-400 text-sm transition-colors text-neutral-dark"
        />
      </div>

      {/* Azioni Aggiuntive (Destra) */}
      {rightActions && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {rightActions}
        </div>
      )}
    </div>
  );
};
```

---

## 3. Integrazione nelle Pagine Lista

### A. Merci (`src/pages/database/GoodsList.tsx`)
*   **Stato**: Aggiungere `const [searchQuery, setSearchQuery] = useState('')`.
*   **Filtro**:
    ```typescript
    const filteredGoods = goods.filter(good => {
      if (searchQuery.trim().length < 3) return true;
      return good.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    ```
*   **Layout**: Rimuovere il selettore colonne dall'header della pagina e inserire `<ListControls>` tra l'intestazione e la tabella.
*   **Feedback Vuoto**:
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

### B. Città (`src/pages/database/TownsList.tsx`)
*   **Stato**: Aggiungere `const [searchQuery, setSearchQuery] = useState('')`.
*   **Filtro**:
    ```typescript
    const filteredTowns = towns.filter(town => {
      if (searchQuery.trim().length < 3) return true;
      return town.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    ```
*   **Layout**: Rimuovere il selettore colonne dall'header, inserire `<ListControls>` sopra la tabella delle città.
*   **Feedback Vuoto**: Colspan impostato su `visibleColumns.length + 2` per coprire le colonne "Città" e "Dettagli".

### C. Imprese (`src/pages/database/BusinessesList.tsx`)
*   **Stato**: Aggiungere `const [searchQuery, setSearchQuery] = useState('')`.
*   **Filtro**:
    ```typescript
    const filteredBusinesses = businesses.filter(business => {
      if (searchQuery.trim().length < 3) return true;
      return business.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    ```
*   **Layout**: Rimuovere il selettore colonne dall'header, inserire `<ListControls>` sopra la tabella delle imprese.
*   **Feedback Vuoto**: Colspan impostato su `visibleColumns.length + 2`.

---

## 4. Localizzazione e Traduzioni (`src/i18n.ts`)

Aggiungeremo le nuove chiavi per segnaposti e stati vuoti a `src/i18n.ts`:

*   **Italiano (`it`)**:
    ```typescript
    common: {
      // ...
      search_goods: "Cerca merce...",
      search_towns: "Cerca città...",
      search_businesses: "Cerca impresa...",
      no_results: "Nessun elemento trovato per"
    }
    ```
*   **Inglese (`en`)**:
    ```typescript
    common: {
      // ...
      search_goods: "Search goods...",
      search_towns: "Search towns...",
      search_businesses: "Search business...",
      no_results: "No results found for"
    }
    ```

---

## 5. Test e Validazione

1.  **Verifica della Soglia (3 Caratteri)**:
    *   Digitando 1 o 2 caratteri, la lista deve rimanere inalterata.
    *   Al terzo carattere inserito, la lista deve essere filtrata istantaneamente.
2.  **Verifica Case-Insensitive**:
    *   La ricerca di "birra", "Birra" o "BIRRA" deve produrre lo stesso risultato.
    *   La ricerca di "lubecca", "Lubecca" o "LUBECCA" deve produrre lo stesso risultato.
3.  **Comportamento del Selettore Colonne**:
    *   La personalizzazione delle colonne deve continuare a funzionare regolarmente all'interno del nuovo contenitore e memorizzare lo stato in `localStorage`.
4.  **Verifica dello Stato Vuoto**:
    *   Digitando una parola casuale (es. "xyz"), la tabella deve mostrare il messaggio di errore localizzato senza rompersi visivamente.
