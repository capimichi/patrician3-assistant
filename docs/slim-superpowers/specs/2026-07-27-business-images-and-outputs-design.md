# Specifica di Design: Immagini delle Imprese e Struttura ad Output Multipli

**Data:** 2026-07-27  
**Stato:** Approvato  
**Autore:** Antigravity (AI assistant)

---

## 1. Obiettivo e Contesto

L'obiettivo principale è aggiungere il supporto per le immagini reali degli edifici commerciali (imprese/laboratori) all'interno dell'applicazione **Patrician III Assistant**, prelevandole dal percorso locale fornito dall'utente. 

Inoltre, per supportare fedelmente le regole di gioco di *Patrician III*, viene riorganizzato il modello dei dati delle imprese passandolo da un singolo prodotto in uscita (`producedGoodId`) a un elenco di prodotti (`outputs` come array). Questo ci consente di:
1. Allineare il database all'elenco dei business corretti del gioco.
2. Rappresentare correttamente l'**Allevamento Bovini (Cattle Farm)** che produce sia **Carne (Meat)** che **Cuoio (Leather)** in un'unica struttura.
3. Rimuovere il business artificiale della **Conceria (Tannery)** e aggiungere la **Piantagione di Canapa (Hemp Farm)** che era assente.

---

## 2. Requisiti e Vincoli

### 2.1 Gestione Risorse Grafiche (Immagini)
* Creare la directory `/public/images/businesses/`.
* Copiare le immagini dalla cartella `/Users/michele/Downloads/pati/businesses-4x/upscayl_png_upscayl-standard-4x_4x/` rinominandole per corrispondere agli ID delle imprese (sostituendo gli underscore `_` con i trattini `-`).
* Per il business `pottery_workshop`, rinominare `pottery-business.png` in `pottery-workshop.png`.
* Per il business `whale_fishery` (caccia alle balene), riutilizzare la stessa immagine `fishery.png` (condivisa con il pescatore standard).

### 2.2 Modifiche al Database (`public/data/businesses.json`)
* Rimuovere l'impresa `tannery`.
* Inserire l'impresa `hemp_farm` (canapa).
* Aggiornare `cattle_farm` affinché produca sia `meat` (carne, 0.8 unità/giorno) che `leather` (cuoio, 1.2 unità/giorno), consumando sia `grain` (0.5 unità/giorno) che `salt` (0.3 unità/giorno).
* Modificare tutti gli altri elementi per sostituire `"producedGoodId"` e `"baseProductionPerDay"` con l'array `"outputs"`.

---

## 3. Architettura Dati e Codice

### 3.1 Tipi TypeScript (`src/types/index.ts`)
Aggiunta del tipo `BusinessOutput` e modifica del tipo `Business`:
```typescript
export interface BusinessOutput {
  goodId: string;
  amountPerDay: number;
}

export interface Business {
  id: string;
  name: LocalizedString;
  outputs: BusinessOutput[]; // Sostituisce producedGoodId e baseProductionPerDay
  inputs: BusinessInput[];
  constructionCost: {
    gold: number;
    bricks: number;
    timber: number;
  };
  workersNeeded: number;
  dailyMaintenance: number;
}
```

### 3.2 Modifiche di Utility (`src/utils/businessImage.ts`)
Nuova utility speculare a `goodImage.ts` per ottenere il percorso delle immagini delle imprese:
```typescript
export const getBusinessImagePath = (businessId: string): string => {
  const filename = businessId.toLowerCase().replace(/_/g, '-') + '.png';
  return `/images/businesses/${filename}`;
};
```

---

## 4. Modifiche all'Interfaccia Utente (UI) e Calcolatori

### 4.1 Calcolatore di Produzione (`src/pages/calculators/Production.tsx`)
* **Determinazione Specializzazione**: Un'impresa è considerata specialty in una città se almeno uno dei suoi output è presente nella lista `produces` della città:
  ```typescript
  const isSpecialty = townObj.produces.includes(output.goodId);
  ```
* **Accumulazione Bilancio**: Ciclo su `business.outputs` invece del vecchio campo singolo:
  ```typescript
  business.outputs.forEach((output) => {
    const isSpecialty = town.produces.includes(output.goodId);
    const dailyProd = output.amountPerDay * (isSpecialty ? 1.0 : 0.75) * count;
    balances[output.goodId].produced += dailyProd;
    branchReports[townId].balances[output.goodId] += dailyProd;
  });
  ```

### 4.2 Lista Imprese (`src/pages/database/BusinessesList.tsx`)
* La card visualizzerà l'immagine del business `getBusinessImagePath(business.id)` al posto dell'icona della singola merce.
* Invece di mostrare un singolo prodotto, mostrerà l'elenco di tutti gli output in `business.outputs` affiancati dai rispettivi nomi e icone merce.

### 4.3 Dettaglio Impresa (`src/pages/database/BusinessDetail.tsx`)
* Visualizzazione della grande immagine dell'edificio commerciale in alto.
* Aggiornamento del rendering per iterare sui molteplici output ed inputs del business.

### 4.4 Dettaglio Merce (`src/pages/database/GoodDetail.tsx`)
* Modifica del selettore dell'impresa associata alla merce:
  ```typescript
  const associatedBus = allBusinesses.find(b => b.outputs.some(out => out.goodId === id));
  ```

---

## 5. Piano di Test e Verifica

1. **Test di fumo e regressione**:
   * Eseguire la suite di test (`npm run test`) per verificare che la build e i test passino dopo il refactoring dei tipi.
   * Scrivere/aggiornare i test unitari di `BusinessDetail.test.tsx` e `BusinessesList.test.tsx` per riflettere la presenza dell'array `outputs` e delle immagini del business.
2. **Verifica Visiva**:
   * Controllare che tutte le 18 imprese abbiano un'immagine corretta caricata a schermo.
   * Verificare che l'Allevamento Bovini (Cattle Farm) mostri correttamente sia Carne che Cuoio sia nella lista che nel dettaglio.
