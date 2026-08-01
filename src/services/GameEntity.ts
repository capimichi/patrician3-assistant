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
}
