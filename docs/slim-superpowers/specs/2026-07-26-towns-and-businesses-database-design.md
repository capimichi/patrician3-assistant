# Specifica di Design: Liste Tabellari e Pagine di Dettaglio per Città e Imprese

Questo documento definisce il piano di design e implementazione per arricchire e riorganizzare le sezioni **Città (Towns)** e **Imprese (Businesses)** di **Patrician 3 Assistant**. L'obiettivo è allinearle al pattern già introdotto per le Merci, implementando elenchi tabellari con colonne personalizzabili (salvate in `localStorage`) e pagine di dettaglio dedicate collegate tramite rotte di React Router.

---

## 1. Obiettivi e Funzionalità

1.  **Rotte Dedicate (React Router)**:
    *   `/database/towns`: Tabella con l'elenco di tutte le città dell'Hansa.
    *   `/database/towns/:id`: Dettaglio strategico e industriale di una singola città.
    *   `/database/businesses`: Tabella con l'elenco di tutte le attività produttive (imprese).
    *   `/database/businesses/:id`: Dettaglio tecnico, costi e requisiti di una singola impresa.
2.  **Tabella Personalizzabile (Colonne Selezionabili)**:
    *   Menu a tendina "Colonne" con checkbox per attivare/disattivare la visibilità delle colonne in tempo reale.
    *   Persistenza dello stato delle colonne scelte tramite `localStorage`.
3.  **Miglioramenti UI/UX & Coerenza**:
    *   Transizioni fluide tra elenco e dettaglio.
    *   Badge semantici coerenti per i tipi di porto (Sea/River), merci, ingredienti ed imprese.
    *   Navigazione interconnessa: cliccare su una merce o una città in una pagina di dettaglio porterà alla relativa pagina di dettaglio del database.

---

## 2. Navigazione, Routing e i18n

### A. Modifiche al Router (`src/router.tsx`)
Configureremo le nuove rotte e adatteremo quelle esistenti:
```typescript
import TownsList from './pages/database/TownsList'; // Rinominato/Creato da Towns.tsx
import TownDetail from './pages/database/TownDetail';
import BusinessesList from './pages/database/BusinessesList';
import BusinessDetail from './pages/database/BusinessDetail';

// ...
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

### B. Modifiche a `src/components/layout/Header.tsx`
Aggiorneremo il menu a tendina "Database" sia per desktop che per mobile per mostrare 4 link distinti:
1.  **Merci** (`/database/goods`)
2.  **Imprese** (`/database/businesses`)
3.  **Città** (`/database/towns`)
4.  **Edifici** (`/database/buildings`)

### C. Modifiche alla Localizzazione (`src/i18n.ts`)
Separeremo le chiavi di traduzione per "Merci" e "Imprese":
*   **Italiano (`it`)**:
    *   `header.goods`: "Merci"
    *   `header.businesses`: "Imprese"
*   **Inglese (`en`)**:
    *   `header.goods`: "Goods"
    *   `header.businesses`: "Businesses"

---

## 3. Pagine delle Città

### A. Lista Tabellare delle Città (`TownsList.tsx`)
Visualizzazione tabellare con opzione di filtro o selezione colonne.
*   **Colonne disponibili**:
    *   `name`: Nome della città (sempre visibile) + badge "Fiume" se applicabile.
    *   `type`: Tipo di porto (Marittimo o Fluviale).
    *   `produces`: Griglia/lista compatta di icone/nomi delle merci prodotte a rendimento massimo.
    *   `specializationsCount`: Numero totale di merci prodotte efficacemente (permette l'ordinamento rapido).
    *   `coordinates`: Coordinate $X, Y$ sulla mappa di gioco.
*   **Stato Persistente (localStorage)**:
    *   Chiave: `patrician3_towns_columns`
    *   Valore di default: tutte le colonne visibili.
*   **Navigazione**: Click sulla riga $\to$ `/database/towns/:id`.

### B. Dettaglio Città (`TownDetail.tsx`)
Carica la singola città tramite l'ID fornito dal parametro della rotta.
*   **Elementi della pagina**:
    *   Pulsante medievale `← Torna alle città`.
    *   Titolo della città con coordinate e tipo di porto ben visibili.
    *   **Avviso Porto Fluviale**: Se la città è fluviale (`isRiverTown: true`), viene visualizzato un pannello informativo speciale che avverte che le navi di grandi dimensioni (Cog e Holk) non possono attraccare, consigliando l'uso di *Snaikka* e *Crayer*.
    *   **Merci Specializzate**: Griglia con le 6 merci prodotte al 100%. Ogni merce mostra il nome localizzato, l'icona, e un link interattivo che reindirizza alla pagina di dettaglio della merce stessa (`/database/goods/:goodId`).
    *   **Nota sulle Penalità**: Box informativo che descrive la penalità del 25% sulla produzione per tutti gli altri laboratori non inclusi tra le specializzazioni storiche.

---

## 4. Pagine delle Imprese

### A. Lista Tabellare delle Imprese (`BusinessesList.tsx`)
Elenco di tutti i laboratori e le fabbriche edificabili.
*   **Colonne disponibili**:
    *   `name`: Nome dell'impresa (sempre visibile).
    *   `product`: Icona + nome del bene finale prodotto.
    *   `production`: Produzione base giornaliera (es. +2.0 barili).
    *   `maintenance`: Costo di manutenzione giornaliera (es. 320g).
    *   `inputs`: Ingredienti/Materie prime consumate al giorno (mostrate in modo compatto con piccole icone).
    *   `workers`: Numero di lavoratori richiesti (tipicamente 30).
    *   `cost`: Requisiti di edificazione (Oro, Mattoni, Legno).
*   **Stato Persistente (localStorage)**:
    *   Chiave: `patrician3_businesses_columns`
    *   Valore di default: tutte le colonne visibili.
*   **Navigazione**: Click sulla riga $\to$ `/database/businesses/:id`.

### B. Dettaglio Impresa (`BusinessDetail.tsx`)
Mostra le specifiche complete e l'analisi strategica di un'impresa.
*   **Elementi della pagina**:
    *   Pulsante medievale `← Torna alle imprese`.
    *   Intestazione con nome dell'impresa e icona grande del bene prodotto.
    *   **Statistiche Chiave**: Griglia con produzione/giorno, manutenzione/giorno e lavoratori richiesti.
    *   **Consumo Materie Prime (Inputs)**:
        *   Se l'impresa consuma materie prime, mostra l'elenco dei consumi giornalieri (es. -0.5 Grano). Ciascun ingrediente è collegato tramite link alla sua scheda tecnica (`/database/goods/:goodId`).
        *   Se non ha input (es. Segheria), mostra un banner verde "Produzione Autonoma (Nessun input)".
    *   **Costi di Edificazione**: Tabella con i requisiti esatti di Oro, Mattoni e Legno.
    *   **Geografia della Produzione**:
        *   Filtra dinamicamente le città dell'Hansa (leggendo da `TownService`) per mostrare dove questa impresa può essere edificata con efficienza al 100%.
        *   Le città trovate sono mostrate come elementi interattivi che portano a `/database/towns/:townId`.

---

## 5. Test e Validazione

1.  **Navigazione e Rotte**: Verificare che cliccando sulle righe delle tabelle, sui link delle merci, o sui link delle città, la navigazione avvenga correttamente senza errori di routing.
2.  **Persistenza**: Testare la personalizzazione delle colonne per entrambe le tabelle, assicurandosi che ciascuna tabella salvi le preferenze nella propria chiave in `localStorage` indipendente.
3.  **Localizzazione**: Cambiare lingua tra italiano ed inglese per validare che l'interfaccia (incluso l'header modificato) si adatti correttamente.
4.  **Integrità dei Dati**: Verificare che le relazioni incrociate (es. città che producono una risorsa, imprese associate a una risorsa) funzionino in modo impeccabile tramite i relativi service.
