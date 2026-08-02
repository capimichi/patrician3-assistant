import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import UninitializedWarning from '../../components/UninitializedWarning';
import type { Town } from '../../types';
import { useTranslation } from 'react-i18next';
import { Home, ArrowUpRight, BarChart3, TrendingUp, Info } from 'lucide-react';

const Housing: React.FC = () => {
  const { game } = useGame();
  const { townService } = useServices();
  const { t, i18n } = useTranslation();

  const [towns, setTowns] = useState<Town[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');
  const [targetPopInput, setTargetPopInput] = useState<string>('');

  const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

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

  // Auto-select first active town if none selected
  if (activeTowns.length > 0 && !selectedTownId) {
    setSelectedTownId(activeTowns[0].id);
  }

  const selectedTownState = selectedTownId ? game.state.towns[selectedTownId] : null;
  const currentTotalPop = selectedTownState
    ? selectedTownState.population.rich + selectedTownState.population.wealthy + selectedTownState.population.poor
    : 0;

  // Sync target pop input when selected town changes
  const handleSelectTown = (townId: string) => {
    setSelectedTownId(townId);
    const tState = game.state.towns[townId];
    if (tState) {
      const cPop = tState.population.rich + tState.population.wealthy + tState.population.poor;
      setTargetPopInput(String(cPop + 2000));
    }
  };

  // If input is empty, default to current pop + 2000
  const targetPopulation = parseInt(targetPopInput) || (currentTotalPop + 2000);

  const projectionRows = selectedTownId ? game.getTownHousingProjection(selectedTownId, targetPopulation) : null;
  const selectedTownName = towns.find(tData => tData.id === selectedTownId)?.name || '';

  const classLabels: Record<string, string> = {
    poor: t('dashboard.class_poor'),
    wealthy: t('dashboard.class_wealthy'),
    rich: t('dashboard.class_rich')
  };

  const classCapacities: Record<string, number> = {
    poor: 280,
    wealthy: 140,
    rich: 80
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-dark">{t('dashboard.housing_title')}</h1>
        <p className="text-sm text-neutral-medium mt-1">
          {t('dashboard.housing_desc')}
        </p>
      </div>

      {activeTowns.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm">
          {t('dashboard.no_towns_added')}
        </div>
      ) : (
        <>
          {/* Main League Housing Table */}
          <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
            <div className="p-4 bg-neutral-light/20 border-b border-neutral-light font-bold text-neutral-dark text-sm flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>{lang === 'it' ? 'Riepilogo Abitazioni della Lega' : 'League Housing Summary'}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-light/50 font-semibold border-b border-neutral-light text-neutral-dark uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 border-r border-neutral-light" rowSpan={2}>{t('dashboard.col_town')}</th>
                    <th className="p-2 border-r border-neutral-light text-center bg-blue-50/10" colSpan={3}>{t('dashboard.class_poor')} (FWH)</th>
                    <th className="p-2 border-r border-neutral-light text-center bg-indigo-50/10" colSpan={3}>{t('dashboard.class_wealthy')} (GH)</th>
                    <th className="p-2 text-center bg-purple-50/10" colSpan={3}>{t('dashboard.class_rich')} (KMH)</th>
                  </tr>
                  <tr className="border-t border-neutral-light bg-neutral-light/20">
                    {/* FWH */}
                    <th className="p-2 text-right text-neutral-medium font-normal border-r border-neutral-light">{t('dashboard.col_target')}</th>
                    <th className="p-2 text-right text-neutral-medium font-normal border-r border-neutral-light">{t('dashboard.col_actual')}</th>
                    <th className="p-2 text-right text-neutral-medium font-normal border-r border-neutral-light">{t('dashboard.col_balance')}</th>
                    {/* GH */}
                    <th className="p-2 text-right text-neutral-medium font-normal border-r border-neutral-light">{t('dashboard.col_target')}</th>
                    <th className="p-2 text-right text-neutral-medium font-normal border-r border-neutral-light">{t('dashboard.col_actual')}</th>
                    <th className="p-2 text-right text-neutral-medium font-normal border-r border-neutral-light">{t('dashboard.col_balance')}</th>
                    {/* KMH */}
                    <th className="p-2 text-right text-neutral-medium font-normal border-r border-neutral-light">{t('dashboard.col_target')}</th>
                    <th className="p-2 text-right text-neutral-medium font-normal border-r border-neutral-light">{t('dashboard.col_actual')}</th>
                    <th className="p-2 text-right text-neutral-medium font-normal">{t('dashboard.col_balance')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTowns.map(town => {
                    const stats = game.getTownHousingSummary(town.id);
                    if (!stats) return null;

                    const renderBalanceBadge = (bal: number) => (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        bal > 0 
                          ? 'bg-green-100 text-green-800' 
                          : bal < 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-neutral-light text-neutral-dark border border-neutral-medium/25'
                      }`}>
                        {bal > 0 ? '+' : ''}{bal}
                      </span>
                    );

                    return (
                      <tr key={town.id} className="border-b border-neutral-light hover:bg-neutral-light/5 text-neutral-dark font-medium">
                        <td className="p-3 border-r border-neutral-light font-bold text-neutral-dark text-sm bg-neutral-light/5">{town.name}</td>
                        {/* FWH */}
                        <td className="p-2 text-right border-r border-neutral-light text-neutral-medium">{stats.fachwerk.target}</td>
                        <td className="p-2 text-right border-r border-neutral-light">{stats.fachwerk.actual}</td>
                        <td className="p-2 text-right border-r border-neutral-light">{renderBalanceBadge(stats.fachwerk.balance)}</td>
                        {/* GH */}
                        <td className="p-2 text-right border-r border-neutral-light text-neutral-medium">{stats.giebel.target}</td>
                        <td className="p-2 text-right border-r border-neutral-light">{stats.giebel.actual}</td>
                        <td className="p-2 text-right border-r border-neutral-light">{renderBalanceBadge(stats.giebel.balance)}</td>
                        {/* KMH */}
                        <td className="p-2 text-right border-r border-neutral-light text-neutral-medium">{stats.kaufmann.target}</td>
                        <td className="p-2 text-right border-r border-neutral-light">{stats.kaufmann.actual}</td>
                        <td className="p-2 text-right">{renderBalanceBadge(stats.kaufmann.balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-neutral-light/20 text-[11px] text-neutral-medium flex items-start space-x-2 border-t border-neutral-light">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>
                  Le capienze massime per ciascun tipo di abitazione sono fisse: <strong>Case Popolari (Graticcio) = 280</strong> residenti, <strong>Case Medie (Timpano) = 140</strong> residenti, <strong>Case Signorili (Kaufmann) = 80</strong> residenti.
                </p>
                <p>
                  Un bilancio negativo indica un deficit abitativo. I cittadini senza alloggio non possono trasferirsi stabilmente, bloccando l'afflusso di manodopera per i tuoi laboratori.
                </p>
              </div>
            </div>
          </div>

          {/* Target Growth Planner Section */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-neutral-light pb-3">
              <TrendingUp className="h-5 w-5 text-primary shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-neutral-dark">{t('dashboard.growth_planner')}</h2>
                <p className="text-xs text-neutral-medium mt-0.5">{t('dashboard.growth_planner_desc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Settings Controls */}
              <div className="space-y-4 bg-neutral-light/20 p-5 rounded-lg border border-neutral-light">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1.5">{t('dashboard.select_town')}</label>
                  <select
                    value={selectedTownId}
                    onChange={(e) => handleSelectTown(e.target.value)}
                    className="w-full p-2 border border-neutral-medium rounded text-sm bg-white font-semibold text-neutral-dark"
                  >
                    {activeTowns.map(town => (
                      <option key={town.id} value={town.id}>{town.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-dark mb-1.5">
                    <span>{t('dashboard.target_pop')}</span>
                    <span className="text-neutral-medium font-normal">
                      ({t('dashboard.current_pop')}: {currentTotalPop.toLocaleString()})
                    </span>
                  </div>
                  <input
                    type="number"
                    min={currentTotalPop}
                    value={targetPopInput}
                    placeholder={String(currentTotalPop + 2000)}
                    onChange={(e) => setTargetPopInput(e.target.value)}
                    className="w-full p-2 border border-neutral-medium rounded text-sm font-bold text-neutral-dark"
                  />
                </div>
              </div>

              {/* Table / Results Grid */}
              <div className="md:col-span-2 space-y-4">
                <div className="overflow-hidden border border-neutral-light rounded-lg">
                  <table className="min-w-full text-left text-xs border-collapse">
                    <thead className="bg-neutral-light text-neutral-dark font-semibold border-b border-neutral-light">
                      <tr>
                        <th className="p-3">{lang === 'it' ? 'Ceto / Tipo Casa' : 'Class / House Type'}</th>
                        <th className="p-3 text-right">{t('dashboard.pop_share')}</th>
                        <th className="p-3 text-right">{t('dashboard.projected_pop')}</th>
                        <th className="p-3 text-right">{t('dashboard.projected_needed')}</th>
                        <th className="p-3 text-right">{t('dashboard.current_supply')}</th>
                        <th className="p-3 text-right font-bold text-primary">{t('dashboard.new_houses_to_build')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectionRows && projectionRows.map(row => (
                        <tr key={row.classId} className="border-b border-neutral-light last:border-0 hover:bg-neutral-light/5 font-medium text-neutral-dark">
                          <td className="p-3 font-semibold flex items-center space-x-1.5">
                            <Home className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{classLabels[row.classId]}</span>
                            <span className="text-[10px] text-neutral-medium font-normal">({lang === 'it' ? 'Cap.' : 'Cap.'} {classCapacities[row.classId]})</span>
                          </td>
                          <td className="p-3 text-right text-neutral-medium">{row.percentage.toFixed(1)}%</td>
                          <td className="p-3 text-right">{Math.round(row.projectedPop).toLocaleString()}</td>
                          <td className="p-3 text-right">{row.projectedNeeded}</td>
                          <td className="p-3 text-right text-neutral-medium">{row.currentSupply}</td>
                          <td className="p-3 text-right font-bold text-sm">
                            {row.toBuild > 0 ? (
                              <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                +{row.toBuild}
                              </span>
                            ) : (
                              <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                0
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Construction Warning Summary Banner */}
                {projectionRows && (
                  <div className="p-4 rounded-lg border flex items-start space-x-3 bg-neutral-light/10 border-neutral-light">
                    <ArrowUpRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-dark uppercase tracking-wide">
                        {lang === 'it' ? `Piano di Espansione per ${selectedTownName}` : `Expansion Plan for ${selectedTownName}`}
                      </h4>
                      <p className="text-xs text-neutral-medium mt-1">
                        {projectionRows.some(r => r.toBuild > 0) ? (
                          <span>
                            {lang === 'it' 
                              ? `Per sostenere una popolazione di ${targetPopulation.toLocaleString()} abitanti, a ${selectedTownName} dovrai edificare: ` 
                              : `To sustain a target population of ${targetPopulation.toLocaleString()} citizens in ${selectedTownName}, you need to construct: `}
                            <strong className="text-neutral-dark">
                              {projectionRows
                                .filter(r => r.toBuild > 0)
                                .map(r => `${r.toBuild}x ${classLabels[r.classId]}`)
                                .join(', ')}
                            </strong>.
                          </span>
                        ) : (
                          t('dashboard.no_houses_needed')
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Housing;
