# Specifica di Design: Dettaglio Merci e Personalizzazione Colonne

Questo documento definisce il piano di design e implementazione per arricchire la sezione Database delle Merci di **Patrician 3 Assistant**. L'obiettivo è introdurre una tabella delle merci con colonne personalizzabili (salvate in `localStorage`) e una pagina di dettaglio per ogni risorsa con immagini HD reali tratte dagli asset ufficiali del gioco.

---

## 1. Obiettivi e Funzionalità

1.  **Rotte Dedicate (React Router)**:
    *   `/database/goods`: Pagina con l'elenco tabellare di tutte le merci.
    *   `/database/goods/:id`: Pagina di dettaglio per una singola merce (es. `/database/goods/pottery`).
2.  **Immagini HD Reali**:
    *   Copia delle 20 immagini PNG ad alta definizione nella cartella `public/images/goods/`.
    *   Associazione automatica tra risorsa e immagine.
3.  **Tabella Personalizzabile (Lista Merci)**:
    *   Pulsante "Colonne" che apre un dropdown con checkbox per scegliere quali colonne mostrare.
    *   Persistenza dello stato delle colonne in `localStorage`.
4.  **Database Corretto**:
    *   Sostituzione di `fodder` (Stramaglie) con `pottery` (Ceramiche).
    *   Ridenominazione di `train_oil` in `whale_oil` (Olio di Balena).
    *   Aggiunta dei due laboratori mancanti in `businesses.json` (Laboratorio di Ceramica e Baleniere).
    *   Aggiornamento di tutti i prezzi consigliati ed indici di soddisfazione secondo i dati reali forniti dall'utente.

---

## 2. Dettaglio delle Modifiche Dati (JSON)

### A. Modifiche a `public/data/goods.json`
Modificheremo la lista delle merci in modo che contenga esattamente le 20 risorse del gioco con i prezzi reali corretti:

| ID | Nome (IT) | Nome (EN) | Base Price | Buy Price Range | Sell Price Range | Max Satisfaction | Vol | Raw | Imported |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **beer** | Birra | Beer | 45 | `[35, 40]` | `[44, 60]` | 40 | 1 | No | No |
| **bricks** | Mattoni | Bricks | 100 | `[80, 80]` | `[130, 140]` | null | 1 | Sì | No |
| **cloth** | Tessuti | Cloth | 250 | `[220, 220]` | `[340, 350]` | 242 | 1 | No | No |
| **fish** | Pesce | Fish | 500 | `[450, 450]` | `[490, 540]` | 515 | 1 | No | No |
| **grain** | Grano | Grain | 110 | `[90, 90]` | `[140, 160]` | 141 | 1 | Sì | No |
| **hemp** | Canapa | Hemp | 450 | `[400, 400]` | `[500, 600]` | null | 1 | Sì | No |
| **honey** | Miele | Honey | 130 | `[110, 110]` | `[160, 180]` | 128 | 1 | No | No |
| **iron_goods** | Utensili | Iron Goods | 350 | `[320, 320]` | `[430, 450]` | 300 | 1 | No | No |
| **leather** | Cuoio | Leather | 280 | `[250, 250]` | `[300, 340]` | 262 | 1 | No | No |
| **meat** | Carne | Meat | 1100 | `[900, 900]` | `[1250, 1500]` | 1120 | 1 | No | No |
| **pig_iron** | Ferro grezzo | Pig Iron | 1050 | `[850, 950]` | `[1200, 1300]` | null | 1 | Sì | No |
| **pitch** | Pece | Pitch | 70 | `[60, 60]` | `[100, 120]` | null | 1 | Sì | No |
| **pottery** | Ceramiche | Pottery | 220 | `[170, 170]` | `[230, 250]` | 200 | 1 | No | No |
| **salt** | Sale | Salt | 30 | `[25, 25]` | `[33, 50]` | 32 | 1 | No | No |
| **skins** | Pelli | Skins | 800 | `[850, 850]` | `[900, 1400]` | 791 | 1 | Sì | No |
| **spices** | Spezie | Spices | 350 | `[280, 280]` | `[350, 400]` | 327 | 1 | No | Sì |
| **timber** | Legno | Timber | 60 | `[55, 55]` | `[75, 95]` | 70 | 1 | Sì | No |
| **whale_oil** | Olio di Balena | Whale Oil | 85 | `[70, 75]` | `[100, 150]` | 96 | 1 | No | No |
| **wine** | Vino | Wine | 280 | `[230, 230]` | `[350, 400]` | 257 | 1 | No | No |
| **wool** | Lana | Wool | 1000 | `[900, 900]` | `[1300, 1300]` | 1030 | 1 | Sì | No |

*Nota: `whale_oil` sostituisce il vecchio `train_oil`. `pottery` sostituisce il vecchio `fodder`.*

### B. Modifiche a `public/data/businesses.json`
1.  **Cattle Farm (`cattle_farm`)**: Aggiornare `inputs` sostituendo `fodder` con `grain` (quantità `0.5`).
2.  **Aggiunta di Pottery Workshop**:
    ```json
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
    }
    ```
3.  **Aggiunta di Whale Fishery**:
    ```json
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
    ```

### C. Modifiche a `public/data/towns.json`
*   Sostituire `"fodder"` con `"pottery"` per le città `stettin` e `ripen`.
*   Sostituire `"train_oil"` con `"whale_oil"` per le città `stockholm`, `aalborg` e `bergen`.

---

## 3. Architettura dell'Interfaccia Utente e Componenti

### A. Modifiche al Router (`src/router.tsx`)
Aggiornare le rotte dell'applicazione per supportare la separazione:
```typescript
import GoodsList from './pages/database/GoodsList';
import GoodDetail from './pages/database/GoodDetail';

// ...
{
  path: 'database/goods',
  element: <GoodsList />
},
{
  path: 'database/goods/:id',
  element: <GoodDetail />
}
```

### B. Gestione delle Immagini
Tutte le immagini verranno posizionate in `/public/images/goods/` e referenziate dinamicamente.
Dato l'ID di una merce, il nome del file corrispondente viene calcolato come:
`const imageFilename = id.replace('_', '-') + '.png';`
*Esempi:*
*   `beer` $\to$ `/images/goods/beer.png`
*   `iron_goods` $\to$ `/images/goods/iron-goods.png`
*   `whale_oil` $\to$ `/images/goods/whale-oil.png`

### C. Lista Merci Tabellare (`GoodsList.tsx`)
*   **Colonne disponibili**:
    *   `good` (sempre visibile, mostra icona + nome)
    *   `basePrice` (Prezzo base)
    *   `buyPrice` (Acquisto consigliato)
    *   `sellPrice` (Vendita consigliata)
    *   `maxSatisfaction` (Soddisfazione)
    *   `volume` (Stiva)
    *   `type` (Tipo: Greggio, Finito, Importato)
*   **Stato Persistente (localStorage)**:
    *   Chiave: `patrician3_goods_columns`
    *   Valore memorizzato: array di stringhe, es. `["basePrice", "buyPrice", "sellPrice", "type"]`.
*   **UI Dropdown Colonne**: Un pulsante "Colonne" con icona (es. `SlidersHorizontal` o `Columns`) che attiva un pannello a scomparsa contenente checkbox per ciascuna colonna opzionale.

### D. Pagina di Dettaglio (`GoodDetail.tsx`)
Mostra:
*   Header con link di ritorno `← Torna al listino` stilizzato come bottone medievale.
*   **Card Principale (Info Commerciali)**:
    *   Cornice pergamena con l'immagine HD (128x128px o superiore) e il nome della risorsa.
    *   Valori di prezzo consigliati evidenziati visivamente (colori semantici `success` per acquisto, `primary` o `secondary` per vendita).
*   **Card di Produzione / Impresa**:
    *   Se associata a un'impresa, ne descrive i costi, la produzione giornaliera e la manutenzione.
    *   **Consumi giornalieri**: Elenco dei consumi con nome, quantità e piccola icona del bene consumato (cliccabile per navigare direttamente al dettaglio di quel bene!).
*   **Card delle Città**:
    *   Mostra la lista delle città che producono questa merce in modo efficiente.
    *   Mostra un elenco di città che hanno industrie che consumano questa merce come input.

---

## 4. Test e Validazione

1.  **Integrità dei Dati**: Verificare che non vi siano riferimenti a `fodder` o `train_oil` non aggiornati.
2.  **Navigazione**: Testare la transizione bidirezionale tra `/database/goods` e `/database/goods/:id`.
3.  **Persistenza**: Ricaricare la pagina ed accertarsi che la configurazione delle colonne della tabella rimanga salvata nel localStorage.
4.  **Localizzazione**: Verificare che la traduzione (it/en) funzioni correttamente sia nella lista che nel dettaglio.
