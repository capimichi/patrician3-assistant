# Design Spec: Scheda 10 - Tempi di Viaggio (Travel Times / Fahrzeiten)

Questa specifica dettaglia l'implementazione della **Scheda 10: Tempi di Viaggio** all'interno dell'assistente interattivo web per Patrician III. Questo modulo fungerà sia da visualizzatore della matrice di navigazione 40x40 originale, sia da calcolatore/simulatore dinamico delle rotte dei convogli commerciali.

---

## 1. Obiettivo e Background

Nel gioco Patrician III, i tempi di navigazione tra le città sono statici ma determinanti per tutta la catena logistica. Essi influenzano direttamente:
1. **La frequenza di rotazione dei convogli**: Quanto tempo impiega un convoglio ad andare al magazzino centrale (ZL) e ritornare.
2. **Le scorte di sicurezza (Sperrlager)**: Calcolate moltiplicando il consumo giornaliero per i giorni totali di viaggio (andata e ritorno + tappe + scorte di riserva).

Attualmente, l'applicazione possiede la matrice `travel_times.json` ma non fornisce una vista dedicata per consultarla o simulare le rotte prima di salvare la configurazione generale. Questo modulo colmerà tale lacuna.

---

## 2. Architettura e Routing

La nuova funzionalità verrà integrata nel sistema di navigazione esistente.

### A. Routing in `router.tsx`
Aggiungeremo la rotta `/dashboard/travel-times`:
* **Path**: `/dashboard/travel-times`
* **Componente**: `src/pages/dashboard/TravelTimes.tsx`

### B. Sidebar in `DashboardLayout.tsx`
Inseriremo il collegamento nella barra laterale:
```typescript
{ path: '/dashboard/travel-times', key: 'travel_times' }
```
La voce sarà posizionata subito dopo `convoy_manager` per affinità tematica logistica.

### C. Traduzioni in `src/i18n.ts`
Aggiungeremo le seguenti chiavi:
* **Italiano (`it`)**:
  ```json
  "travel_times": "Tempi di Viaggio",
  "travel_times_title": "Tempi di Viaggio della Lega",
  "travel_times_desc": "Visualizza la matrice dei tempi di navigazione e calcola la durata reale dei tuoi convogli considerando le navi e le fermate.",
  "travel_origin": "Città di Origine",
  "travel_destination": "Città di Destinazione",
  "travel_slowest_ship": "Nave più lenta nella rotta",
  "travel_stops": "Fermate intermedie (A/R)",
  "travel_results": "Risultati Calcolo Rotta",
  "travel_one_way": "Solo Andata (Base)",
  "travel_round_trip_base": "Andata e Ritorno (Base)",
  "travel_round_trip_real": "Andata e Ritorno Reale",
  "travel_ship_effect": "Moltiplicatore Nave",
  "travel_stops_penalty": "Penalità Fermate",
  "travel_show_active_only": "Mostra solo città attive",
  "travel_highlight_city": "Evidenzia Città nella griglia",
  "travel_days": "giorni",
  "travel_days_short": "g."
  ```
* **Inglese (`en`)**:
  ```json
  "travel_times": "Travel Times",
  "travel_times_title": "Hanseatic Travel Times",
  "travel_times_desc": "View the sailing times matrix and calculate the real duration of your convoys taking into account ship types and route stops.",
  "travel_origin": "Origin City",
  "travel_destination": "Destination City",
  "travel_slowest_ship": "Slowest ship on route",
  "travel_stops": "Intermediate stops (R/T)",
  "travel_results": "Route Calculation Results",
  "travel_one_way": "One Way (Base)",
  "travel_round_trip_base": "Round Trip (Base)",
  "travel_round_trip_real": "Real Round Trip",
  "travel_ship_effect": "Ship Multiplier",
  "travel_stops_penalty": "Stops Penalty",
  "travel_show_active_only": "Show active cities only",
  "travel_highlight_city": "Highlight City in grid",
  "travel_days": "days",
  "travel_days_short": "d."
  ```

---

## 3. Logica dei Calcoli

### A. Ricerca Matrice (Sola andata)
Il tempo base di sola andata tra due città viene recuperato dal metodo di utilità `getTravelTime` della classe `Game` in `GameEntity.ts`.

### B. Correzione Formula di Andata e Ritorno
La formula per calcolare il tempo di viaggio reale di un convoglio tiene conto del tipo di nave più lenta e delle fermate:
$$T_{\text{reale}} = (2 \times T_{\text{base}}) \times M_{\text{nave}} + (\text{Fermate} \times 0.25)$$

I modificatori di velocità della nave ($M_{\text{nave}}$) definiti in `pii_constants.json` sono:
* **crayer** (Caravella / Kraier): `1.00`
* **snaikka** (Snigge / Schnigge): `1.09`
* **holk** (Holk): `1.19`
* **cog** (Kogge / Cog): `1.32`

*Nota di Miglioramento*: Modificheremo il metodo `getTownConvoyRoundTripTime` in `src/services/GameEntity.ts` per riflettere questo calcolo corretto applicando il modificatore velocità (attualmente non considerato).

---

## 4. Specifiche dell'Interfaccia Utente (UI)

La pagina `TravelTimes.tsx` conterrà:

### A. Simulatore di Rotta Dinamico
1. **Pannello Controlli**:
   * Selezione della città di **Origine** e **Destinazione** (caricate dinamicamente dall'elenco statico delle città del gioco).
   * Selezione del **Tipo di Nave** e inserimento delle **Fermate** (inizializzate in base allo stato salvato per la città di origine nel `GameContext`, ma modificabili liberamente senza salvare per effettuare simulazioni al volo).
2. **Pannello Risultati**:
   * Un indicatore di grandi dimensioni per il **Tempo A/R Reale** (es. `4.52 giorni`).
   * Dettaglio dei fattori di calcolo (sola andata base, andata e ritorno base, incremento dovuto al modificatore velocità, incremento dovuto alle fermate).
   * Tabella leggenda delle navi per dare contesto visivo immediato.

### B. Matrice 40x40 Interattiva
1. **Filtro Città Attive**: Un checkbox/toggle per mostrare solo le righe e colonne corrispondenti alle città con `isActive === true` nel gioco corrente. Se disattivato, mostra tutte le 40 città della Lega.
2. **Evidenziatore di Riferimento**: Un menu a discesa permette di scegliere una città. Selezionandola, la riga e la colonna corrispondenti nella tabella 40x40 verranno evidenziate con uno sfondo morbido.
3. **Tabella con Scroll**:
   * Intestazioni di riga e colonna con i nomi delle città.
   * Celle contenenti il tempo di sola andata base in giorni (arrotondato a 2 o 3 decimali).
   * Effetto hover sulle celle per evidenziare l'incrocio origine-destinazione e mostrare un tooltip esplicativo (es: `"Da Lubecca a Amburgo: 3.35 giorni"`).

---

## 5. Checklist di Implementazione

- [ ] **Traduzioni (i18n)**: Aggiungere i testi in `src/i18n.ts` sia nel blocco `it` che `en`.
- [ ] **Modifica Classe di Dominio**: Aggiornare `getTownConvoyRoundTripTime` in `src/services/GameEntity.ts` per applicare il moltiplicatore di velocità della nave più lenta.
- [ ] **Nuovo Componente**: Creare `src/pages/dashboard/TravelTimes.tsx` contenente il layout reattivo del simulatore e della griglia 40x40.
- [ ] **Registrazione Rotta**: Aggiungere la rotta in `src/router.tsx`.
- [ ] **Aggiornamento Sidebar**: Integrare il link in `src/layouts/DashboardLayout.tsx`.
- [ ] **Validazione**: Eseguire i test unitari esistenti (`npm run test`) per assicurarsi che la modifica alla classe di dominio non rompa i test della stiva convogli.
