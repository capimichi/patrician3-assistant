# Specifica di Design: Ottimizzazione Liste Database e Vista Dettaglio Impresa

**Data:** 2026-07-27  
**Stato:** Approvato  
**Autore:** Antigravity (AI assistant)

---

## 1. Obiettivo e Contesto

L'obiettivo di questa specifica è migliorare l'usabilità (UX) e la pulizia visiva (UI) delle pagine di database dell'applicazione **Patrician III Assistant**:
1. **Migliorare l'intuitività delle righe cliccabili** nelle tabelle del database (`GoodsList`, `TownsList`, `BusinessesList`), rendendo l'effetto hover più evidente.
2. **Eliminare ridondanze informative** rimuovendo il badge "Fluviale" accanto al nome della città nella lista, poiché l'informazione è già contenuta nella colonna "Tipo Porto".
3. **Semplificare il design delle materie prime richieste** nella lista delle imprese per i laboratori che non ne richiedono alcuna (autosufficienti), sostituendo l'attuale badge di testo con un pulito trattino `—`.
4. **Ottimizzare la vista dettaglio impresa** (`BusinessDetail.tsx`) spostando i dettagli analitici della resa di produzione (quantità ed icone) dalla card sinistra a un nuovo box dedicato a destra, mantenendo a sinistra solo i badge di collegamento rapidi per evitare duplicazioni.

---

## 2. Requisiti e Vincoli

*   **Coerenza Estetica**: L'effetto hover deve essere uniforme su tutte le liste principali per garantire un comportamento consistente.
*   **Gestione Traduzioni (i18n)**: Rallineare le chiavi delle colonne in `ALL_COLUMNS` per l'impresa in modo da utilizzare testi corretti in base alla lingua (Italiano / Inglese).
*   **Assenza di Regressioni**: I componenti e i link già presenti (collegamenti ipertestuali incrociati) devono continuare a funzionare perfettamente dopo il refactoring delle viste.

---

## 3. Dettaglio delle Modifiche

### 3.1 Miglioramento dell'Hover sulle Righe delle Tabelle
Nelle tre liste principali (`GoodsList.tsx`, `TownsList.tsx` e `BusinessesList.tsx`), modificheremo la riga della tabella `<tr>` per rendere l'effetto hover più evidente al passaggio del mouse.

*   **Codice Precedente**:
    ```typescript
    className="cursor-pointer transition-colors hover:bg-primary/5 bg-background border-l-4 border-transparent hover:border-secondary"
    ```
*   **Nuovo Codice**:
    ```typescript
    className="cursor-pointer transition-all duration-150 hover:bg-primary/10 bg-background border-l-4 border-transparent hover:border-primary/40 hover:shadow-xs active:bg-primary/15"
    ```

### 3.2 Rimozione del Badge Fluviale Ridondante (`TownsList.tsx`)
Nel file [TownsList.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/TownsList.tsx), rimuoveremo il badge condizionale dall'interno del nome della città.

*   **Codice Precedente**:
    ```typescript
    <div className="text-sm font-semibold text-neutral-dark">{town.name}</div>
    {town.isRiverTown && (
      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
        {t('database_towns.river')}
      </span>
    )}
    ```
*   **Nuovo Codice**:
    ```typescript
    <div className="text-sm font-semibold text-neutral-dark">{town.name}</div>
    ```

### 3.3 Pulizia e Ridenominazione Colonne (`BusinessesList.tsx`)
Nel file [BusinessesList.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/BusinessesList.tsx):

1.  **Uniformità Etichetta Colonna**:
    Modificare la definizione di `ALL_COLUMNS` per la colonna `product` in modo che usi "Prodotti in Uscita" anziché "Bene Prodotto", per rispecchiare l'intestazione della tabella:
    ```typescript
    // Modifica in ALL_COLUMNS:
    { id: 'product', labelIt: 'Prodotti in Uscita', labelEn: 'Produced Goods' }
    ```
2.  **Semplificazione Materie Prime Mancanti**:
    Sostituire la stringa di avviso per l'assenza di materie prime con un trattino.
    *   **Codice Precedente**:
        ```typescript
        <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-bold uppercase">
          {t('database_businesses.no_raw_needed')}
        </span>
        ```
    *   **Nuovo Codice**:
        ```typescript
        <span className="text-gray-400 font-mono text-center block w-full select-none" title={t('database_businesses.no_raw_needed')}>
          —
        </span>
        ```

### 3.4 Ristrutturazione Vista Dettaglio Impresa (`BusinessDetail.tsx`)
Nel file [BusinessDetail.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/BusinessDetail.tsx):

1.  **Card di Sinistra**:
    Rimuovere interamente il blocco `production_yield` (Righe 123-142) che mostrava il consumo orario. Mantenere intatti i badge cliccabili situati sotto il titolo dell'impresa (Righe 101-120).
2.  **Card di Destra**:
    Aggiungere un nuovo blocco per visualizzare i prodotti in uscita in cima alla colonna destra, strutturato esattamente come il blocco delle materie prime richieste:
    ```typescript
    {/* Resa di Produzione (Output) */}
    <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
        <Sparkles className="h-5 w-5 text-primary" />
        <span>{t('database_businesses.production_yield')}</span>
      </h3>

      <div className="space-y-2">
        {business.outputs.map((out: any) => {
          const outGood = goodsList.find(g => g.id === out.goodId);
          const outGoodName = outGood ? outGood.name : out.goodId;
          return (
            <Link
              key={out.goodId}
              to={`/database/goods/${out.goodId}`}
              className="flex justify-between items-center bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-colors group"
            >
              <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                <img
                  src={getGoodImagePath(out.goodId)}
                  alt={outGoodName}
                  className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                />
                <span className="group-hover:text-primary transition-colors">{outGoodName}</span>
              </span>
              <span className="text-sm font-bold text-success font-mono inline-flex items-center">
                <GameIcon type="barrel" className="h-3.5 w-3.5 mr-1" />
                +{out.amountPerDay} /
                <GameIcon type="hourglass" className="h-3.5 w-3.5 mx-1" />
                {t('production.day')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
    ```

---

## 4. Piano di Test e Verifica

1.  **Test di build**: Eseguire `npm run build` per confermare che non ci siano errori TypeScript o di bundle.
2.  **Verifica Visiva**:
    *   Aprire la lista delle città e verificare che il badge "Fluviale" sia scomparso dalla prima colonna del nome città.
    *   Passare il mouse su tutte le tabelle per verificare che l'hover sia più visibile e uniforme.
    *   Verificare che per le imprese autosufficienti (es. Pesca, Segheria, Mattoni) appaia il trattino `—` al posto del testo.
    *   Aprire il dettaglio di un'impresa e verificare che la resa di produzione sia mostrata nella card di destra con lo stesso stile grafico delle materie prime.
