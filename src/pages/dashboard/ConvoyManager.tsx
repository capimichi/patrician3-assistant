import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import UninitializedWarning from '../../components/UninitializedWarning';
import type { Town } from '../../types';
import type { LocalizedGood } from '../../services/GoodService';
import { useTranslation } from 'react-i18next';
import { getGoodImagePath } from '../../utils/goodImage';
import { Compass, ArrowDownLeft, ArrowUpRight, Anchor, Info, Sliders } from 'lucide-react';

const ConvoyManager: React.FC = () => {
  const { game } = useGame();
  const { townService, goodService } = useServices();
  const { t, i18n } = useTranslation();

  const [towns, setTowns] = useState<Town[]>([]);
  const [goods, setGoods] = useState<LocalizedGood[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');
  const [safetyCargoPercent, setSafetyCargoPercent] = useState<number>(35); // defaults to 35%
  const [safetyConvoyPercent, setSafetyConvoyPercent] = useState<number>(10); // defaults to 10%

  const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

  useEffect(() => {
    townService.getTowns().then(setTowns);
    goodService.getGoods(lang).then(setGoods);
  }, [townService, goodService, lang]);

  if (!game) {
    return <UninitializedWarning />;
  }

  const activeTowns = towns.filter(town => {
    const townState = game.state.towns[town.id];
    return townState && townState.isActive;
  });

  // Auto-select first active town
  if (activeTowns.length > 0 && !selectedTownId) {
    setSelectedTownId(activeTowns[0].id);
  }

  const selectedTownState = selectedTownId ? game.state.towns[selectedTownId] : null;
  const isHubOrNoRoute = !selectedTownState || 
    !selectedTownState.logistics.centralHubId || 
    selectedTownState.logistics.centralHubId === 'none' || 
    selectedTownState.logistics.centralHubId === selectedTownId;

  const roundTripDays = selectedTownId ? game.getTownConvoyRoundTripTime(selectedTownId) : 0;

  const lastGoods = ['pig_iron', 'fish', 'meat', 'grain', 'hemp', 'timber', 'wool', 'bricks'];

  // Calculate cargo goods load details
  const cargoDetails = selectedTownId && !isHubOrNoRoute
    ? goods.map(good => {
        const load = game.getTownConvoyGoodLoad(selectedTownId, good.id, safetyCargoPercent / 100);
        const factor = lastGoods.includes(good.id) ? 10 : 1;
        const volumeFass = load.amount * factor;

        return {
          id: good.id,
          name: good.name,
          dailyBalance: game.getTownGoodWeightedDailyBalance(selectedTownId, good.id),
          action: load.action,
          amount: load.amount,
          unit: lastGoods.includes(good.id) ? (lang === 'it' ? 'Last' : 'Last') : (lang === 'it' ? 'Barili (Faß)' : 'Barrels (Faß)'),
          volumeFass
        };
      }).filter(item => item.amount > 0)
    : [];

  // Summary statistics
  const summary = selectedTownId && !isHubOrNoRoute
    ? game.getTownConvoyCapacitySummary(selectedTownId, safetyCargoPercent / 100, safetyConvoyPercent / 100)
    : null;

  // Ship suggestions helper
  const getShipSuggestions = (capacityFass: number) => {
    if (capacityFass <= 0) return [];
    return [
      { type: lang === 'it' ? 'Schnigge (Snaikka)' : 'Snaikka (Schnigge)', cap: 150 },
      { type: lang === 'it' ? 'Kraier' : 'Crayer', cap: 280 },
      { type: lang === 'it' ? 'Kogge' : 'Cog', cap: 450 },
      { type: lang === 'it' ? 'Holk' : 'Holk', cap: 550 }
    ].map(s => {
      const count = Math.ceil(capacityFass / s.cap);
      return {
        ...s,
        count
      };
    });
  };

  const shipSuggestions = summary ? getShipSuggestions(summary.minConvoySize) : [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-dark">{t('dashboard.convoy_manager_title')}</h1>
        <p className="text-sm text-neutral-medium mt-1">
          {t('dashboard.convoy_manager_desc')}
        </p>
      </div>

      {activeTowns.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm">
          {t('dashboard.no_towns_added')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="space-y-4 bg-white p-5 rounded-lg border border-neutral-light shadow-sm self-start">
            <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
              <Sliders className="h-4 w-4 text-primary" />
              <span>{lang === 'it' ? 'Rotta e Margini' : 'Route & Safety Margins'}</span>
            </div>

            {/* Town Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-dark mb-1.5">{t('dashboard.col_town')}</label>
              <select
                value={selectedTownId}
                onChange={(e) => setSelectedTownId(e.target.value)}
                className="w-full p-2 border border-neutral-medium rounded text-sm bg-white font-bold text-neutral-dark"
              >
                {activeTowns.map(town => (
                  <option key={town.id} value={town.id}>{town.name}</option>
                ))}
              </select>
            </div>

            {/* Import Safety Buffer */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-neutral-dark mb-1.5">
                <span>{t('dashboard.safety_buffer_cargo')}</span>
                <span className="text-primary font-extrabold">{safetyCargoPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={safetyCargoPercent}
                onChange={(e) => setSafetyCargoPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-neutral-medium px-0.5 mt-1 font-semibold">
                <span>0%</span>
                <span>35%</span>
                <span>60%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Convoy Safety Buffer */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-neutral-dark mb-1.5">
                <span>{t('dashboard.convoy_buffer_capacity')}</span>
                <span className="text-primary font-extrabold">{safetyConvoyPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={safetyConvoyPercent}
                onChange={(e) => setSafetyConvoyPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-neutral-medium px-0.5 mt-1 font-semibold">
                <span>0%</span>
                <span>10%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Logistics Info */}
            {selectedTownState && !isHubOrNoRoute && (
              <div className="pt-3 text-xs text-neutral-medium space-y-1.5 border-t border-neutral-light">
                <div className="flex justify-between">
                  <span>{lang === 'it' ? 'Magazzino Hub:' : 'Central Hub:'}</span>
                  <span className="font-bold text-neutral-dark">
                    {towns.find(tData => tData.id === selectedTownState.logistics.centralHubId)?.name || selectedTownState.logistics.centralHubId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'it' ? 'Fermate Convoglio:' : 'Convoy Stops:'}</span>
                  <span className="font-bold text-neutral-dark">{selectedTownState.logistics.convoyStops}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'it' ? 'Nave più lenta:' : 'Slowest Ship:'}</span>
                  <span className="font-bold text-neutral-dark uppercase">{selectedTownState.logistics.slowestShipType}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-light pt-2 mt-1">
                  <span>{lang === 'it' ? 'Durata Giro Completo:' : 'Round Trip Duration:'}</span>
                  <span className="font-bold text-primary">{roundTripDays.toFixed(2)} {lang === 'it' ? 'giorni' : 'days'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {isHubOrNoRoute ? (
              <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm italic">
                {t('dashboard.convoy_no_logistics')}
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-lg shadow-xs flex items-center space-x-3">
                    <ArrowDownLeft className="h-6 w-6 text-amber-700 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">{t('dashboard.col_imports')}</div>
                      <div className="text-lg font-extrabold text-amber-900">{summary?.importsFass} <span className="text-xs font-semibold text-amber-700">Faß</span></div>
                    </div>
                  </div>

                  <div className="bg-sky-50/50 border border-sky-200/50 p-4 rounded-lg shadow-xs flex items-center space-x-3">
                    <ArrowUpRight className="h-6 w-6 text-sky-700 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">{t('dashboard.col_exports')}</div>
                      <div className="text-lg font-extrabold text-sky-900">{summary?.exportsFass} <span className="text-xs font-semibold text-sky-700">Faß</span></div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg shadow-xs flex items-center space-x-3">
                    <Anchor className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-primary tracking-wider">{t('dashboard.col_min_convoy_size')}</div>
                      <div className="text-lg font-extrabold text-primary">{summary?.minConvoySize} <span className="text-xs font-semibold text-primary">Faß</span></div>
                    </div>
                  </div>
                </div>

                {/* Cargo Loads Table */}
                <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
                  <div className="p-4 bg-neutral-light/20 border-b border-neutral-light font-bold text-neutral-dark text-sm flex items-center space-x-2">
                    <Compass className="h-4 w-4 text-primary" />
                    <span>
                      {lang === 'it' 
                        ? `Configurazione di carico per il convoglio di ${towns.find(tData => tData.id === selectedTownId)?.name}`
                        : `Cargo configuration for convoy servicing ${towns.find(tData => tData.id === selectedTownId)?.name}`}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-light/50 text-neutral-dark font-semibold border-b border-neutral-light uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3">{lang === 'it' ? 'Merce' : 'Good'}</th>
                          <th className="p-3 text-right">{lang === 'it' ? 'Bilancio Giornaliero' : 'Daily Balance'}</th>
                          <th className="p-3 text-center">{t('dashboard.col_action')}</th>
                          <th className="p-3 text-right font-bold text-primary bg-primary/5">{t('dashboard.col_cargo_load')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cargoDetails.map(row => (
                          <tr key={row.id} className="border-b border-neutral-light hover:bg-neutral-light/5 font-medium text-neutral-dark">
                            <td className="p-3 font-bold flex items-center space-x-2">
                              <img
                                src={getGoodImagePath(row.id)}
                                alt={row.name}
                                className="w-5 h-5 object-contain shrink-0"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span>{row.name}</span>
                            </td>
                            <td className={`p-3 text-right font-bold ${row.dailyBalance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                              {row.dailyBalance > 0 ? '+' : ''}{row.dailyBalance.toFixed(3)}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.action === 'import'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}>
                                {t(`dashboard.action_${row.action}`)}
                              </span>
                            </td>
                            <td className="p-3 text-right font-extrabold text-sm text-primary bg-primary/5">
                              <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded shadow-sm">
                                {row.amount} <span className="text-[10px] font-semibold text-primary">{row.unit}</span>
                              </span>
                              {lastGoods.includes(row.id) && (
                                <span className="block text-[9px] text-neutral-medium font-semibold mt-0.5">
                                  (= {row.volumeFass} Faß)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ship Suggestions Panel */}
                <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-3">
                  <div className="font-bold text-neutral-dark text-sm flex items-center space-x-2">
                    <Anchor className="h-4.5 w-4.5 text-primary" />
                    <span>{lang === 'it' ? 'Flotta consigliata per coprire il carico' : 'Suggested fleet composition'}</span>
                  </div>
                  <p className="text-xs text-neutral-medium">
                    {lang === 'it' 
                      ? 'Questo convoglio necessita di navi per una capacità minima complessiva. Ecco le opzioni alternative:'
                      : 'This convoy requires a minimum capacity. Here is the equivalent ship count for each type:'}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    {shipSuggestions.map(s => (
                      <div key={s.type} className="bg-neutral-light/35 border border-neutral-medium/30 p-3 rounded text-center">
                        <div className="text-xs font-semibold text-neutral-medium">{s.type}</div>
                        <div className="text-lg font-black text-primary mt-1">{s.count}x</div>
                        <div className="text-[10px] text-neutral-medium mt-0.5">({s.cap} Faß cad.)</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guidelines */}
                <div className="p-4 bg-neutral-light/20 text-xs text-neutral-medium flex items-start space-x-2 border border-neutral-light rounded-lg">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{t('dashboard.convoy_explanation')}</p>
                    <p className="font-semibold text-neutral-dark">
                      {lang === 'it' 
                        ? '* Nota: I carichi sono calcolati ponderando estate (75%) e inverno (25%) per i beni stagionali, assicurando un flusso logistico idoneo tutto l\'anno.' 
                        : '* Note: Cargo requirements average summer (75%) and winter (25%) for seasonal goods, ensuring optimal capacities year-round.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConvoyManager;
