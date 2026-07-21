# Documento di Design: Patrician 3 Assistant

Questo documento definisce il design dell'applicazione **Patrician 3 Assistant**, uno strumento interattivo per aiutare i giocatori del videogioco *Patrician III: L'Impero dei Mari* a gestire merci, rotte commerciali, produzione e convogli navali.

---

## 1. Obiettivi e Scopo del Progetto
L'obiettivo è realizzare un'applicazione web moderna, responsive e ad alte prestazioni che consenta ai giocatori di pianificare la propria strategia economica. L'app includerà un database statico del gioco e tre calcolatori principali (Produzione, Rotte e Convogli) alimentati da questo database.

---

## 2. Tecnologie e Architettura
L'applicazione sarà basata sulla seguente struttura tecnologica:
- **Framework**: React 18+ (con Vite come bundler)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS v3 (layout fluido e moderno)
- **Icone**: Lucide React / FontAwesome
- **Internazionalizzazione**: react-i18next (supporto iniziale per Italiano ed Inglese)
- **Routing**: react-router-dom

### Stile Estetico (Aesthetics)
- **Tema**: Dark Mode Premium medievale. Sfondo scuro (`#0f172a` o `#1e293b`), dettagli in oro satinato (`#d97706`), verde foresta (`#15803d`) per bilanci positivi e rosso rubino (`#dc2626`) per bilanci negativi.
- **Tipografia**: Titoli in carattere Serif elegante (es. *Cinzel* o *Playfair Display*), testi in Sans-serif ad alta leggibilità (es. *Inter*).

---

## 3. Architettura dei Servizi e Repository

Per garantire modularità, testabilità e isolamento, l'applicazione utilizzerà un'architettura a tre strati (Client/Repository -> Service -> Context), strutturata per risorsa/tipo (es. merci, città, navi, edifici, imprese).

### A. I file JSON di Gioco (Repository Statici)
Tutti i dati statici di gioco saranno salvati in file JSON posizionati nella cartella `/public/data/` del client:
- `/public/data/goods.json`
- `/public/data/towns.json`
- `/public/data/businesses.json`
- `/public/data/ships.json`
- `/public/data/buildings.json`

### B. Client / Repository (`/src/clients/`)
Ogni tipo di dato statico avrà il proprio Client TypeScript responsabile del fetch dei file JSON corrispondenti:
- `GoodClient`: Esegue il fetch di `/public/data/goods.json`.
- `TownClient`: Esegue il fetch di `/public/data/towns.json`.
- `BusinessClient`: Esegue il fetch di `/public/data/businesses.json`.
- `ShipClient`: Esegue il fetch di `/public/data/ships.json`.
- `BuildingClient`: Esegue il fetch di `/public/data/buildings.json`.

Ciascun client implementa la logica di caricamento con caching interno per evitare chiamate di rete ridondanti:
```typescript
export default class TownClient {
  private cache: TownRecord[] | null = null;
  
  async getTowns(): Promise<TownRecord[]> {
    if (this.cache) return this.cache;
    const res = await fetch('/data/towns.json');
    this.cache = await res.json() as TownRecord[];
    return this.cache;
  }
}
```

### C. Services (`/src/services/`)
I servizi applicano le regole di business, filtrano o mappano i dati per la lingua corrente e risolvono le relazioni tra entità (es. associare una merce alla sua impresa produttrice).
- `GoodService`: Fornisce le merci con i relativi testi localizzati e calcoli sui margini.
- `TownService`: Risolve l'elenco delle città e calcola le merci producibili senza/con penalità.
- `BusinessService`: Calcola la resa produttiva e il consumo delle imprese.
- `ShipService` / `ConvoyService`: Calcola i parametri complessivi dei convogli e le restrizioni fluviali.
- `BuildingService`: Gestisce case, capienze e calcolo degli affitti settimanali.

Esempio di Service:
```typescript
export default class TownService {
  private client: TownClient;
  
  constructor(client: TownClient) {
    this.client = client;
  }

  async getAllTowns(): Promise<Town[]> {
    const records = await this.client.getTowns();
    return records.map(r => this.mapToTown(r));
  }
}
```

### D. Servizi Context (`/src/servicesContext.tsx`)
Un React Context (`ServicesContext`) istanzierà tutti i client e i rispettivi service all'avvio dell'applicazione. Verrà esposto un hook personalizzato `useServices()` che consentirà ai componenti React di accedere a qualsiasi servizio:
```typescript
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) throw new Error('useServices must be used within a ServicesProvider');
  return context;
};
```

---

## 4. Modello Dati (Tipi TypeScript)

I tipi principali per modellare il database di gioco e lo stato dell'applicazione sono definiti in [types.ts](file:///Users/michele/Sites/patrician3-assistant/src/types/index.ts):

```typescript
export interface LocalizedString {
  it: string;
  en: string;
}

export interface Good {
  id: string; // es. 'beer', 'grain'
  name: LocalizedString;
  basePrice: number; // Prezzo base di riferimento del gioco
  buyPriceRange: [number, number]; // Fascia prezzo consigliato acquisto (es. [35, 40])
  sellPriceRange: [number, number]; // Fascia prezzo consigliato vendita (es. [44, 60])
  maxSatisfactionPrice: number | null; // Prezzo massimo per cui i cittadini sono soddisfatti
  volume: number; // Peso/volume in stiva (di solito 1 per tutti i beni in Patrician 3)
  isRawMaterial: boolean;
  isImported: boolean; // Se proviene da spedizioni (es. Spezie, Vino)
}

export interface BusinessInput {
  goodId: string;
  amountPerDay: number;
}

export interface Business {
  id: string; // es. 'brewery', 'workshop'
  name: LocalizedString;
  producedGoodId: string;
  baseProductionPerDay: number; // Produzione standard a pieno regime
  inputs: BusinessInput[]; // Merci consumate in ingresso
  constructionCost: {
    gold: number;
    bricks: number;
    timber: number;
  };
  workersNeeded: number; // Lavoratori impiegati (solitamente 30)
  dailyMaintenance: number; // Costo fisso giornaliero di gestione
}

export interface Town {
  id: string; // es. 'lubeck', 'hamburg'
  name: string;
  isRiverTown: boolean; // Le città fluviali limitano l'accesso alle sole navi fluviali (Snaikka, Crayer)
  produces: string[]; // Good IDs delle merci che la città produce in modo efficiente (senza penalità)
  coordinate?: {
    x: number; // Coordinata X per eventuale mappa
    y: number; // Coordinata Y
  };
}

export interface Building {
  id: string; // es. 'wooden_house', 'brick_house', 'mansion'
  name: LocalizedString;
  capacity: {
    poor: number;     // Capienza di poveri (es. 100)
    wealthy: number;  // Capienza di benestanti
    rich: number;     // Capienza di ricchi
  };
  constructionCost: {
    gold: number;
    bricks: number;
    timber: number;
  };
  weeklyRent: {
    poor: number;
    wealthy: number;
    rich: number;
  };
}

export interface ShipType {
  id: string; // 'snaikka', 'crayer', 'cog', 'holk'
  name: LocalizedString;
  baseCapacity: number; // Spazio di stiva massimo in barili
  minSailors: number;   // Marinai minimi necessari per navigare
  maxSailors: number;   // Marinai massimi ospitabili
  maxWeapons: number;   // Punti arma massimi
  isRiverFriendly: boolean; // Se può risalire i fiumi (Crayer e Snaikka sì, Cog e Holk no)
  dailyCost: number;    // Manutenzione giornaliera della nave
}
```

---

## 5. Database dei Dati Statici (Database di Gioco)

I dati saranno memorizzati in file JSON caricati via client:

### A. Merci (Goods)
Comprende le 20 merci classiche del gioco con i prezzi consigliati di acquisto/vendita ricavati dalle tabelle di riferimento:
- *Grano (Grain)*: Acquisto 90, Vendita 140-160
- *Birra (Beer)*: Acquisto 35-40, Vendita 44-60
- *Ferro (Pig Iron)*: Acquisto 850-950, Vendita 1200-1300
- *Utensili (Iron Goods)*: Acquisto 320, Vendita 430-450
- *Sale (Sale)*: Acquisto 25, Vendita 33-50
- *Pesce (Fish)*: Acquisto 450, Vendita 490-540
- *Carne (Meat)*: Acquisto 900, Vendita 1250-1500
- *Pelli (Skins)*: Acquisto 850, Vendita 900-1400
- *Canapa (Hemp)*: Acquisto 400, Vendita 500-600
- *Lana (Wool)*: Acquisto 900, Vendita 1300
- *Legno (Timber)*: Acquisto 55, Vendita 75-95
- *Mattoni (Bricks)*: Acquisto 80, Vendita 130-140
- *Pece (Pitch)*: Acquisto 60, Vendita 100-120
- *Miele (Honey)*: Acquisto 110, Vendita 160-180
- *Tessuti (Cloth)*: Acquisto 220, Vendita 340-350
- *Pelli Conciate (Leather)*: Acquisto 250, Vendita 300-340
- *Vino (Wine)*: Importato / Groningen, Colonia - Acquisto 230, Vendita 350-400
- *Spezie (Spices)*: Importato - Acquisto 280, Vendita 350-400
- *Olio di Balena (Train Oil)*: Acquisto 70-75, Vendita 100-150
- *Stramaglie (Fodder / Straw)*: Uso sussidiario

### B. Imprese (Businesses)
Configurazioni di produzione e consumi a pieno regime (es. Birreria consuma Grano e Legno, produce Birra; Officina consuma Ferro e Legno, produce Utensili).

### C. Città (Towns)
Le città della mappa standard di Patrician III (Lubecca, Danzica, Stettino, Rostock, Riga, Reval, Visby, Stoccolma, Torun, Colonia, Brema, Amburgo, Ripen, Aalborg, Oslo, Bergen, Ladoga, Pernau, etc.) con l'elenco delle produzioni efficienti predefinite.

---

## 6. UI: Pagine e Navigazione
L'Header sarà strutturato con una navbar responsive:

1. **Navbar Superiore (Fissa)**:
   - Logo in stile stemma anseatico.
   - Titolo: **Patrician III Assistant**.
   - Link:
     - **Home**: Dashboard riassuntiva con link veloci e panoramica dell'impero commerciale dell'utente.
     - **Database**: Menù a discesa contenente:
       - *Merci & Imprese*: Tabella interattiva con prezzi di mercato e consumi industriali.
       - *Città*: Mappa o lista interattiva per visualizzare le produzioni di ogni città.
       - *Edifici*: Costi di costruzione ed affitti per gli alloggi.
     - **Calcolatori**: Menù a discesa contenente:
       - *Calcolatore di Produzione*: Configurazione dell'impero commerciale dell'utente.
       - *Ottimizzatore di Rotte*: Calcolo delle merci da scambiare tra due città specifiche.
       - *Gestore Convogli*: Assemblaggio e armamento della flotta.
   - **Selettore Lingua (IT / EN)**.

---

## 7. Dettagli di Implementazione dei Calcolatori

### A. Calcolatore di Produzione
Permette di simulare le proprie attività economiche.
- **Flusso**:
  1. L'utente aggiunge una o più città al suo "Impero Attivo".
  2. Per ogni città aggiunta, imposta il numero di imprese attive per ciascun tipo (es. 3 Birrerie, 1 Segheria a Lubecca).
  3. L'applicazione analizza se le imprese sono efficienti in quella città:
     - Se l'impresa produce una merce NON inclusa nell'elenco `produces` della città, la produzione base viene ridotta del 25% (penalità).
  4. Viene calcolato il bilancio complessivo giornaliero e settimanale per ciascuna risorsa:
     $$\text{Bilancio}(G) = \sum (\text{Produzione}_G) - \sum (\text{Consumo}_G)$$
  5. Mostra un cruscotto globale che elenca il surplus o deficit di materie prime per città e complessivamente, facilitando la logistica tra le proprie filiali.

### B. Ottimizzatore di Rotte
Trova opportunità di guadagno tra due città.
- **Flusso**:
  1. L'utente seleziona la *Città A* (Origine) e la *Città B* (Destinazione).
  2. L'app incrocia le merci prodotte efficacemente in Città A con quelle richieste o non prodotte in Città B.
  3. Genera una lista di raccomandazioni (es. *"Compra Birra a Lubecca per massimo 40 oro e vendila a Danzica per almeno 55 oro"*).
  4. Permette di inserire i prezzi effettivi di mercato riscontrati nel gioco per calcolare il margine netto esatto per singola rotta, considerando anche il consumo di stiva.

### C. Gestore Convogli
Pianifica la flotta per il commercio o la scorta.
- **Flusso**:
  1. L'utente inserisce la quantità di navi per ciascuna tipologia (Snaikka, Crayer, Cog, Holk).
  2. Definisce la configurazione di armamento (Nessuno, Parziale, Massimo).
  3. L'app calcola:
     - **Stiva Lorda** e **Stiva Netta**: L'armamento riduce lo spazio di stiva (es. ogni cannone o upgrade riduce la stiva disponibile).
     - **Equipaggio**: Numero minimo di marinai per far salpare il convoglio e numero massimo per la scorta armata.
     - **Idoneità Fluviale**: Se il convoglio contiene navi non fluviali (Cog o Holk), l'app mostra un avviso indicando che non potrà risalire i fiumi per raggiungere città fluviali come Colonia o Torun.
     - **Costo Giornaliero**: Manutenzione giornaliera totale derivante dal costo delle navi e dai salari dei marinai a bordo.

---

## 8. Strategia di Test ed Error Handling
Per garantire l'affidabilità dell'applicazione, adotteremo:
- **Validazione degli Input**: Tutti i campi numerici dei calcolatori avranno limiti minimi (es. $\ge 0$) e controlli di tipo per evitare calcoli errati (`NaN`).
- **Persistenza Locale**: Lo stato dell'impero commerciale dell'utente (le città aggiunte e le imprese costruite) verrà salvato automaticamente nel `localStorage` del browser per evitare perdite di dati al ricaricamento della pagina.
- **Test Unitari**: Test per le formule di bilancio della produzione (con e senza penalità del 25%) e per la detrazione dello spazio di stiva in base alle armi installate.
