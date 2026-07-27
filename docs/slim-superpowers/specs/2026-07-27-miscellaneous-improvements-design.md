# Specifica di Design: Miglioramenti Miscellanei (Icona Oro, Link e Unificazione Componenti)

**Data:** 2026-07-27  
**Stato:** Approvato  
**Autore:** Antigravity (AI assistant)

---

## 1. Obiettivo e Contesto

L'obiettivo di questa specifica è l'implementazione di una serie di miglioramenti all'interfaccia utente (UI) e all'esperienza di navigazione (UX) all'interno dell'applicazione **Patrician III Assistant**:
1. Introdurre la nuova icona dorata per rappresentare i prezzi e i costi monetari (`g`/`gs`), migliorando l'estetica visiva ed eliminando le abbreviazioni testuali dove opportuno.
2. Semplificare la voce di menu principale per il database delle città, cambiandola da "Database Città" a "Città".
3. Visualizzare le icone delle risorse (mattoni, legno, oro) all'interno dei requisiti di costruzione delle imprese e degli edifici.
4. Unificare il blocco grafico per elencare le "Città di produzione efficace" in un unico componente React riutilizzabile.
5. Integrare collegamenti ipertestuali diretti (`Link`) tra tutte le entità collegate (merci -> imprese, città -> dettagli, ecc.) sia all'interno delle pagine informative che dei calcolatori.

---

## 2. Requisiti e Vincoli

### 2.1 Gestione Risorse Grafiche (Asset)
* Utilizzare l'immagine dorata copiata in `/public/images/gold.png` per tutte le occorrenze monetarie nelle pagine di dettaglio e nelle liste principali.
* Utilizzare le icone delle merci `/public/images/goods/bricks.png` e `/public/images/goods/timber.png` per i relativi costi di edificazione.

### 2.2 Localizzazione e Menu di Navigazione
* Modificare in `src/i18n.ts` la voce `header.towns`:
  * Italiano: da `"Database Città"` a `"Città"`
  * Inglese: da `"Town Database"` a `"Towns"`

### 2.3 Collegamenti incrociati e navigazione
* Tutti i riferimenti testuali o grafici a Merci, Imprese e Città devono disporre di un link di navigazione diretto.
* Nei calcolatori, la navigazione deve avvenire sulla stessa scheda corrente (senza `target="_blank"`), come concordato con l'utente.

---

## 3. Architettura dei Nuovi Componenti

### 3.1 Componente `GoldAmount` (`src/components/GoldAmount.tsx`)
Questo componente gestisce la formattazione dei prezzi e dei costi con la nuova icona dorata.
```typescript
import React from 'react';

interface GoldAmountProps {
  amount: number | string;
  className?: string;
  iconSize?: string; // default: 'h-4 w-4'
}

export const GoldAmount: React.FC<GoldAmountProps> = ({
  amount,
  className = "font-mono font-bold text-neutral-dark",
  iconSize = "h-4 w-4"
}) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{amount}</span>
      <img 
        src="/images/gold.png" 
        alt="oro" 
        className={`${iconSize} object-contain inline-block align-middle`}
      />
    </span>
  );
};
```

### 3.2 Componente `TownLinkList` (`src/components/TownLinkList.tsx`)
Questo componente unifica le liste delle città produttrici e consumatrici usate nelle schede di dettaglio.
```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import type { Town } from '../types';

interface TownLinkListProps {
  towns: Town[];
  emptyMessage: string;
  variant?: 'grid' | 'list'; // 'grid' per imprese (2 colonne), 'list' per merci (lista verticale semplice)
}

export const TownLinkList: React.FC<TownLinkListProps> = ({
  towns,
  emptyMessage,
  variant = 'list'
}) => {
  if (towns.length === 0) {
    return <p className="text-xs text-gray-600 italic">{emptyMessage}</p>;
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {towns.map((town) => (
          <Link
            key={town.id}
            to={`/database/towns/${town.id}`}
            className="bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
          >
            <span className="text-sm font-semibold text-neutral-dark group-hover:text-primary transition-colors">
              {town.name}
            </span>
            {town.isRiverTown && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                Fluviale
              </span>
            )}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {towns.map((town) => (
        <li key={town.id} className="text-sm font-semibold bg-background px-2.5 py-1.5 rounded border border-primary/5 hover:border-primary/25 transition-all">
          <Link 
            to={`/database/towns/${town.id}`} 
            className="text-neutral-dark hover:text-primary transition-colors flex items-center justify-between"
          >
            <span>{town.name}</span>
            {town.isRiverTown && (
              <span className="text-3xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                Fluviale
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};
```

---

## 4. Modifiche ai Componenti Esistenti

### 4.1 `src/i18n.ts`
* Cambiare `header.towns` in `"Città"` (IT) e `"Towns"` (EN).

### 4.2 `src/pages/database/BusinessDetail.tsx`
* Sostituire il box delle città di produzione con il componente `TownLinkList` usando `variant="grid"`.
* Mostrare l'icona dell'oro nel costo monetario e le icone delle risorse per mattoni e legno nei requisiti di costruzione.
* Collegare tramite `<Link>` i prodotti visualizzati in output e gli input necessari.

### 4.3 `src/pages/database/GoodDetail.tsx`
* Sostituire le liste di città produttrici e consumatrici con il componente `TownLinkList` usando `variant="list"`.
* Modificare la visualizzazione dei requisiti di costruzione dell'impresa associata, premettendo le icone delle risorse (oro, mattoni, legno) proprio come in `BusinessDetail`.
* Sostituire le indicazioni monetarie con il componente `GoldAmount` (ad es. per i prezzi base, acquisto, vendita, manutenzione).
* Rendere cliccabile il nome dell'impresa associata tramite `<Link>`.

### 4.4 `src/pages/database/TownDetail.tsx`
* Avvolgere le specializzazioni della città con link `<Link to={`/database/goods/${goodId}`}>`.

### 4.5 `src/pages/database/GoodsList.tsx`
* Sostituire il testo `g` con il componente `GoldAmount` all'interno della tabella dei prezzi delle merci.

### 4.6 `src/pages/database/BusinessesList.tsx`
* Sostituire l'indicazione monetaria e i costi di edificazione della tabella con icone e quantità.

### 4.7 `src/pages/database/Buildings.tsx`
* Mostrare l'icona dell'oro per la rendita da affitto settimanale.
* Mostrare le icone di oro, mattoni e legno nella sezione dei requisiti di costruzione degli edifici residenziali.

### 4.8 Calcolatori (`src/pages/calculators/*`)
* Introdurre link di navigazione rapidi sulle celle delle tabelle e sulle schede per consentire la consultazione al volo del database durante i calcoli economici.

---

## 5. Piano di Test e Verifica

1. **Test di fumo e di build (`npm run test` & `npm run build`)**:
   * Garantire che tutti i file compilino correttamente dopo l'aggiunta e la sostituzione dei componenti.
2. **Verifica Visiva dell'Icona dell'Oro**:
   * Verificare che l'icona si allinei correttamente e abbia una dimensione proporzionata al testo.
3. **Verifica dei Link di Navigazione**:
   * Testare i percorsi incrociati navigando avanti e indietro tra Merci, Imprese e Città.
