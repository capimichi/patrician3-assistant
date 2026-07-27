# Specifica di Design: Icone di Gioco e Internazionalizzazione Completa (i18n)

**Data:** 2026-07-27  
**Stato:** In fase di approvazione  
**Autore:** Antigravity (AI assistant)

---

## 1. Obiettivo e Contesto

L'obiettivo principale è migliorare l'impatto visivo e la coerenza tematica dell'applicazione **Patrician III Assistant** introducendo tre nuove icone grafiche originarie del gioco (`barrel.png`, `load.png`, `hourglass.png`) per rappresentare rispettivamente i beni finiti, le materie grezze (raw materials) e i valori temporali (giorni/tempo). 

Al contempo, si intende correggere il debito tecnico legato ai testi in lingua inglese: gran parte delle etichette e dei testi descrittivi nei calcolatori e nel database è cablata in italiano nei file `.tsx`. Verrà eseguito un refactoring completo per centralizzare tutte le stringhe di testo in `src/i18n.ts` per supportare pienamente lo switch di lingua (italiano/inglese).

---

## 2. Requisiti e Vincoli

### 2.1 Risorse Grafiche (Icone)
Le icone sono già state copiate nella directory `/public/images/`:
*   `public/images/barrel.png` (Icona per beni finiti / barili)
*   `public/images/load.png` (Icona per materie prime / carichi grezzi)
*   `public/images/hourglass.png` (Icona per indicatori temporali / clessidra / giorno)

### 2.2 Componente Condiviso `GameIcon`
Creeremo un nuovo componente riutilizzabile [GameIcon.tsx](file:///Users/michele/Sites/patrician3-assistant/src/components/GameIcon.tsx) per standardizzare il rendering delle immagini:
*   Supporta le prop `type` ('barrel' | 'load' | 'hourglass'), `className` (con stili predefiniti per allineamento inline-block e margini), e un `alt` opzionale.
*   Include un gestore `onError` per nascondere l'icona nel caso in cui la risorsa fallisca il caricamento, evitando broken image indicator.

### 2.3 Punti di Integrazione delle Icone
Le tre icone verranno integrate nei seguenti punti critici dell'interfaccia utente:

1.  **Icona `barrel` (Beni Finiti)**:
    *   Accanto alla dicitura "Bene Finito" / "Finished Good" in [GoodsList.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/GoodsList.tsx) e [GoodDetail.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/GoodDetail.tsx).
2.  **Icona `load` (Materie Grezze / Consumi)**:
    *   Accanto alla dicitura "Materia Grezza" / "Raw Material" in [GoodsList.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/GoodsList.tsx) e [GoodDetail.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/GoodDetail.tsx).
    *   Accanto al titolo dei consumi delle materie prime nei dettagli dell'impresa.
3.  **Icona `hourglass` (Durata / Giorni / Manutenzione)**:
    *   Nelle intestazioni delle tabelle e nei calcolatori accanto a indicazioni temporali o di costo giornaliero, ad esempio:
        *   "Produzione Totale / Giorno" -> icona hourglass + testo.
        *   "Consumo Totale / Giorno" -> icona hourglass + testo.
        *   "Bilancio Netto / Giorno" -> icona hourglass + testo.
        *   "Costo: -{val}g/giorno" -> icona hourglass + testo.
        *   "Spesa Giornaliera" -> icona hourglass + testo.

---

## 3. Riorganizzazione delle Traduzioni (i18n)

Attualmente, molti testi sono hardcoded in italiano. Sposteremo tutte le stringhe di testo in [src/i18n.ts](file:///Users/michele/Sites/patrician3-assistant/src/i18n.ts), traducendole opportunamente in inglese (`en`).

Le chiavi verranno raggruppate per modulo/pagina per garantire massima manutenibilità:

```typescript
// Struttura logica in src/i18n.ts
const resources = {
  it: {
    translation: {
      header: { ... },
      home: { ... },
      common: {
        loading: "Caricamento...",
        back: "Indietro",
        select_town: "Seleziona Città",
        // ... altre chiavi comuni
      },
      production: {
        title: "Calcolatore di Produzione",
        desc: "Gestisci la rete commerciale anseatica simulando fabbriche, consumi e logistica delle risorse.",
        add_town: "-- Aggiungi Città --",
        tab_global: "Riepilogo Impero",
        tab_branches: "Gestione Filiali",
        maintenance_cost: "Costi di Manutenzione Giornalieri",
        total_workers: "Dipendenti Totali",
        active_cities: "Città Attive",
        global_balance: "Bilancio Globale Risorse",
        resource: "Risorsa",
        prod_day: "Produzione Totale / Giorno",
        cons_day: "Consumo Totale / Giorno",
        net_day: "Bilancio Netto / Giorno",
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
        empty_local: "Nessuna risorsa movimentata. Aggiungi laboratori per simulare la logistica locale."
      },
      routes: {
        title: "Ottimizzatore di Rotte Commerciali",
        desc: "Seleziona due città commerciali per identificare istantaneamente le merci con il maggior potenziale di profitto.",
        origin: "Città di Partenza (Origine)",
        destination: "Città di Arrivo (Destinazione)",
        cargo_sim: "Stiva Simulata (Barili)",
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
        empty_convoy: "Aggiungi navi al convoglio usando i controls a sinistra per calcolare le statistiche della flotta."
      },
      database_goods: {
        title: "Listino Merci",
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
        no_industrial_cities: "Nessuna città consuma questa risorsa per la produzione industriale."
      }
    }
  },
  en: {
    // Speculari traduzioni corrette in lingua inglese
  }
};
```

---

## 4. Test e Validazione

1.  **Test di Compilazione**: Esecuzione del comando `npm run build` per assicurarci che non vi siano errori TypeScript dovuti a importazioni non corrette o file non validi.
2.  **Test Unitari**: Esecuzione di `npm run test` per verificare che i test preesistenti (ad es. per la lista e i dettagli del database) non falliscano a causa della rimozione di testi fissi a favore di `useTranslation`.
3.  **Verifica Visiva**: Controllo del corretto allineamento verticale delle icone grafiche nel testo e nei pulsanti/badge della UI.
