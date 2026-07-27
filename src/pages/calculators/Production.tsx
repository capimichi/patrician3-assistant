import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import type { Town } from '../../types';
import { Factory, Plus, Trash2, Coins, TrendingUp, Info } from 'lucide-react';
import { getGoodImagePath } from '../../utils/goodImage';
import { GameIcon } from '../../components/GameIcon';

interface EmpireState {
  [townId: string]: {
    [businessId: string]: number; // quantità di fabbriche
  };
}

const LOCAL_STORAGE_KEY = 'patrician3_production_empire';

const Production: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { townService, goodService, businessService } = useServices();

  const [towns, setTowns] = useState<Town[]>([]);
  const [goods, setGoods] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'global' | 'branches'>('global');
  const [selectedTownToAdd, setSelectedTownToAdd] = useState<string>('');
  const [empire, setEmpire] = useState<EmpireState>({});
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  // Caricamento Dati
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const loadedTowns = await townService.getTowns();
        const loadedGoods = await goodService.getGoods(currentLang);
        const loadedBusinesses = await businessService.getBusinesses(currentLang);
        setTowns(loadedTowns);
        setGoods(loadedGoods);
        setBusinesses(loadedBusinesses);

        // Carica da localStorage
        const savedEmpire = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedEmpire) {
          setEmpire(JSON.parse(savedEmpire));
        } else if (loadedTowns.length > 0) {
          // Stato iniziale: solo Lubecca attiva con 0 imprese
          setEmpire({ lubeck: {} });
        }
      } catch (err) {
        console.error('Errore nel caricamento dei dati', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [townService, goodService, businessService, currentLang]);

  // Salvataggio automatico
  useEffect(() => {
    if (Object.keys(empire).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(empire));
    }
  }, [empire]);

  const handleAddTown = () => {
    if (!selectedTownToAdd || empire[selectedTownToAdd]) return;
    setEmpire(prev => ({
      ...prev,
      [selectedTownToAdd]: {}
    }));
    setSelectedTownToAdd('');
  };

  const handleRemoveTown = (townId: string) => {
    setEmpire(prev => {
      const next = { ...prev };
      delete next[townId];
      return next;
    });
  };

  const handleUpdateBusinessCount = (townId: string, businessId: string, value: number) => {
    setEmpire(prev => {
      const townState = prev[townId] ? { ...prev[townId] } : {};
      const newCount = Math.max(0, (townState[businessId] || 0) + value);
      
      if (newCount === 0) {
        delete townState[businessId];
      } else {
        townState[businessId] = newCount;
      }

      return {
        ...prev,
        [townId]: townState
      };
    });
  };

  // Funzione di calcolo bilancio per singola città o complessivo
  const calculateBalances = () => {
    const balances: { [goodId: string]: { produced: number; consumed: number; net: number } } = {};
    let totalMaintenance = 0;
    let totalWorkers = 0;

    // Inizializza tutte le merci
    goods.forEach(g => {
      balances[g.id] = { produced: 0, consumed: 0, net: 0 };
    });

    const branchReports: {
      [townId: string]: {
        maintenance: number;
        workers: number;
        balances: { [goodId: string]: number };
      };
    } = {};

    Object.keys(empire).forEach(townId => {
      const town = towns.find(t => t.id === townId);
      const townBusinesses = empire[townId];
      
      branchReports[townId] = {
        maintenance: 0,
        workers: 0,
        balances: {}
      };

      goods.forEach(g => {
        branchReports[townId].balances[g.id] = 0;
      });

      if (!town) return;

      Object.keys(townBusinesses).forEach(businessId => {
        const count = townBusinesses[businessId] || 0;
        if (count <= 0) return;

        const business = businesses.find(b => b.id === businessId);
        if (!business) return;

        // Calcola efficacia per ciascun output (penalità 25% se la merce non è prodotta localmente)
        business.outputs.forEach((output: any) => {
          const isSpecialty = town.produces.includes(output.goodId);
          const dailyProd = output.amountPerDay * (isSpecialty ? 1.0 : 0.75) * count;

          // Somma produzione
          balances[output.goodId].produced += dailyProd;
          branchReports[townId].balances[output.goodId] += dailyProd;
        });

        // Somma consumi materie prime
        business.inputs.forEach((input: any) => {
          const dailyCons = input.amountPerDay * count;
          balances[input.goodId].consumed += dailyCons;
          branchReports[townId].balances[input.goodId] -= dailyCons;
        });

        // Manutenzione e dipendenti
        const maintenance = business.dailyMaintenance * count;
        const workers = business.workersNeeded * count;

        totalMaintenance += maintenance;
        totalWorkers += workers;
        branchReports[townId].maintenance += maintenance;
        branchReports[townId].workers += workers;
      });
    });

    // Calcola il bilancio netto globale
    goods.forEach(g => {
      balances[g.id].net = balances[g.id].produced - balances[g.id].consumed;
    });

    return {
      globalBalances: balances,
      totalMaintenance,
      totalWorkers,
      branchReports
    };
  };

  const { globalBalances, totalMaintenance, totalWorkers, branchReports } = calculateBalances();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading')}</span>
      </div>
    );
  }

  const inactiveTowns = towns.filter(t => !empire[t.id]);

  return (
    <div className="space-y-6 text-neutral-dark">
      {/* Intestazione */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          {t('production.title')}
        </h1>
        <p className="text-gray-700 text-sm mt-1">
          {t('production.subtitle')}
        </p>
      </div>

        {/* Form Aggiunta Città */}
        {inactiveTowns.length > 0 && (
          <div className="flex items-center space-x-2 bg-white border border-primary/20 p-2 rounded-lg">
            <select
              value={selectedTownToAdd}
              onChange={(e) => setSelectedTownToAdd(e.target.value)}
              className="bg-white text-neutral-dark text-sm py-1.5 px-3 rounded border border-primary/20 focus:border-primary outline-none"
            >
              <option value="">{t('production.add_town_default')}</option>
              {inactiveTowns.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddTown}
              disabled={!selectedTownToAdd}
              className="bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-neutral-dark font-bold p-2 rounded transition-colors duration-150"
              title={t('production.add_town_default')}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Switch Tab */}
      <div className="flex space-x-2 border-b border-primary/20 pb-px">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2.5 font-serif font-bold text-sm tracking-wider uppercase border-t border-l border-r rounded-t-lg transition-colors ${
            activeTab === 'global'
              ? 'bg-white text-primary border-primary/20'
              : 'text-gray-600 hover:text-primary border-transparent'
          }`}
        >
          {t('production.tab_global')}
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2.5 font-serif font-bold text-sm tracking-wider uppercase border-t border-l border-r rounded-t-lg transition-colors ${
            activeTab === 'branches'
              ? 'bg-white text-primary border-primary/20'
              : 'text-gray-600 hover:text-primary border-transparent'
          }`}
        >
          {t('production.tab_branches')} ({Object.keys(empire).length})
        </button>
      </div>

      {/* TAB 1: RIEPILOGO IMPERO */}
      {activeTab === 'global' && (
        <div className="space-y-6">
          {/* Card Riepilogo Finanziario/Lavoratori */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-primary/20 rounded-lg p-5 flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xs text-gray-700 uppercase tracking-widest font-bold">{t('production.maintenance_cost')}</p>
                <p className="text-xl font-bold text-danger font-mono inline-flex items-center">
                  -{totalMaintenance}
                  <img src="/images/gold.png" className="h-4.5 w-4.5 object-contain ml-1 inline-block align-middle" alt="gold" />
                </p>
              </div>
            </div>
            <div className="bg-white border border-primary/20 rounded-lg p-5 flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xs text-gray-700 uppercase tracking-widest font-bold">{t('production.total_workers')}</p>
                <p className="text-xl font-bold text-success font-mono">
                  {totalWorkers} <span className="text-xs text-gray-700 font-sans font-normal">{t('production.workers')}</span>
                </p>
              </div>
            </div>
            <div className="bg-white border border-primary/20 rounded-lg p-5 flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xs text-gray-700 uppercase tracking-widest font-bold">{t('production.active_cities')}</p>
                <p className="text-xl font-bold text-neutral-dark font-mono">
                  {Object.keys(empire).length} <span className="text-xs text-gray-700 font-sans font-normal">{t('production.branches')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tabella Bilancio Risorse */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-background border-b border-primary/20">
              <h2 className="text-lg font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('production.global_balance')}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary/15">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">{t('production.resource')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">
                      <span className="inline-flex items-center justify-center gap-1">
                        {t('production.prod_day')}
                        <span className="mx-1">/</span>
                        <GameIcon type="hourglass" className="h-4.5 w-4.5" />
                      </span>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">
                      <span className="inline-flex items-center justify-center gap-1">
                        {t('production.cons_day')}
                        <span className="mx-1">/</span>
                        <GameIcon type="hourglass" className="h-4.5 w-4.5" />
                      </span>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">
                      <span className="inline-flex items-center justify-center gap-1">
                        {t('production.net_day')}
                        <span className="mx-1">/</span>
                        <GameIcon type="hourglass" className="h-4.5 w-4.5" />
                      </span>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">{t('production.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {goods.map((good) => {
                    const balance = globalBalances[good.id] || { produced: 0, consumed: 0, net: 0 };
                    if (balance.produced === 0 && balance.consumed === 0) return null; // Nasconde le risorse non movimentate
                    return (
                      <tr key={good.id} className="hover:bg-primary/5 bg-background transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/database/goods/${good.id}`} className="inline-flex items-center text-sm font-semibold text-neutral-dark hover:text-primary transition-colors gap-2">
                            <img src={getGoodImagePath(good.id)} className="h-5 w-5 object-contain" alt="" />
                            <span>{good.name}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-success">
                          +{balance.produced.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-danger">
                          -{balance.consumed.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-mono font-bold ${
                          balance.net > 0 ? 'text-success' : balance.net < 0 ? 'text-danger' : 'text-gray-600'
                        }`}>
                          {balance.net > 0 ? '+' : ''}{balance.net.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-0.5 text-3xs font-bold uppercase rounded-full ${
                            balance.net > 0 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {balance.net > 0 ? 'Surplus' : 'Deficit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {Object.values(globalBalances).every(b => b.produced === 0 && b.consumed === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-600 text-sm italic">
                        {t('production.empty_empire')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTIONE FILIALI */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          {Object.keys(empire).length === 0 ? (
            <div className="bg-white border border-primary/20 rounded-lg p-12 text-center text-gray-700 italic">
              {t('production.empty_towns')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {Object.keys(empire).map((townId) => {
                const townObj = towns.find(t => t.id === townId);
                const townReport = branchReports[townId] || { maintenance: 0, workers: 0, balances: {} };
                const townState = empire[townId];

                if (!townObj) return null;

                return (
                  <div key={townId} className="bg-white border border-primary/20 rounded-lg shadow-lg overflow-hidden">
                    {/* Header Filiale */}
                    <div className="px-6 py-4 bg-background border-b border-primary/20 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <Link to={`/database/towns/${townObj.id}`} className="hover:underline">
                          <h3 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                            {townObj.name}
                          </h3>
                        </Link>
                        <p className="text-3xs text-gray-700 font-semibold uppercase tracking-widest mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span>{townObj.isRiverTown ? t('production.river') : t('production.sea')}</span>
                          <span>•</span>
                          <span className="inline-flex items-center">
                            {t('database_businesses.columns.maintenance')}: -{townReport.maintenance}
                            <img src="/images/gold.png" className="h-3 w-3 object-contain ml-0.5 inline-block align-middle" alt="gold" />
                            <span className="mx-0.5">/</span>
                            <GameIcon type="hourglass" className="h-3 w-3" />
                          </span>
                          <span>•</span>
                          <span>{t('database_businesses.columns.workers')}: {townReport.workers}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveTown(townId)}
                        className="text-gray-500 hover:text-danger p-1.5 rounded hover:bg-danger/10 transition-colors"
                        title="Rimuovi Città"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Fabbriche Edificabili */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-primary/10 pb-1">
                          {t('database_businesses.title')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {businesses.map((business) => {
                            const isSpecialty = business.outputs.some((out: any) => townObj.produces.includes(out.goodId));
                            const count = townState[business.id] || 0;
                            return (
                              <div
                                key={business.id}
                                className={`p-3 rounded border flex flex-col justify-between space-y-2 ${
                                  count > 0 ? 'bg-secondary/10 border-secondary/50' : 'bg-background border-primary/10'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Link to={`/database/businesses/${business.id}`} className="text-xs font-semibold text-neutral-dark block leading-tight hover:text-primary transition-colors">
                                      {business.name}
                                    </Link>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider block mt-1 ${
                                      isSpecialty ? 'text-success' : 'text-amber-850'
                                    }`}>
                                      {isSpecialty ? t('production.optimal') : t('production.penalty')}
                                    </span>
                                  </div>
                                  {count > 0 && (
                                    <span className="bg-secondary text-neutral-dark text-xs font-bold px-1.5 py-0.5 rounded">
                                      x{count}
                                    </span>
                                  )}
                                </div>

                                {/* Controlli +/- */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleUpdateBusinessCount(townId, business.id, -1)}
                                    className="bg-background hover:bg-primary/15 border border-primary/25 text-gray-700 hover:text-primary font-bold h-7 w-7 rounded flex items-center justify-center transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="text-sm font-mono font-bold w-6 text-center text-neutral-dark">{count}</span>
                                  <button
                                    onClick={() => handleUpdateBusinessCount(townId, business.id, 1)}
                                    className="bg-secondary hover:bg-secondary/90 text-neutral-dark font-bold h-7 w-7 rounded flex items-center justify-center transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bilancio Locale Città */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-primary/10 pb-1">
                          {t('production.local_balance')}
                        </h4>
                        <div className="bg-background rounded border border-primary/15 p-4 h-[350px] overflow-y-auto space-y-2">
                          {Object.keys(townReport.balances).map((goodId) => {
                            const val = townReport.balances[goodId] || 0;
                            if (val === 0) return null;
                            const goodObj = goods.find(g => g.id === goodId);
                            return (
                              <div key={goodId} className="flex justify-between items-center bg-card px-3 py-2 rounded border border-primary/10">
                                <span className="text-xs font-semibold text-neutral-dark inline-flex items-center gap-1.5">
                                  <img src={getGoodImagePath(goodId)} className="h-4.5 w-4.5 object-contain" alt="" />
                                  {goodObj ? goodObj.name : goodId}
                                </span>
                                <span className={`text-sm font-bold font-mono inline-flex items-center ${
                                  val > 0 ? 'text-success' : 'text-danger'
                                }`}>
                                  {val > 0 ? '+' : ''}{val.toFixed(2)}/
                                  <GameIcon type="hourglass" className="h-3.5 w-3.5 ml-0.5" />
                                </span>
                              </div>
                            );
                          })}
                          {Object.values(townReport.balances).every(v => v === 0) && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 text-xs italic">
                              <Info className="h-8 w-8 text-primary mb-2" />
                              {t('production.empty_local')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Production;
