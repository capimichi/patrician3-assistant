import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game } from '../services/GameEntity';
import type { GameRawState, GameConstants, TownState } from '../types/game';
import type { Town } from '../types';

interface GameContextProps {
  game: Game | null;
  isLoading: boolean;
  constants: GameConstants | null;
  createNewGame: (towns: Town[]) => Promise<void>;
  updateTown: (townId: string, updates: Partial<TownState>) => void;
  resetGame: () => void;
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

  const createNewGame = async (towns: Town[]) => {
    if (!constants) return;
    
    // Fetch businesses to map output goods to default efficiencies
    let defaultBusinesses: Record<string, { count: number; efficiency: 0 | 1 | 2 }> = {};
    try {
      const res = await fetch('/data/businesses.json');
      const businessesList = await res.json();
      businessesList.forEach((b: any) => {
        defaultBusinesses[b.id] = { count: 0, efficiency: 0 };
      });
    } catch (e) {
      console.error('Failed to pre-load businesses', e);
    }

    const townsMap: Record<string, TownState> = {};
    
    towns.forEach(t => {
      // Clone default businesses list
      const townBusinesses = JSON.parse(JSON.stringify(defaultBusinesses));
      
      Object.keys(townBusinesses).forEach(bId => {
        // Since we have t.produces (array of good IDs), let's map them
        // Let's find if any output of business bId matches t.produces
        // A simple check: does the business ID or good ID match?
        // E.g., 'brewery' produces 'beer'. We can map:
        const businessOutputGoods: Record<string, string> = {
          grain_farm: 'grain',
          brewery: 'beer',
          sawmill: 'timber',
          saltworks: 'salt',
          iron_smelter: 'pig_iron',
          workshop: 'iron_goods',
          fishery: 'fish',
          cattle_farm: 'meat', // outputs meat/leather
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

        const outputGood = businessOutputGoods[bId];
        if (outputGood && t.produces && t.produces.includes(outputGood)) {
          townBusinesses[bId].efficiency = 2; // Effective (White)
        } else {
          // Default to Inefficient (1) for basic goods like Wood/Bricks that can be built anywhere,
          // and None (0) for others.
          if (bId === 'sawmill' || bId === 'brickworks') {
            townBusinesses[bId].efficiency = 1;
          } else {
            townBusinesses[bId].efficiency = 0;
          }
        }
      });

      townsMap[t.id] = {
        townId: t.id,
        isActive: true,
        population: { rich: 0, wealthy: 0, poor: 0 },
        houses: { fachwerk: 0, giebel: 0, kaufmann: 0 },
        businesses: townBusinesses,
        logistics: {
          centralHubId: t.id,
          slowestShipType: 'crayer',
          transitHubId: 'none',
          convoySize: 0,
          convoyStops: 1,
          stockWeeks: 2
        }
      };
    });

    const newRawState: GameRawState = {
      id: `game-${Date.now()}`,
      name: 'My Campaign',
      createdAt: new Date().toISOString(),
      towns: townsMap
    };

    const newGame = new Game(newRawState, constants);
    localStorage.setItem('pii_active_game', newGame.serialize());
    setGame(newGame);
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
    <GameContext.Provider value={{ game, isLoading, constants, createNewGame, updateTown, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
