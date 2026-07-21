export interface LocalizedString {
  it: string;
  en: string;
}

export interface Good {
  id: string; // es. 'beer', 'grain'
  name: LocalizedString;
  basePrice: number; // Prezzo base di riferimento del gioco
  buyPriceRange: [number, number]; // Prezzo consigliato acquisto (es. 35-40)
  sellPriceRange: [number, number]; // Prezzo consigliato vendita (es. 44-60)
  maxSatisfactionPrice: number | null; // Prezzo max per soddisfazione cittadini
  volume: number; // Spazio di stiva occupato
  isRawMaterial: boolean;
  isImported: boolean; // Se proviene da spedizioni esterne
}

export interface BusinessInput {
  goodId: string;
  amountPerDay: number;
}

export interface Business {
  id: string; // es. 'brewery', 'workshop'
  name: LocalizedString;
  producedGoodId: string;
  baseProductionPerDay: number;
  inputs: BusinessInput[];
  constructionCost: {
    gold: number;
    bricks: number;
    timber: number;
  };
  workersNeeded: number; // Solitamente 30
  dailyMaintenance: number;
}

export interface Town {
  id: string; // es. 'lubeck', 'hamburg'
  name: string;
  isRiverTown: boolean; // Se fluviale (limita navi a Snaikka/Crayer)
  produces: string[]; // Elenco di Good IDs prodotte efficacemente
  coordinate?: {
    x: number;
    y: number;
  };
}

export interface Building {
  id: string; // es. 'wooden_house'
  name: LocalizedString;
  capacity: {
    poor: number;
    wealthy: number;
    rich: number;
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
  baseCapacity: number;
  minSailors: number;
  maxSailors: number;
  maxWeapons: number;
  isRiverFriendly: boolean;
  dailyCost: number;
}
