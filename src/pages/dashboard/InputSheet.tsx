import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import type { Town } from '../../types';
import type { LocalizedBusiness } from '../../services/BusinessService';
import type { LocalizedShipType } from '../../services/ShipService';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';

const InputSheet: React.FC = () => {
  const { game, createNewGame, updateTown } = useGame();
  const { townService, shipService, businessService } = useServices();
  const { t, i18n } = useTranslation();
  
  const [towns, setTowns] = useState<Town[]>([]);
  const [ships, setShips] = useState<LocalizedShipType[]>([]);
  const [businesses, setBusinesses] = useState<LocalizedBusiness[]>([]);
  const [hideInactive, setHideInactive] = useState(false);
  const [expandedTownId, setExpandedTownId] = useState<string | null>(null);

  const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

  useEffect(() => {
    const loadRefs = async () => {
      const tData = await townService.getTowns();
      const sData = await shipService.getShips(lang);
      const bData = await businessService.getBusinesses(lang);
      setTowns(tData);
      setShips(sData);
      setBusinesses(bData);
    };
    loadRefs();
  }, [townService, shipService, businessService, lang]);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded border border-neutral-light shadow-sm text-center max-w-xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-neutral-dark mb-4">{t('dashboard.welcome_title')}</h2>
        <p className="text-neutral-medium mb-6 text-sm">
          {t('dashboard.welcome_desc')}
        </p>
        <button
          onClick={async () => {
            const tData = await townService.getTowns();
            await createNewGame(tData);
          }}
          className="bg-primary text-white font-medium py-2.5 px-6 rounded hover:bg-primary-dark shadow-sm transition-colors cursor-pointer"
        >
          {t('dashboard.welcome_btn')}
        </button>
      </div>
    );
  }

  const toggleExpandTown = (townId: string) => {
    if (expandedTownId === townId) {
      setExpandedTownId(null);
    } else {
      setExpandedTownId(townId);
    }
  };

  const handleCycleEfficiency = (townId: string, bId: string, currentEff: number) => {
    const townState = game.state.towns[townId];
    if (!townState) return;

    const nextEff = ((currentEff + 1) % 3) as 0 | 1 | 2;
    const currentBusinessData = townState.businesses[bId] || { count: 0, efficiency: 0 };
    
    updateTown(townId, {
      businesses: {
        ...townState.businesses,
        [bId]: {
          count: nextEff === 0 ? 0 : currentBusinessData.count,
          efficiency: nextEff
        }
      }
    });
  };

  const handleBusinessCountChange = (townId: string, bId: string, count: number) => {
    const townState = game.state.towns[townId];
    if (!townState) return;

    const currentBusinessData = townState.businesses[bId] || { count: 0, efficiency: 0 };
    updateTown(townId, {
      businesses: {
        ...townState.businesses,
        [bId]: {
          ...currentBusinessData,
          count: count >= 0 ? count : 0
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded border border-neutral-light shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">{t('dashboard.input_sheet_title')}</h1>
          <p className="text-xs text-neutral-medium mt-1">
            {t('dashboard.input_sheet_desc')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hideInactive"
            checked={hideInactive}
            onChange={(e) => setHideInactive(e.target.checked)}
            className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
          />
          <label htmlFor="hideInactive" className="text-sm font-semibold text-neutral-dark select-none cursor-pointer">
            {t('dashboard.hide_inactive')}
          </label>
        </div>
      </div>

      <div className="bg-white rounded border border-neutral-light shadow-sm overflow-x-auto">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead className="bg-neutral-light text-neutral-dark border-b border-neutral-light sticky top-0">
            <tr>
              <th className="p-3 font-semibold border-r border-neutral-light w-48">{t('dashboard.city')}</th>
              <th className="p-3 font-semibold border-r border-neutral-light text-center" colSpan={3}>{t('dashboard.population')}</th>
              <th className="p-3 font-semibold border-r border-neutral-light text-center" colSpan={3}>{t('dashboard.housing')}</th>
              <th className="p-3 font-semibold text-center">{t('dashboard.logistics')}</th>
              <th className="p-3 font-semibold text-center w-28">{t('dashboard.businesses')}</th>
            </tr>
            <tr className="bg-neutral-light/50 text-xs border-b border-neutral-light">
              <th className="p-2 border-r border-neutral-light">{t('dashboard.city')}</th>
              <th className="p-2 border-r border-neutral-light text-center w-20">{t('dashboard.poor')}</th>
              <th className="p-2 border-r border-neutral-light text-center w-20">{t('dashboard.wealthy')}</th>
              <th className="p-2 border-r border-neutral-light text-center w-20">{t('dashboard.rich')}</th>
              <th className="p-2 border-r border-neutral-light text-center w-16">{t('dashboard.fwh')}</th>
              <th className="p-2 border-r border-neutral-light text-center w-16">{t('dashboard.gh')}</th>
              <th className="p-2 border-r border-neutral-light text-center w-16">{t('dashboard.kmh')}</th>
              <th className="p-2 text-center">
                {t('dashboard.hub')} | {t('dashboard.stops')} | {t('dashboard.ship')} | {t('dashboard.weeks')}
              </th>
              <th className="p-2 text-center">{t('dashboard.businesses')}</th>
            </tr>
          </thead>
          <tbody>
            {towns.map(town => {
              const townState = game.state.towns[town.id];
              if (!townState) return null;
              if (hideInactive && !townState.isActive) return null;

              const isExpanded = expandedTownId === town.id;

              return (
                <React.Fragment key={town.id}>
                  {/* City main row */}
                  <tr className={`border-b border-neutral-light hover:bg-neutral-light/20 ${!townState.isActive ? 'opacity-50 bg-neutral-light/10' : ''}`}>
                    <td className="p-2.5 border-r border-neutral-light flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={townState.isActive}
                        onChange={(e) => updateTown(town.id, { isActive: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                      <span className="font-semibold text-neutral-dark">{town.name}</span>
                    </td>

                    {/* Population counts */}
                    <td className="p-2.5 border-r border-neutral-light text-center">
                      <input
                        type="number"
                        min="0"
                        disabled={!townState.isActive}
                        value={townState.population.poor}
                        onChange={(e) => updateTown(town.id, {
                          population: { ...townState.population, poor: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full max-w-[70px] p-1 border border-neutral-medium rounded text-xs text-right"
                      />
                    </td>
                    <td className="p-2.5 border-r border-neutral-light text-center">
                      <input
                        type="number"
                        min="0"
                        disabled={!townState.isActive}
                        value={townState.population.wealthy}
                        onChange={(e) => updateTown(town.id, {
                          population: { ...townState.population, wealthy: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full max-w-[70px] p-1 border border-neutral-medium rounded text-xs text-right"
                      />
                    </td>
                    <td className="p-2.5 border-r border-neutral-light text-center">
                      <input
                        type="number"
                        min="0"
                        disabled={!townState.isActive}
                        value={townState.population.rich}
                        onChange={(e) => updateTown(town.id, {
                          population: { ...townState.population, rich: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full max-w-[70px] p-1 border border-neutral-medium rounded text-xs text-right"
                      />
                    </td>

                    {/* Housing counts */}
                    <td className="p-2.5 border-r border-neutral-light text-center">
                      <input
                        type="number"
                        min="0"
                        disabled={!townState.isActive}
                        value={townState.houses.fachwerk}
                        onChange={(e) => updateTown(town.id, {
                          houses: { ...townState.houses, fachwerk: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full max-w-[60px] p-1 border border-neutral-medium rounded text-xs text-right"
                      />
                    </td>
                    <td className="p-2.5 border-r border-neutral-light text-center">
                      <input
                        type="number"
                        min="0"
                        disabled={!townState.isActive}
                        value={townState.houses.giebel}
                        onChange={(e) => updateTown(town.id, {
                          houses: { ...townState.houses, giebel: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full max-w-[60px] p-1 border border-neutral-medium rounded text-xs text-right"
                      />
                    </td>
                    <td className="p-2.5 border-r border-neutral-light text-center">
                      <input
                        type="number"
                        min="0"
                        disabled={!townState.isActive}
                        value={townState.houses.kaufmann}
                        onChange={(e) => updateTown(town.id, {
                          houses: { ...townState.houses, kaufmann: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full max-w-[60px] p-1 border border-neutral-medium rounded text-xs text-right"
                      />
                    </td>

                    {/* Convoy logistics info */}
                    <td className="p-2.5 text-xs text-center border-r border-neutral-light">
                      <div className="flex items-center justify-center space-x-2">
                        <select
                          disabled={!townState.isActive}
                          value={townState.logistics.centralHubId}
                          onChange={(e) => updateTown(town.id, {
                            logistics: { ...townState.logistics, centralHubId: e.target.value }
                          })}
                          className="p-1 border border-neutral-medium rounded text-xs w-28 bg-white"
                        >
                          {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>

                        <input
                          type="number"
                          min="1"
                          disabled={!townState.isActive}
                          value={townState.logistics.convoyStops}
                          onChange={(e) => updateTown(town.id, {
                            logistics: { ...townState.logistics, convoyStops: parseInt(e.target.value) || 1 }
                          })}
                          className="w-10 p-1 border border-neutral-medium rounded text-xs text-center"
                          title={t('dashboard.stops')}
                        />

                        <select
                          disabled={!townState.isActive}
                          value={townState.logistics.slowestShipType}
                          onChange={(e) => updateTown(town.id, {
                            logistics: { ...townState.logistics, slowestShipType: e.target.value }
                          })}
                          className="p-1 border border-neutral-medium rounded text-xs bg-white"
                        >
                          {ships.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          disabled={!townState.isActive}
                          value={townState.logistics.stockWeeks}
                          onChange={(e) => updateTown(town.id, {
                            logistics: { ...townState.logistics, stockWeeks: parseFloat(e.target.value) || 2 }
                          })}
                          className="w-10 p-1 border border-neutral-medium rounded text-xs text-center"
                          title={t('dashboard.weeks')}
                        />
                      </div>
                    </td>

                    {/* Expand businesses action */}
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => toggleExpandTown(town.id)}
                        disabled={!townState.isActive}
                        className={`flex items-center justify-center space-x-1 py-1 px-3 rounded text-xs font-semibold shadow-sm w-full text-white transition-all cursor-pointer ${
                          isExpanded 
                            ? 'bg-neutral-dark hover:bg-neutral-dark/95' 
                            : 'bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:hover:bg-primary'
                        }`}
                      >
                        <span>{t('dashboard.businesses')}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded businesses grid row */}
                  {isExpanded && townState.isActive && (
                    <tr className="bg-neutral-light/30 border-b border-neutral-medium/55">
                      <td colSpan={9} className="p-4 border-r border-l border-neutral-light">
                        <div className="font-bold text-neutral-dark text-xs mb-3 uppercase tracking-wider">
                          {t('dashboard.edifici_produzione')} - {town.name}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                          {businesses.map(b => {
                            const bState = townState.businesses[b.id] || { count: 0, efficiency: 0 };
                            
                            // Determine visual styles for the efficiency button
                            let effStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
                            if (bState.efficiency === 1) {
                              effStyle = 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
                            } else if (bState.efficiency === 2) {
                              effStyle = 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50';
                            }

                            return (
                              <div key={b.id} className="bg-white p-2.5 rounded border border-neutral-light flex flex-col justify-between space-y-2 shadow-sm">
                                <div className="text-[11px] font-bold text-neutral-dark truncate" title={b.name}>
                                  {b.name}
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    onClick={() => handleCycleEfficiency(town.id, b.id, bState.efficiency)}
                                    className={`text-[10px] font-bold px-1.5 py-1 rounded border transition-colors cursor-pointer w-full text-center ${effStyle}`}
                                  >
                                    {bState.efficiency === 0 ? t('dashboard.no_prod') : bState.efficiency === 1 ? t('dashboard.ineff') : t('dashboard.eff')}
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    disabled={bState.efficiency === 0}
                                    value={bState.count}
                                    onChange={(e) => handleBusinessCountChange(town.id, b.id, parseInt(e.target.value) || 0)}
                                    className="w-12 p-1 border border-neutral-medium rounded text-xs text-right disabled:opacity-40"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InputSheet;
