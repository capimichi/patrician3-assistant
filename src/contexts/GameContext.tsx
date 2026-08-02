import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game } from '../services/GameEntity';
import type { GameRawState, GameConstants, TownState } from '../types/game';
import type { Town } from '../types';

interface GameContextProps {
  game: Game | null;
  isLoading: boolean;
  constants: GameConstants | null;
  createNewGame: (towns?: Town[]) => Promise<void>;
  updateTown: (townId: string, updates: Partial<TownState>) => void;
  resetGame: () => void;
  addTown: (town: Town) => Promise<void>;
  removeTown: (townId: string) => void;
}

const GameContext = createContext<GameContextProps | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [constants, setConstants] = useState<GameConstants | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const res = await fetch('/data/pii_constants.json');
        const piiConstants = await res.json() as GameConstants;
        
        try {
          const ratesRes = await fetch('/data/production_rates.json');
          const piiRates = await ratesRes.json();
          piiConstants.productionRates = piiRates;
        } catch (err) {
          console.error('Error loading production rates from JSON', err);
        }

        try {
          const timesRes = await fetch('/data/travel_times.json');
          const piiTimes = await timesRes.json();
          piiConstants.travelTimes = piiTimes;
        } catch (err) {
          console.error('Error loading travel times from JSON', err);
        }
        
        setConstants(piiConstants);

        const stored = localStorage.getItem('pii_active_game');
        if (stored) {
          setGame(Game.deserialize(stored, piiConstants));
        }
      } catch (e) {
        console.error('Error loading game setup', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, []);

  const createNewGame = async (_towns?: Town[]) => {
    if (!constants) return;
    
    // New games start with an empty map of towns
    const newRawState: GameRawState = {
      id: `game-${Date.now()}`,
      name: 'My Campaign',
      createdAt: new Date().toISOString(),
      towns: {}
    };

    const newGame = new Game(newRawState, constants);
    localStorage.setItem('pii_active_game', newGame.serialize());
    setGame(newGame);
  };

  const addTown = async (town: Town) => {
    if (!game || !constants) return;

    // Load default businesses from reference data
    const townBusinesses: Record<string, { count: number; efficiency: 0 | 1 | 2 }> = {};
    try {
      const res = await fetch('/data/businesses.json');
      const businessesList = await res.json();
      businessesList.forEach((b: any) => {
        townBusinesses[b.id] = { count: 0, efficiency: 0 };
      });
      
      const businessOutputGoods: Record<string, string> = {
        grain_farm: 'grain',
        brewery: 'beer',
        sawmill: 'timber',
        saltworks: 'salt',
        iron_smelter: 'pig_iron',
        workshop: 'iron_goods',
        fishery: 'fish',
        cattle_farm: 'meat',
        sheep_farm: 'wool',
        brickworks: 'bricks',
        pitchmaker: 'pitch',
        apiary: 'honey',
        weaving_mill: 'cloth',
        vineyard: 'wine',
        hunting_lodge: 'skins',
        pottery_workshop: 'pottery',
        whale_fishery: 'whale_oil',
        hemp_farm: 'hemp'
      };

      Object.keys(townBusinesses).forEach(bId => {
        const outputGood = businessOutputGoods[bId];
        if (outputGood && town.produces && town.produces.includes(outputGood)) {
          townBusinesses[bId].efficiency = 2; // Effective (White)
        } else {
          if (bId === 'sawmill' || bId === 'brickworks') {
            townBusinesses[bId].efficiency = 1; // Ineffective (Yellow)
          } else {
            townBusinesses[bId].efficiency = 0; // None (Green)
          }
        }
      });
    } catch (e) {
      console.error('Failed to load businesses for town initialization', e);
    }

    const newTownState: TownState = {
      townId: town.id,
      isActive: true,
      population: { rich: 0, wealthy: 0, poor: 0 },
      houses: { fachwerk: 0, giebel: 0, kaufmann: 0 },
      businesses: townBusinesses,
      logistics: {
        centralHubId: town.id,
        slowestShipType: 'crayer',
        transitHubId: 'none',
        convoySize: 0,
        convoyStops: 1,
        stockWeeks: 2
      }
    };

    const updatedTowns = {
      ...game.state.towns,
      [town.id]: newTownState
    };

    const updatedRawState: GameRawState = {
      ...game.state,
      towns: updatedTowns
    };

    const updatedGame = new Game(updatedRawState, constants);
    localStorage.setItem('pii_active_game', updatedGame.serialize());
    setGame(updatedGame);
  };

  const removeTown = (townId: string) => {
    if (!game || !constants) return;

    const { [townId]: _, ...remainingTowns } = game.state.towns;

    const updatedRawState: GameRawState = {
      ...game.state,
      towns: remainingTowns
    };

    const updatedGame = new Game(updatedRawState, constants);
    localStorage.setItem('pii_active_game', updatedGame.serialize());
    setGame(updatedGame);
  };

  const updateTown = (townId: string, updates: Partial<TownState>) => {
    if (!game || !constants) return;
    
    const updatedTowns = {
      ...game.state.towns,
      [townId]: {
        ...game.state.towns[townId],
        ...updates
      }
    };

    const updatedRawState: GameRawState = {
      ...game.state,
      towns: updatedTowns
    };

    const updatedGame = new Game(updatedRawState, constants);
    localStorage.setItem('pii_active_game', updatedGame.serialize());
    setGame(updatedGame);
  };

  const resetGame = () => {
    localStorage.removeItem('pii_active_game');
    setGame(null);
  };

  return (
    <GameContext.Provider value={{ game, isLoading, constants, createNewGame, updateTown, resetGame, addTown, removeTown }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
