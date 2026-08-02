import type { GameRawState, GameConstants } from '../types/game';

export class Game {
  constructor(
    public state: GameRawState,
    public constants: GameConstants
  ) {}

  serialize(): string {
    return JSON.stringify(this.state);
  }

  static deserialize(json: string, constants: GameConstants): Game {
    const state = JSON.parse(json) as GameRawState;
    return new Game(state, constants);
  }

  getHansePopulation(): number {
    return Object.values(this.state.towns)
      .filter(t => t.isActive)
      .reduce((sum, t) => sum + t.population.rich + t.population.wealthy + t.population.poor, 0);
  }

  getHanseClassPercentages() {
    const activeTowns = Object.values(this.state.towns).filter(t => t.isActive);
    const richSum = activeTowns.reduce((sum, t) => sum + t.population.rich, 0);
    const wealthySum = activeTowns.reduce((sum, t) => sum + t.population.wealthy, 0);
    const poorSum = activeTowns.reduce((sum, t) => sum + t.population.poor, 0);
    const total = richSum + wealthySum + poorSum;

    if (total === 0) return { rich: 0, wealthy: 0, poor: 0 };
    return {
      rich: (richSum * 100) / total,
      wealthy: (wealthySum * 100) / total,
      poor: (poorSum * 100) / total
    };
  }

  getTownClassPercentages(townId: string) {
    const town = this.state.towns[townId];
    if (!town) return { rich: 0, wealthy: 0, poor: 0 };
    const total = town.population.rich + town.population.wealthy + town.population.poor;
    if (total === 0) return { rich: 0, wealthy: 0, poor: 0 };
    return {
      rich: town.population.rich / total,
      wealthy: town.population.wealthy / total,
      poor: town.population.poor / total
    };
  }

  // --- Sheet 3: Businesses & Consumption Calculations ---

  getBusinessesCount(key: string): number {
    const parts = key.split('_');
    const cat = parts[parts.length - 1]; // "e" or "i"
    
    // Reconstruct business ID: it's all parts except the last one.
    let businessId = parts.slice(0, -1).join('_');
    if (businessId.startsWith("cattle_farm_leather") || businessId.startsWith("cattle_farm_meat")) {
      businessId = "cattle_farm";
    }

    const targetEff = cat === 'e' ? 2 : 1;

    return Object.values(this.state.towns)
      .filter(t => t.isActive)
      .reduce((sum, t) => {
        const b = t.businesses[businessId];
        if (b && b.efficiency === targetEff) {
          return sum + b.count;
        }
        return sum;
      }, 0);
  }

  getBusinessesEquivalent(key: string): number {
    if (key.endsWith('_e')) {
      const effectiveCount = this.getBusinessesCount(key);
      const ineffectiveKey = key.replace('_e', '_i');
      
      const rates = this.constants.productionRates;
      if (rates && rates[ineffectiveKey] && rates[key]) {
        const ineffectiveCount = this.getBusinessesCount(ineffectiveKey);
        const effRate = rates[key].summer[3];
        const ineffRate = rates[ineffectiveKey].summer[3];
        const coeff = effRate > 0 ? ineffRate / effRate : 0.75;
        return effectiveCount + ineffectiveCount * coeff;
      }
      return effectiveCount;
    }
    return 0;
  }

  getGoodWeeklyConsumption(goodId: string, _season: 'summer' | 'winter'): number {
    return Object.keys(this.state.towns)
      .reduce((sum, townId) => sum + this.getTownGoodConsumption(townId, goodId).total, 0);
  }

  getTownGoodConsumption(townId: string, goodId: string): { population: number; industrial: number; total: number } {
    const town = this.state.towns[townId];
    if (!town || !town.isActive) return { population: 0, industrial: 0, total: 0 };

    let popCons = 0;
    if (this.constants.consumptionPer1000 && this.constants.consumptionPer1000[goodId]) {
      const rate = this.constants.consumptionPer1000[goodId];
      const totalTownPop = town.population.rich + town.population.wealthy + town.population.poor;
      if (totalTownPop > 0) {
        popCons = (town.population.rich * rate.rich + town.population.wealthy * rate.wealthy + town.population.poor * rate.poor) / 1000;
      }
    }

    let indCons = 0;
    const rates = this.constants.productionRates;
    
    if (rates) {
      const keyInputs: Record<string, { rm1?: string; rm2?: string }> = {
        brewery_e: { rm1: 'grain', rm2: 'timber' },
        fishery_e: { rm1: 'salt', rm2: 'hemp' },
        fishery_i: { rm1: 'salt', rm2: 'hemp' },
        hunting_lodge_e: { rm1: 'iron_goods', rm2: 'wine' },
        hunting_lodge_i: { rm1: 'iron_goods', rm2: 'wine' },
        pitchmaker_e: { rm1: 'timber' },
        saltworks_e: { rm1: 'timber' },
        pottery_workshop_e: { rm1: 'timber' },
        pottery_workshop_i: { rm1: 'timber' },
        cattle_farm_leather_e: { rm1: 'timber', rm2: 'grain' },
        cattle_farm_leather_i: { rm1: 'timber', rm2: 'grain' },
        weaving_mill_e: { rm1: 'wool' },
        workshop_e: { rm1: 'pig_iron', rm2: 'timber' },
        brickworks_e: { rm1: 'timber' },
        brickworks_i: { rm1: 'timber' }
      };

      Object.entries(town.businesses).forEach(([bId, bState]) => {
        if (bState.count > 0 && bState.efficiency > 0) {
          let keysToCheck: string[] = [];
          if (bId === 'cattle_farm') {
            keysToCheck = [bState.efficiency === 2 ? 'cattle_farm_leather_e' : 'cattle_farm_leather_i'];
          } else {
            keysToCheck = [bId + (bState.efficiency === 2 ? '_e' : '_i')];
          }

          keysToCheck.forEach(k => {
            const inputs = keyInputs[k];
            if (inputs && rates[k]) {
              const count = bState.count;
              let tier = 0;
              if (count >= 9) tier = 3;
              else if (count >= 6) tier = 2;
              else if (count >= 3) tier = 1;

              if (inputs.rm1 === goodId) {
                const rate = rates[k].rm1[tier];
                indCons += count * rate;
              }
              if (inputs.rm2 === goodId) {
                const rate = rates[k].rm2[tier];
                indCons += count * rate;
              }
            }
          });
        }
      });
    }

    return {
      population: popCons,
      industrial: indCons,
      total: popCons + indCons
    };
  }

  getTownGoodProduction(townId: string, goodId: string, season: 'summer' | 'winter'): number {
    const town = this.state.towns[townId];
    if (!town || !town.isActive) return 0;
    
    const rates = this.constants.productionRates;
    if (!rates) return 0;

    const goodProducers: Record<string, string[]> = {
      beer: ['brewery_e'],
      pig_iron: ['iron_smelter_e', 'iron_smelter_i'],
      fish: ['fishery_e', 'fishery_i'],
      whale_oil: ['whale_fishery_e'],
      grain: ['grain_farm_e', 'grain_farm_i'],
      hemp: ['hemp_farm_e', 'hemp_farm_i'],
      honey: ['apiary_e', 'apiary_i'],
      skins: ['hunting_lodge_e', 'hunting_lodge_i'],
      pitch: ['pitchmaker_e'],
      timber: ['sawmill_e', 'sawmill_i'],
      wool: ['sheep_farm_e', 'sheep_farm_i'],
      salt: ['saltworks_e'],
      pottery: ['pottery_workshop_e', 'pottery_workshop_i'],
      leather: ['cattle_farm_leather_e', 'cattle_farm_leather_i'],
      meat: ['cattle_farm_meat_e', 'cattle_farm_meat_i'],
      cloth: ['weaving_mill_e'],
      wine: ['vineyard_e', 'vineyard_i'],
      iron_goods: ['workshop_e'],
      bricks: ['brickworks_e', 'brickworks_i']
    };

    const producers = goodProducers[goodId];
    if (!producers) return 0;

    let prod = 0;
    producers.forEach(k => {
      const parts = k.split('_');
      const cat = parts[parts.length - 1]; // "e" or "i"
      
      let businessId = parts.slice(0, -1).join('_');
      if (businessId.startsWith("cattle_farm_leather") || businessId.startsWith("cattle_farm_meat")) {
        businessId = "cattle_farm";
      }

      const targetEff = cat === 'e' ? 2 : 1;
      const bState = town.businesses[businessId];
      
      if (bState && bState.count > 0 && bState.efficiency === targetEff) {
        if (rates[k]) {
          const count = bState.count;
          let tier = 0;
          if (count >= 9) tier = 3;
          else if (count >= 6) tier = 2;
          else if (count >= 3) tier = 1;

          const rate = season === 'summer' ? rates[k].summer[tier] : rates[k].winter[tier];
          prod += count * rate;
        }
      }
    });

    return prod;
  }

  getTheoreticalRequiredBusinesses(key: string, season: 'summer' | 'winter'): number {
    const rates = this.constants.productionRates;
    if (!rates || !rates[key]) return 0;
    
    const goodMapping: Record<string, string> = {
      brewery_e: 'beer',
      iron_smelter_e: 'pig_iron',
      iron_smelter_i: 'pig_iron',
      fishery_e: 'fish',
      fishery_i: 'fish',
      whale_fishery_e: 'whale_oil',
      grain_farm_e: 'grain',
      grain_farm_i: 'grain',
      hemp_farm_e: 'hemp',
      hemp_farm_i: 'hemp',
      apiary_e: 'honey',
      apiary_i: 'honey',
      hunting_lodge_e: 'skins',
      hunting_lodge_i: 'skins',
      pitchmaker_e: 'pitch',
      sawmill_e: 'timber',
      sawmill_i: 'timber',
      sheep_farm_e: 'wool',
      sheep_farm_i: 'wool',
      saltworks_e: 'salt',
      pottery_workshop_e: 'pottery',
      pottery_workshop_i: 'pottery',
      cattle_farm_leather_e: 'leather',
      cattle_farm_leather_i: 'leather',
      cattle_farm_meat_e: 'meat',
      cattle_farm_meat_i: 'meat',
      weaving_mill_e: 'cloth',
      vineyard_e: 'wine',
      vineyard_i: 'wine',
      workshop_e: 'iron_goods',
      brickworks_e: 'bricks',
      brickworks_i: 'bricks'
    };

    const goodId = goodMapping[key];
    if (!goodId) return 0;

    const totalCons = this.getGoodWeeklyConsumption(goodId, season);
    const effectiveKey = key.replace('_i', '_e');
    if (!rates[effectiveKey]) return 0;
    
    const prodRate = season === 'summer' ? rates[effectiveKey].summer[3] : rates[effectiveKey].winter[3];
    
    return prodRate > 0 ? Math.ceil(totalCons / prodRate) : 0;
  }

  // --- Sheet 4: Housing Stats and Growth Planner ---

  getTownHousingSummary(townId: string) {
    const town = this.state.towns[townId];
    if (!town) return null;
    
    const targetFwh = Math.ceil(town.population.poor / 280);
    const targetGh = Math.ceil(town.population.wealthy / 140);
    const targetKmh = Math.ceil(town.population.rich / 80);

    return {
      fachwerk: {
        target: targetFwh,
        actual: town.houses.fachwerk,
        balance: town.houses.fachwerk - targetFwh
      },
      giebel: {
        target: targetGh,
        actual: town.houses.giebel,
        balance: town.houses.giebel - targetGh
      },
      kaufmann: {
        target: targetKmh,
        actual: town.houses.kaufmann,
        balance: town.houses.kaufmann - targetKmh
      }
    };
  }

  getTownHousingProjection(townId: string, targetPopulation: number) {
    const town = this.state.towns[townId];
    if (!town) return null;
    
    const totalPop = town.population.rich + town.population.wealthy + town.population.poor;
    if (totalPop === 0) return null;

    const shares = {
      rich: town.population.rich / totalPop,
      wealthy: town.population.wealthy / totalPop,
      poor: town.population.poor / totalPop
    };

    const capMap = {
      poor: 280,
      wealthy: 140,
      rich: 80
    };

    const currentSupplies = {
      poor: town.houses.fachwerk,
      wealthy: town.houses.giebel,
      rich: town.houses.kaufmann
    };

    const classes: ('rich' | 'wealthy' | 'poor')[] = ['poor', 'wealthy', 'rich'];

    return classes.map(cId => {
      const percentage = shares[cId] * 100;
      const projectedPop = targetPopulation * shares[cId];
      const projectedNeeded = Math.ceil(projectedPop / capMap[cId]);
      const currentSupply = currentSupplies[cId];
      const toBuild = Math.max(0, projectedNeeded - currentSupply);

      return {
        classId: cId,
        percentage,
        projectedPop,
        projectedNeeded,
        currentSupply,
        toBuild
      };
    });
  }
}
