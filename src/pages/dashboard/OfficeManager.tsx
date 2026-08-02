import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import UninitializedWarning from '../../components/UninitializedWarning';
import type { Town } from '../../types';
import type { LocalizedGood } from '../../services/GoodService';
import { useTranslation } from 'react-i18next';
import { getGoodImagePath } from '../../utils/goodImage';
import { ShieldCheck, Sliders, Info } from 'lucide-react';

const OfficeManager: React.FC = () => {
  const { game } = useGame();
  const { townService, goodService } = useServices();
  const { t, i18n } = useTranslation();

  const [towns, setTowns] = useState<Town[]>([]);
  const [goods, setGoods] = useState<LocalizedGood[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');
  const [safetyPercent, setSafetyPercent] = useState<number>(10); // defaults to 10%

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
  const safetyMargin = safetyPercent / 100;

  // The 7 raw materials that factories consume
  const rawMaterials = [
    { id: 'pig_iron', name: lang === 'it' ? 'Ferro Grezzo (Minerale)' : 'Iron Ore (Pig Iron)' },
    { id: 'iron_goods', name: lang === 'it' ? 'Utensili (Eisenwaren)' : 'Iron Goods' },
    { id: 'grain', name: lang === 'it' ? 'Grano (Getreide)' : 'Grain' },
    { id: 'hemp', name: lang === 'it' ? 'Canapa (Hanf)' : 'Hemp' },
    { id: 'timber', name: lang === 'it' ? 'Legno (Holz)' : 'Wood (Timber)' },
    { id: 'salt', name: lang === 'it' ? 'Sale (Salz)' : 'Salt' },
    { id: 'wool', name: lang === 'it' ? 'Lana (Wolle)' : 'Wool' }
  ];

  // Filter raw materials that actually have industrial consumption in the selected town
  const activeReserves = selectedTownId
    ? rawMaterials
        .map(rm => {
          const cons = game.getTownGoodConsumption(selectedTownId, rm.id);
          const coverageDays = (selectedTownState?.logistics.stockWeeks || 2) * 7;
          const reserve = game.getTownOfficeReserve(selectedTownId, rm.id, safetyMargin);
          const goodInfo = goods.find(g => g.id === rm.id);

          return {
            id: rm.id,
            name: goodInfo ? goodInfo.name : rm.name,
            weeklyDemand: cons.industrial,
            dailyDemand: cons.industrial / 7,
            coverageDays,
            reserve
          };
        })
        .filter(rm => rm.weeklyDemand > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-dark">{t('dashboard.office_manager_title')}</h1>
        <p className="text-sm text-neutral-medium mt-1">
          {t('dashboard.office_manager_desc')}
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
              <span>{lang === 'it' ? 'Configurazione Riserve' : 'Reserve Settings'}</span>
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

            {/* Safety Buffer Selector */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-neutral-dark mb-1.5">
                <span>{t('dashboard.safety_buffer')}</span>
                <span className="text-primary font-extrabold">{safetyPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={safetyPercent}
                onChange={(e) => setSafetyPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-neutral-medium px-0.5 mt-1 font-semibold">
                <span>0%</span>
                <span>10%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {selectedTownState && (
              <div className="pt-2 text-xs text-neutral-medium space-y-1.5 border-t border-neutral-light">
                <div className="flex justify-between">
                  <span>{lang === 'it' ? 'Settimane Scorte:' : 'Buffer Weeks:'}</span>
                  <span className="font-bold text-neutral-dark">{selectedTownState.logistics.stockWeeks} sett.</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'it' ? 'Giorni Copertura:' : 'Coverage Days:'}</span>
                  <span className="font-bold text-neutral-dark">{selectedTownState.logistics.stockWeeks * 7} giorni</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Table Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 bg-neutral-light/20 border-b border-neutral-light font-bold text-neutral-dark text-sm flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>
                  {lang === 'it' 
                    ? `Limiti Sperrlager consigliati per ${towns.find(tData => tData.id === selectedTownId)?.name || selectedTownId}`
                    : `Recommended Sperrlager limits for ${towns.find(tData => tData.id === selectedTownId)?.name || selectedTownId}`}
                </span>
              </div>

              {activeReserves.length === 0 ? (
                <div className="p-12 text-center text-neutral-medium text-sm italic">
                  {t('dashboard.office_no_raw_materials')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs border-collapse">
                    <thead className="bg-neutral-light/50 text-neutral-dark font-semibold border-b border-neutral-light uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">{t('dashboard.col_raw_material')}</th>
                        <th className="p-3 text-right">{t('dashboard.col_weekly_demand')}</th>
                        <th className="p-3 text-right">{t('dashboard.col_daily_demand')}</th>
                        <th className="p-3 text-right">{t('dashboard.col_coverage_days')}</th>
                        <th className="p-3 text-right font-bold text-primary bg-primary/5">{t('dashboard.col_protected_stock')} (Sperrlager)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeReserves.map(row => (
                        <tr key={row.id} className="border-b border-neutral-light hover:bg-neutral-light/5 font-medium text-neutral-dark">
                          <td className="p-3 font-bold flex items-center space-x-2">
                            <img
                              src={getGoodImagePath(row.id)}
                              alt={row.name}
                              className="w-4.5 h-4.5 object-contain shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span>{row.name}</span>
                          </td>
                          <td className="p-3 text-right text-neutral-medium">{row.weeklyDemand.toFixed(2)}</td>
                          <td className="p-3 text-right text-neutral-medium">{row.dailyDemand.toFixed(3)}</td>
                          <td className="p-3 text-right">{row.coverageDays}</td>
                          <td className="p-3 text-right font-extrabold text-sm text-primary bg-primary/5">
                            <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded shadow-sm">
                              {row.reserve}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-light/20 text-xs text-neutral-medium flex items-start space-x-2 border-t border-neutral-light">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{t('dashboard.stock_explanation')}</p>
                <p className="font-semibold text-neutral-dark">
                  {lang === 'it' 
                    ? '* Nota: I consumi escludono la popolazione civile e si concentrano unicamente sul fabbisogno dei tuoi impianti manifatturieri attivi.' 
                    : '* Note: Consumption totals exclude civilian populations and focus strictly on raw inputs needed by active manufacturing workshops.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeManager;
