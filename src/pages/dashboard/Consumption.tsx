import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import UninitializedWarning from '../../components/UninitializedWarning';
import type { Town } from '../../types';
import type { LocalizedGood } from '../../services/GoodService';
import { useTranslation } from 'react-i18next';
import { getGoodImagePath } from '../../utils/goodImage';
import { Sun, Snowflake, Layers, MapPin } from 'lucide-react';

const Consumption: React.FC = () => {
  const { game } = useGame();
  const { townService, goodService } = useServices();
  const { t, i18n } = useTranslation();

  const [towns, setTowns] = useState<Town[]>([]);
  const [goods, setGoods] = useState<LocalizedGood[]>([]);
  const [activeTab, setActiveTab] = useState<'league' | 'city' | 'hub'>('league');
  
  // Selection states
  const [selectedTownId, setSelectedTownId] = useState<string>('');
  const [selectedHubId, setSelectedHubId] = useState<string>('');

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

  // Auto-select initial town/hub
  if (activeTowns.length > 0 && !selectedTownId) {
    setSelectedTownId(activeTowns[0].id);
  }

  // Find all active Hub IDs
  const activeHubIds = Array.from(
    new Set(
      activeTowns
        .map(tData => game.state.towns[tData.id]?.logistics.centralHubId)
        .filter(hubId => hubId && hubId !== 'none')
    )
  ) as string[];

  if (activeHubIds.length > 0 && !selectedHubId) {
    setSelectedHubId(activeHubIds[0]);
  }

  const renderBalanceBadge = (bal: number) => {
    const formatted = bal.toFixed(2);
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
        bal > 0 
          ? 'bg-green-100 text-green-800' 
          : bal < 0
            ? 'bg-red-100 text-red-800 animate-pulse'
            : 'bg-neutral-light text-neutral-dark border border-neutral-medium/25'
      }`}>
        {bal > 0 ? '+' : ''}{formatted}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            {lang === 'it' ? 'Consumi e Bilanci delle Merci' : 'Consumption & Balances'}
          </h1>
          <p className="text-sm text-neutral-medium mt-1">
            {lang === 'it' 
              ? 'Raffronto tra la produzione totale e i consumi (cittadini + filiere produttive) con bilanci stagionali.'
              : 'Comparison between total production and consumption (population + industries) with seasonal balances.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-light/50 p-1 rounded border border-neutral-medium shrink-0">
          <button
            onClick={() => setActiveTab('league')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'league'
                ? 'bg-white text-primary shadow-sm'
                : 'text-neutral-medium hover:text-neutral-dark'
            }`}
          >
            {lang === 'it' ? 'Riepilogo Lega' : 'League Summary'}
          </button>
          <button
            onClick={() => setActiveTab('city')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'city'
                ? 'bg-white text-primary shadow-sm'
                : 'text-neutral-medium hover:text-neutral-dark'
            }`}
          >
            {lang === 'it' ? 'Dettaglio Città' : 'City Breakdown'}
          </button>
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'hub'
                ? 'bg-white text-primary shadow-sm'
                : 'text-neutral-medium hover:text-neutral-dark'
            }`}
          >
            {lang === 'it' ? 'Magazzini Hub (ZL)' : 'ZL Hub Aggregates'}
          </button>
        </div>
      </div>

      {activeTowns.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm">
          {t('dashboard.no_towns_added')}
        </div>
      ) : (
        <>
          {/* TAB 1: LEAGUE SUMMARY */}
          {activeTab === 'league' && (
            <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm border-collapse">
                  <thead className="bg-neutral-light text-neutral-dark font-semibold border-b border-neutral-light">
                    <tr>
                      <th className="p-3 border-r border-neutral-light">{lang === 'it' ? 'Merce' : 'Good'}</th>
                      <th className="p-3 border-r border-neutral-light text-right text-amber-700 bg-amber-50/20">
                        <div className="flex items-center justify-end space-x-1">
                          <Sun className="h-3.5 w-3.5" />
                          <span>{lang === 'it' ? 'Prod. Estate' : 'Prod. Summer'}</span>
                        </div>
                      </th>
                      <th className="p-3 border-r border-neutral-light text-right text-sky-700 bg-sky-50/20">
                        <div className="flex items-center justify-end space-x-1">
                          <Snowflake className="h-3.5 w-3.5" />
                          <span>{lang === 'it' ? 'Prod. Inverno' : 'Prod. Winter'}</span>
                        </div>
                      </th>
                      <th className="p-3 border-r border-neutral-light text-right text-neutral-medium bg-neutral-light/10">{lang === 'it' ? 'Consumo Totale' : 'Total Cons.'}</th>
                      <th className="p-3 border-r border-neutral-light text-right text-amber-800 bg-amber-50/10">{lang === 'it' ? 'Bilancio Estate' : 'Summer Bal.'}</th>
                      <th className="p-3 text-right text-sky-800 bg-sky-50/10">{lang === 'it' ? 'Bilancio Inverno' : 'Winter Bal.'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goods.map(good => {
                      let prodSummer = 0;
                      let prodWinter = 0;
                      let consumption = 0;

                      activeTowns.forEach(tData => {
                        prodSummer += game.getTownGoodProduction(tData.id, good.id, 'summer');
                        prodWinter += game.getTownGoodProduction(tData.id, good.id, 'winter');
                        consumption += game.getTownGoodConsumption(tData.id, good.id).total;
                      });

                      const balSummer = prodSummer - consumption;
                      const balWinter = prodWinter - consumption;

                      return (
                        <tr key={good.id} className="border-b border-neutral-light hover:bg-neutral-light/5">
                          <td className="p-3 border-r border-neutral-light font-semibold text-neutral-dark flex items-center space-x-2">
                            <img
                              src={getGoodImagePath(good.id)}
                              alt={good.name}
                              className="w-4 h-4 object-contain shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span>{good.name}</span>
                          </td>
                          <td className="p-3 border-r border-neutral-light text-right font-medium text-amber-800 bg-amber-50/5">{prodSummer.toFixed(2)}</td>
                          <td className="p-3 border-r border-neutral-light text-right font-medium text-sky-800 bg-sky-50/5">{prodWinter.toFixed(2)}</td>
                          <td className="p-3 border-r border-neutral-light text-right font-semibold text-neutral-medium bg-neutral-light/5">{consumption.toFixed(2)}</td>
                          <td className="p-3 border-r border-neutral-light text-right font-bold bg-amber-50/5">{renderBalanceBadge(balSummer)}</td>
                          <td className="p-3 text-right font-bold bg-sky-50/5">{renderBalanceBadge(balWinter)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CITY BREAKDOWN */}
          {activeTab === 'city' && (
            <div className="space-y-4">
              {/* City Selection Bar */}
              <div className="bg-white p-4 rounded-lg border border-neutral-light shadow-sm flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="font-bold text-neutral-dark text-sm">{lang === 'it' ? 'Seleziona Città:' : 'Select City:'}</span>
                <select
                  value={selectedTownId}
                  onChange={(e) => setSelectedTownId(e.target.value)}
                  className="p-1.5 border border-neutral-medium rounded text-sm bg-white font-bold text-neutral-dark w-48"
                >
                  {activeTowns.map(town => (
                    <option key={town.id} value={town.id}>{town.name}</option>
                  ))}
                </select>
              </div>

              {/* City Goods Table */}
              <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm border-collapse">
                    <thead className="bg-neutral-light text-neutral-dark font-semibold border-b border-neutral-light">
                      <tr>
                        <th className="p-3 border-r border-neutral-light">{lang === 'it' ? 'Merce' : 'Good'}</th>
                        <th className="p-3 border-r border-neutral-light text-right">{lang === 'it' ? 'Prod. Estate' : 'Prod. Summer'}</th>
                        <th className="p-3 border-r border-neutral-light text-right">{lang === 'it' ? 'Prod. Inverno' : 'Prod. Winter'}</th>
                        <th className="p-3 border-r border-neutral-light text-right text-neutral-medium">{lang === 'it' ? 'Consumo Pop.' : 'Pop. Cons.'}</th>
                        <th className="p-3 border-r border-neutral-light text-right text-neutral-medium">{lang === 'it' ? 'Consumo Ind.' : 'Ind. Cons.'}</th>
                        <th className="p-3 border-r border-neutral-light text-right text-neutral-dark bg-neutral-light/5">{lang === 'it' ? 'Consumo Totale' : 'Total Cons.'}</th>
                        <th className="p-3 border-r border-neutral-light text-right">{lang === 'it' ? 'Bilancio Estate' : 'Summer Bal.'}</th>
                        <th className="p-3 text-right">{lang === 'it' ? 'Bilancio Inverno' : 'Winter Bal.'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goods.map(good => {
                        const prodSummer = game.getTownGoodProduction(selectedTownId, good.id, 'summer');
                        const prodWinter = game.getTownGoodProduction(selectedTownId, good.id, 'winter');
                        const cons = game.getTownGoodConsumption(selectedTownId, good.id);
                        
                        const balSummer = prodSummer - cons.total;
                        const balWinter = prodWinter - cons.total;

                        return (
                          <tr key={good.id} className="border-b border-neutral-light hover:bg-neutral-light/5">
                            <td className="p-3 border-r border-neutral-light font-semibold text-neutral-dark flex items-center space-x-2">
                              <img
                                src={getGoodImagePath(good.id)}
                                alt={good.name}
                                className="w-4 h-4 object-contain shrink-0"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span>{good.name}</span>
                            </td>
                            <td className="p-3 border-r border-neutral-light text-right text-neutral-dark">{prodSummer.toFixed(2)}</td>
                            <td className="p-3 border-r border-neutral-light text-right text-neutral-dark">{prodWinter.toFixed(2)}</td>
                            <td className="p-3 border-r border-neutral-light text-right text-neutral-medium">{cons.population.toFixed(2)}</td>
                            <td className="p-3 border-r border-neutral-light text-right text-neutral-medium">{cons.industrial.toFixed(2)}</td>
                            <td className="p-3 border-r border-neutral-light text-right font-bold text-neutral-dark bg-neutral-light/5">{cons.total.toFixed(2)}</td>
                            <td className="p-3 border-r border-neutral-light text-right font-bold">{renderBalanceBadge(balSummer)}</td>
                            <td className="p-3 text-right font-bold">{renderBalanceBadge(balWinter)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HUB WAREHOUSES AGGREGATION */}
          {activeTab === 'hub' && (
            <div className="space-y-4">
              {activeHubIds.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm">
                  {lang === 'it' 
                    ? 'Nessun magazzino di transito (ZL Hub) configurato nelle città attive. Impostalo nella pagina di Input.'
                    : 'No transit hubs (ZL Hub) configured in your active cities. Set them in the Input Sheet.'}
                </div>
              ) : (
                <>
                  {/* Hub Selector */}
                  <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-3">
                    <div className="flex items-center space-x-4">
                      <Layers className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-bold text-neutral-dark text-sm">{lang === 'it' ? 'Seleziona Magazzino Hub:' : 'Select Hub Warehouse:'}</span>
                      <select
                        value={selectedHubId}
                        onChange={(e) => setSelectedHubId(e.target.value)}
                        className="p-1.5 border border-neutral-medium rounded text-sm bg-white font-bold text-neutral-dark w-48"
                      >
                        {activeHubIds.map(hubId => {
                          const hubName = towns.find(tData => tData.id === hubId)?.name || hubId;
                          return (
                            <option key={hubId} value={hubId}>{hubName}</option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Member Cities list */}
                    <div className="text-xs text-neutral-medium flex items-center flex-wrap gap-2 pt-2 border-t border-neutral-light">
                      <span className="font-semibold text-neutral-dark">{lang === 'it' ? 'Città servite da questo Hub:' : 'Cities served by this Hub:'}</span>
                      {activeTowns
                        .filter(tData => {
                          const tState = game.state.towns[tData.id];
                          return tState && (tState.logistics.centralHubId === selectedHubId || tData.id === selectedHubId);
                        })
                        .map(tData => {
                          const isHubSelf = tData.id === selectedHubId;
                          return (
                            <span key={tData.id} className={`px-2 py-0.5 rounded border ${isHubSelf ? 'bg-primary/10 text-primary font-bold border-primary/20' : 'bg-neutral-light border-neutral-medium/30 text-neutral-dark'}`}>
                              {tData.name} {isHubSelf ? `(${lang === 'it' ? 'Hub' : 'Hub'})` : ''}
                            </span>
                          );
                        })}
                    </div>
                  </div>

                  {/* Hub Table */}
                  <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm border-collapse">
                        <thead className="bg-neutral-light text-neutral-dark font-semibold border-b border-neutral-light">
                          <tr>
                            <th className="p-3 border-r border-neutral-light">{lang === 'it' ? 'Merce' : 'Good'}</th>
                            <th className="p-3 border-r border-neutral-light text-right">{lang === 'it' ? 'Prod. Distretto (SO)' : 'District Prod. (SO)'}</th>
                            <th className="p-3 border-r border-neutral-light text-right">{lang === 'it' ? 'Prod. Distretto (WI)' : 'District Prod. (WI)'}</th>
                            <th className="p-3 border-r border-neutral-light text-right text-neutral-medium">{lang === 'it' ? 'Consumo Distretto' : 'District Consumption'}</th>
                            <th className="p-3 border-r border-neutral-light text-right">{lang === 'it' ? 'Bilancio Hub (SO)' : 'Hub Balance (SO)'}</th>
                            <th className="p-3 text-right">{lang === 'it' ? 'Bilancio Hub (WI)' : 'Hub Balance (WI)'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {goods.map(good => {
                            let prodSummer = 0;
                            let prodWinter = 0;
                            let consumption = 0;

                            activeTowns
                              .filter(tData => {
                                const tState = game.state.towns[tData.id];
                                return tState && (tState.logistics.centralHubId === selectedHubId || tData.id === selectedHubId);
                              })
                              .forEach(tData => {
                                prodSummer += game.getTownGoodProduction(tData.id, good.id, 'summer');
                                prodWinter += game.getTownGoodProduction(tData.id, good.id, 'winter');
                                consumption += game.getTownGoodConsumption(tData.id, good.id).total;
                              });

                            const balSummer = prodSummer - consumption;
                            const balWinter = prodWinter - consumption;

                            return (
                              <tr key={good.id} className="border-b border-neutral-light hover:bg-neutral-light/5">
                                <td className="p-3 border-r border-neutral-light font-semibold text-neutral-dark flex items-center space-x-2">
                                  <img
                                    src={getGoodImagePath(good.id)}
                                    alt={good.name}
                                    className="w-4 h-4 object-contain shrink-0"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                  <span>{good.name}</span>
                                </td>
                                <td className="p-3 border-r border-neutral-light text-right text-neutral-dark">{prodSummer.toFixed(2)}</td>
                                <td className="p-3 border-r border-neutral-light text-right text-neutral-dark">{prodWinter.toFixed(2)}</td>
                                <td className="p-3 border-r border-neutral-light text-right font-semibold text-neutral-medium bg-neutral-light/5">{consumption.toFixed(2)}</td>
                                <td className="p-3 border-r border-neutral-light text-right font-bold">{renderBalanceBadge(balSummer)}</td>
                                <td className="p-3 text-right font-bold">{renderBalanceBadge(balWinter)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Consumption;
