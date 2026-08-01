import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import UninitializedWarning from '../../components/UninitializedWarning';
import type { Town } from '../../types';

const Population: React.FC = () => {
  const { game } = useGame();
  const { townService } = useServices();
  const [towns, setTowns] = useState<Town[]>([]);

  useEffect(() => {
    townService.getTowns().then(setTowns);
  }, [townService]);

  if (!game) {
    return <UninitializedWarning />;
  }

  const activeTowns = towns.filter(town => {
    const townState = game.state.towns[town.id];
    return townState && townState.isActive;
  });

  const totalHanse = game.getHansePopulation();
  const globalPercentages = game.getHanseClassPercentages();

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded border border-neutral-light shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-dark">Population Demographics / Popolazione</h1>
        <p className="text-xs text-neutral-medium mt-1">Suddivisione sociale degli abitanti della Lega (mendicanti esclusi).</p>
      </div>

      <div className="bg-white rounded border border-neutral-light shadow-sm overflow-x-auto">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead className="bg-neutral-light text-neutral-dark font-semibold border-b border-neutral-light">
            <tr>
              <th className="p-3 border-r border-neutral-light">City / Città</th>
              <th className="p-3 border-r border-neutral-light text-right">Poor / Poveri</th>
              <th className="p-3 border-r border-neutral-light text-right">Wealthy / Benestanti</th>
              <th className="p-3 border-r border-neutral-light text-right">Rich / Ricchi</th>
              <th className="p-3 text-right">Total / Totale</th>
            </tr>
          </thead>
          <tbody>
            {activeTowns.map(town => {
              const state = game.state.towns[town.id];
              const total = state.population.poor + state.population.wealthy + state.population.rich;
              const ratios = game.getTownClassPercentages(town.id);

              return (
                <tr key={town.id} className="border-b border-neutral-light hover:bg-neutral-light/10">
                  <td className="p-3 border-r border-neutral-light font-medium text-neutral-dark">{town.name}</td>
                  <td className="p-3 border-r border-neutral-light text-right">
                    <span className="font-semibold">{state.population.poor}</span>
                    <span className="text-xs text-neutral-medium ml-2">({(ratios.poor * 100).toFixed(1)}%)</span>
                  </td>
                  <td className="p-3 border-r border-neutral-light text-right">
                    <span className="font-semibold">{state.population.wealthy}</span>
                    <span className="text-xs text-neutral-medium ml-2">({(ratios.wealthy * 100).toFixed(1)}%)</span>
                  </td>
                  <td className="p-3 border-r border-neutral-light text-right">
                    <span className="font-semibold">{state.population.rich}</span>
                    <span className="text-xs text-neutral-medium ml-2">({(ratios.rich * 100).toFixed(1)}%)</span>
                  </td>
                  <td className="p-3 text-right font-bold text-neutral-dark">{total}</td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="bg-neutral-light/50 font-bold border-t border-neutral-medium text-neutral-dark">
              <td className="p-3 border-r border-neutral-light">Lega Anseatica (Sum)</td>
              <td className="p-3 border-r border-neutral-light text-right text-neutral-dark">
                {Object.values(game.state.towns).filter(t => t.isActive).reduce((s, t) => s + t.population.poor, 0)}
                <span className="text-xs text-neutral-medium ml-2">({globalPercentages.poor.toFixed(1)}%)</span>
              </td>
              <td className="p-3 border-r border-neutral-light text-right text-neutral-dark">
                {Object.values(game.state.towns).filter(t => t.isActive).reduce((s, t) => s + t.population.wealthy, 0)}
                <span className="text-xs text-neutral-medium ml-2">({globalPercentages.wealthy.toFixed(1)}%)</span>
              </td>
              <td className="p-3 border-r border-neutral-light text-right text-neutral-dark">
                {Object.values(game.state.towns).filter(t => t.isActive).reduce((s, t) => s + t.population.rich, 0)}
                <span className="text-xs text-neutral-medium ml-2">({globalPercentages.rich.toFixed(1)}%)</span>
              </td>
              <td className="p-3 text-right text-lg text-primary">{totalHanse}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Population;
