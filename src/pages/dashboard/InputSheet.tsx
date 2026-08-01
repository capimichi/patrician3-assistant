import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import type { Town } from '../../types';
import type { LocalizedBusiness } from '../../services/BusinessService';
import type { LocalizedShipType } from '../../services/ShipService';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Trash2, Plus, Home, Users, Settings, Building2 } from 'lucide-react';

const InputSheet: React.FC = () => {
  const { game, createNewGame, updateTown, addTown, removeTown } = useGame();
  const { townService, shipService, businessService } = useServices();
  const { t, i18n } = useTranslation();
  
  const [towns, setTowns] = useState<Town[]>([]);
  const [ships, setShips] = useState<LocalizedShipType[]>([]);
  const [businesses, setBusinesses] = useState<LocalizedBusiness[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');
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
            await createNewGame();
          }}
          className="bg-primary text-white font-medium py-2.5 px-6 rounded hover:bg-primary-dark shadow-sm transition-colors cursor-pointer"
        >
          {t('dashboard.welcome_btn')}
        </button>
      </div>
    );
  }

  // Filter available towns to add (excluding ones already in the campaign)
  const addedTownIds = Object.keys(game.state.towns);
  const availableTowns = towns.filter(tData => !addedTownIds.includes(tData.id));

  const handleAddTown = async () => {
    if (!selectedTownId) return;
    const targetTown = towns.find(tData => tData.id === selectedTownId);
    if (targetTown) {
      await addTown(targetTown);
      setExpandedTownId(targetTown.id); // Auto-expand newly added town
      setSelectedTownId('');
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title & Setup Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">{t('dashboard.input_sheet_title')}</h1>
          <p className="text-sm text-neutral-medium mt-1">
            {t('dashboard.input_sheet_desc')}
          </p>
        </div>
        
        {/* Add Town Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <select
            value={selectedTownId}
            onChange={(e) => setSelectedTownId(e.target.value)}
            className="p-2 border border-neutral-medium rounded text-sm bg-white focus:ring-primary w-48 text-neutral-dark font-medium"
          >
            <option value="">{t('dashboard.select_town_prompt')}</option>
            {availableTowns.map(tData => (
              <option key={tData.id} value={tData.id}>{tData.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddTown}
            disabled={!selectedTownId}
            className="bg-primary text-white p-2 rounded hover:bg-primary-dark shadow-sm transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer"
            title={t('dashboard.add_town')}
          >
            <Plus className="h-5 w-5 mr-1" />
            <span className="text-sm font-semibold">{t('dashboard.add_town')}</span>
          </button>
        </div>
      </div>

      {/* List of Added Towns */}
      {addedTownIds.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium">
          <p className="text-sm">{t('dashboard.no_towns_added')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addedTownIds.map(townId => {
            const town = towns.find(tData => tData.id === townId);
            const townState = game.state.towns[townId];
            if (!town || !townState) return null;

            const isExpanded = expandedTownId === townId;

            return (
              <div key={townId} className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden transition-all">
                {/* Accordion Header */}
                <div 
                  onClick={() => setExpandedTownId(isExpanded ? null : townId)}
                  className="p-4 bg-neutral-light/10 hover:bg-neutral-light/20 flex items-center justify-between cursor-pointer select-none border-b border-neutral-light"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-neutral-dark">{town.name}</span>
                    <span className="text-xs text-neutral-medium bg-neutral-light border border-neutral-medium px-2 py-0.5 rounded font-semibold">
                      ZL Hub: {towns.find(tData => tData.id === townState.logistics.centralHubId)?.name || townState.logistics.centralHubId}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => removeTown(townId)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="Rimuovi città dalla campagna"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <button 
                      onClick={() => setExpandedTownId(isExpanded ? null : townId)}
                      className="p-1 rounded hover:bg-neutral-light/50 text-neutral-medium"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Demographics Card */}
                      <div className="bg-neutral-light/10 p-4 rounded-lg border border-neutral-light space-y-4">
                        <div className="flex items-center space-x-2 border-b border-neutral-light pb-2 font-bold text-neutral-dark text-sm">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{t('dashboard.population')}</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-medium mb-1">{t('dashboard.poor')}</label>
                            <input
                              type="number"
                              min="0"
                              value={townState.population.poor}
                              onChange={(e) => updateTown(townId, {
                                population: { ...townState.population, poor: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full p-2 border border-neutral-medium rounded text-sm text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-medium mb-1">{t('dashboard.wealthy')}</label>
                            <input
                              type="number"
                              min="0"
                              value={townState.population.wealthy}
                              onChange={(e) => updateTown(townId, {
                                population: { ...townState.population, wealthy: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full p-2 border border-neutral-medium rounded text-sm text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-medium mb-1">{t('dashboard.rich')}</label>
                            <input
                              type="number"
                              min="0"
                              value={townState.population.rich}
                              onChange={(e) => updateTown(townId, {
                                population: { ...townState.population, rich: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full p-2 border border-neutral-medium rounded text-sm text-right"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Housing Card */}
                      <div className="bg-neutral-light/10 p-4 rounded-lg border border-neutral-light space-y-4">
                        <div className="flex items-center space-x-2 border-b border-neutral-light pb-2 font-bold text-neutral-dark text-sm">
                          <Home className="h-4 w-4 text-primary" />
                          <span>{t('dashboard.housing')}</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-medium mb-1">{t('dashboard.fwh')}</label>
                            <input
                              type="number"
                              min="0"
                              value={townState.houses.fachwerk}
                              onChange={(e) => updateTown(townId, {
                                houses: { ...townState.houses, fachwerk: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full p-2 border border-neutral-medium rounded text-sm text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-medium mb-1">{t('dashboard.gh')}</label>
                            <input
                              type="number"
                              min="0"
                              value={townState.houses.giebel}
                              onChange={(e) => updateTown(townId, {
                                houses: { ...townState.houses, giebel: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full p-2 border border-neutral-medium rounded text-sm text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-medium mb-1">{t('dashboard.kmh')}</label>
                            <input
                              type="number"
                              min="0"
                              value={townState.houses.kaufmann}
                              onChange={(e) => updateTown(townId, {
                                houses: { ...townState.houses, kaufmann: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full p-2 border border-neutral-medium rounded text-sm text-right"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Logistics Card */}
                      <div className="bg-neutral-light/10 p-4 rounded-lg border border-neutral-light space-y-3">
                        <div className="flex items-center space-x-2 border-b border-neutral-light pb-2 font-bold text-neutral-dark text-sm">
                          <Settings className="h-4 w-4 text-primary" />
                          <span>{t('dashboard.logistics')}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-neutral-medium mb-0.5">{t('dashboard.hub')}</label>
                            <select
                              value={townState.logistics.centralHubId}
                              onChange={(e) => updateTown(townId, {
                                logistics: { ...townState.logistics, centralHubId: e.target.value }
                              })}
                              className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white text-neutral-dark font-medium"
                            >
                              {towns.map(tData => <option key={tData.id} value={tData.id}>{tData.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-medium mb-0.5">{t('dashboard.stops')}</label>
                            <input
                              type="number"
                              min="1"
                              value={townState.logistics.convoyStops}
                              onChange={(e) => updateTown(townId, {
                                logistics: { ...townState.logistics, convoyStops: parseInt(e.target.value) || 1 }
                              })}
                              className="w-full p-1.5 border border-neutral-medium rounded text-xs text-center"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-medium mb-0.5">{t('dashboard.ship')}</label>
                            <select
                              value={townState.logistics.slowestShipType}
                              onChange={(e) => updateTown(townId, {
                                logistics: { ...townState.logistics, slowestShipType: e.target.value }
                              })}
                              className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white"
                            >
                              {ships.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-medium mb-0.5">{t('dashboard.weeks')}</label>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={townState.logistics.stockWeeks}
                              onChange={(e) => updateTown(townId, {
                                logistics: { ...townState.logistics, stockWeeks: parseFloat(e.target.value) || 2 }
                              })}
                              className="w-full p-1.5 border border-neutral-medium rounded text-xs text-center"
                            />
                          </div>

                          {/* New fields: Convoy Size & Transit Hub */}
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-medium mb-0.5">Stiva (Barili)</label>
                            <input
                              type="number"
                              min="0"
                              value={townState.logistics.convoySize}
                              onChange={(e) => updateTown(townId, {
                                logistics: { ...townState.logistics, convoySize: parseInt(e.target.value) || 0 }
                              })}
                              className="w-full p-1.5 border border-neutral-medium rounded text-xs text-center font-semibold"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-neutral-medium mb-0.5">Zwischenlager / Transito</label>
                            <select
                              value={townState.logistics.transitHubId}
                              onChange={(e) => updateTown(townId, {
                                logistics: { ...townState.logistics, transitHubId: e.target.value }
                              })}
                              className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white"
                            >
                              <option value="none">Kein Zwischenlager (Nessuno)</option>
                              {towns.filter(tData => tData.id !== townId).map(tData => (
                                <option key={tData.id} value={tData.id}>{tData.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Businesses Sub-Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 border-b border-neutral-light pb-2 font-bold text-neutral-dark text-sm">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span>{t('dashboard.edifici_produzione')}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {businesses.map(b => {
                          const bState = townState.businesses[b.id] || { count: 0, efficiency: 0 };
                          
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
                                  onClick={() => handleCycleEfficiency(townId, b.id, bState.efficiency)}
                                  className={`text-[10px] font-bold px-1.5 py-1 rounded border transition-colors cursor-pointer w-full text-center ${effStyle}`}
                                >
                                  {bState.efficiency === 0 ? t('dashboard.no_prod') : bState.efficiency === 1 ? t('dashboard.ineff') : t('dashboard.eff')}
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  disabled={bState.efficiency === 0}
                                  value={bState.count}
                                  onChange={(e) => handleBusinessCountChange(townId, b.id, parseInt(e.target.value) || 0)}
                                  className="w-12 p-1 border border-neutral-medium rounded text-xs text-right disabled:opacity-40"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InputSheet;
