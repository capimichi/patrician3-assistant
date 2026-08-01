export interface TownState {
  townId: string;
  isActive: boolean;
  population: {
    rich: number;
    wealthy: number;
    poor: number;
  };
  houses: {
    fachwerk: number;
    giebel: number;
    kaufmann: number;
  };
  businesses: Record<string, {
    count: number;
    efficiency: 0 | 1 | 2; // 0 = None, 1 = Inefficient, 2 = Effective
  }>;
  logistics: {
    centralHubId: string;
    slowestShipType: string;
    transitHubId: string;
    convoySize: number;
    convoyStops: number;
    stockWeeks: number;
  };
}

export interface GameRawState {
  id: string;
  name: string;
  createdAt: string;
  towns: Record<string, TownState>;
}

export interface GameConstants {
  consumptionPer1000: Record<string, { rich: number; wealthy: number; poor: number }>;
  shipSpeedModifiers: Record<string, number>;
  loadingPenaltyPerStopDays: number;
}
