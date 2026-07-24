# Specifica di Design: Refactoring del Tema Grafico e Colori Semantici

Questo documento definisce il piano di refactoring del tema grafico dell'applicazione **Patrician 3 Assistant**, migrando dal precedente stile "Dark Mode medievale" a un **tema chiaro stile "Pergamena Antica"** basato sui colori ufficiali del gioco Patrician III.

---

## 1. Obiettivi del Refactoring

1. **Aderenza al Gioco**: Adottare i colori ufficiali del gioco per creare un'esperienza immersiva.
2. **Tema Chiaro "Pergamena"**: Abbandonare il tema scuro per uno sfondo chiaro che richieggia la carta/pergamena antica, migliorando il contrasto e la leggibilità di testi e tabelle.
3. **Scalabilità ed Eleganza**: Ristrutturare la palette in `tailwind.config.js` utilizzando nomi semantici standard (`primary`, `secondary`, `background`, `card`, `neutral-dark`) anziché nomi ad-hoc.
4. **Resa Visiva**: Mantenere dettagli medievali premium (bordi definiti, font eleganti Cinzel/Serif per titoli) senza creare confusione visiva ("mappazzone").

---

## 2. Nuova Palette Colori (Tailwind CSS)

Definiamo i colori principali nel file di configurazione di Tailwind:

| Nome Chiave | Codice Esadecimale | Descrizione e Utilizzo |
| :--- | :--- | :--- |
| **`primary`** | `#643518` | Marrone scuro ufficiale. Usato per dettagli, bordi, separatori e titoli importanti. |
| **`secondary`** | `#EABE32` | Giallo oro ufficiale. Usato per pulsanti principali, elementi attivi, selezioni e badge. |
| **`background`** | `#F5F2EB` | Sfondo chiaro (bianchino pergamena). Sostituisce il nero/grigio scuro come sfondo principale della pagina. |
| **`card`** | `#DFD9C0` | Sabbia medio (tonalità naturale di `#CABE98`). Usato per card, pannelli, moduli e sfondi di tabelle. |
| **`neutral-dark`** | `#1E1B15` | Testo principale quasi nero. Massimizza la leggibilità sullo sfondo chiaro. |
| **`success`** | `#15803d` | Verde foresta per bilanci e profitti positivi. |
| **`danger`** | `#dc2626` | Rosso rubino per perdite, deficit e bilanci negativi. |

---

## 3. Modifiche alla Configurazione

### A. `tailwind.config.js`
Sostituiremo il vecchio oggetto `medieval` estendendo il tema con le nuove chiavi semantiche:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#643518',
        secondary: '#EABE32',
        background: '#F5F2EB',
        card: '#DFD9C0',
        'neutral-dark': '#1E1B15',
        success: '#15803d',
        danger: '#dc2626',
      }
    },
  },
  plugins: [],
}
```

### B. `src/index.css`
Aggiornare le regole di base per applicare il nuovo sfondo e il colore del testo predefinito:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    margin: 0;
    background-color: #F5F2EB; /* bg-background */
    color: #1E1B15;            /* text-neutral-dark */
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}
```

---

## 4. Linee Guida di Conversione delle Classi UI

Per garantire coerenza, adotteremo la seguente mappatura durante la conversione dei file:

1. **Sfondo del layout**: `bg-medieval-dark` $\to$ `bg-background`
2. **Sfondo di Card/Pannelli/Header/Footer**: `bg-medieval-slate` o `bg-medieval-slate/40` $\to$ `bg-card`
3. **Bordi decorativi**: `border-medieval-gold/20` o `/30` $\to$ `border-primary/20` (o `border-primary/40` per maggiore enfasi)
4. **Pulsanti**: 
   - `bg-medieval-gold` $\to$ `bg-secondary hover:bg-secondary/90 text-neutral-dark font-bold`
5. **Titoli e icone primarie**: `text-medieval-gold` $\to$ `text-primary` (se usati per enfasi strutturale) o `text-secondary` (se usati per richiamare l'oro).
6. **Testi secondari**: `text-gray-400` / `text-gray-300` $\to$ `text-gray-700` / `text-gray-600` (garantendo contrasto $\ge 4.5:1$ sullo sfondo chiaro).

---

## 5. File Coinvolti nel Refactoring

Il refactoring richiederà la modifica dei seguenti file sorgente:
- **Configurazione**:
  - [tailwind.config.js](file:///Users/michele/Sites/patrician3-assistant/tailwind.config.js)
  - [src/index.css](file:///Users/michele/Sites/patrician3-assistant/src/index.css)
- **Layout**:
  - [src/layouts/DefaultLayout.tsx](file:///Users/michele/Sites/patrician3-assistant/src/layouts/DefaultLayout.tsx)
  - [src/components/layout/Header.tsx](file:///Users/michele/Sites/patrician3-assistant/src/components/layout/Header.tsx)
  - [src/components/layout/Footer.tsx](file:///Users/michele/Sites/patrician3-assistant/src/components/layout/Footer.tsx)
- **Pagine e Calcolatori**:
  - [src/pages/Home.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/Home.tsx)
  - [src/pages/calculators/Production.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/calculators/Production.tsx)
  - [src/pages/calculators/Routes.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/calculators/Routes.tsx)
  - [src/pages/calculators/Convoy.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/calculators/Convoy.tsx)
  - [src/pages/database/Towns.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/Towns.tsx)
  - [src/pages/database/Buildings.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/Buildings.tsx)
  - [src/pages/database/GoodsAndBusinesses.tsx](file:///Users/michele/Sites/patrician3-assistant/src/pages/database/GoodsAndBusinesses.tsx)
