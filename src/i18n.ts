import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  it: {
    translation: {
      header: {
        title: "Patrician III Assistant",
        home: "Home",
        database: "Database",
        calculators: "Calcolatori",
        goods: "Merci",
        businesses: "Imprese",
        towns: "Città",
        buildings: "Edifici",
        production: "Calcolatore Produzione",
        routes: "Ottimizzatore Rotte",
        convoy: "Gestore Convogli"
      },
      home: {
        welcome: "Benvenuto nel Patrician III Assistant",
        subtitle: "L'Impero dei Mari a portata di mano",
        desc: "Questo strumento ti aiuterà a calcolare le rotte commerciali più redditizie, simulare la produzione delle tue imprese anseatiche e gestire in maniera ottimale i tuoi convogli commerciali.",
        production_card: "Pianifica e controlla i consumi delle materie prime e la resa dei tuoi laboratori.",
        routes_card: "Ottimizza i prezzi di acquisto e vendita tra le città per massimizzare il profitto.",
        convoy_card: "Assembla la flotta ideale controllando la stiva reale, marinai e restrizioni fluviali."
      },
      common: {
        loading: "Caricamento...",
        back: "Indietro",
        select_town: "Seleziona Città",
        add: "Aggiungi",
        remove: "Rimuovi",
        profit: "Profitto",
        capacity: "Stiva",
        search_goods: "Cerca merce...",
        search_towns: "Cerca città...",
        search_businesses: "Cerca impresa...",
        no_results: "Nessun elemento trovato per"
      }
    }
  },
  en: {
    translation: {
      header: {
        title: "Patrician III Assistant",
        home: "Home",
        database: "Database",
        calculators: "Calculators",
        goods: "Goods",
        businesses: "Businesses",
        towns: "Towns",
        buildings: "Buildings",
        production: "Production Calculator",
        routes: "Route Optimizer",
        convoy: "Convoy Manager"
      },
      home: {
        welcome: "Welcome to Patrician III Assistant",
        subtitle: "The Rise of the Hanse in your hands",
        desc: "This tool will help you calculate the most profitable trade routes, simulate the production of your Hanseatic businesses, and optimally manage your commercial convoys.",
        production_card: "Plan and monitor raw material consumption and production yields of your workshops.",
        routes_card: "Optimize purchase and selling prices between cities to maximize profits.",
        convoy_card: "Assemble the ideal fleet by checking real cargo capacity, crew, and river constraints."
      },
      common: {
        loading: "Loading...",
        back: "Back",
        select_town: "Select Town",
        add: "Add",
        remove: "Remove",
        profit: "Profit",
        capacity: "Capacity",
        search_goods: "Search goods...",
        search_towns: "Search towns...",
        search_businesses: "Search business...",
        no_results: "No results found for"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'it', // lingua di default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
