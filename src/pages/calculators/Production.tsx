import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import type { Town } from '../../types';
import { Factory, Plus, Trash2, Coins, TrendingUp, Info } from 'lucide-react';

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

        // Calcola efficacia (penalità 25% se la merce non è prodotta localmente)
        const isSpecialty = town.produces.includes(business.producedGoodId);
        const dailyProd = business.baseProductionPerDay * (isSpecialty ? 1.0 : 0.75) * count;

        // Somma produzione
        balances[business.producedGoodId].produced += dailyProd;
        branchReports[townId].balances[business.producedGoodId] += dailyProd;

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
      <div className="flex justify-center items-center h-64 text-medieval-gold">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medieval-gold"></div>
        <span className="ml-3 font-serif uppercase tracking-wider">{t('common.loading')}</span>
      </div>
    );
  }

  const inactiveTowns = towns.filter(t => !empire[t.id]);

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-medieval-gold tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
            Calcolatore di Produzione
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestisci la rete commerciale anseatica simulando fabbriche, consumi e logistica delle risorse.
          </p>
        </div>

        {/* Form Aggiunta Città */}
        {inactiveTowns.length > 0 && (
          <div className="flex items-center space-x-2 bg-medieval-slate border border-medieval-gold/20 p-2 rounded-lg">
            <select
              value={selectedTownToAdd}
              onChange={(e) => setSelectedTownToAdd(e.target.value)}
              className="bg-medieval-dark text-gray-300 text-sm py-1.5 px-3 rounded border border-medieval-gold/10 focus:border-medieval-gold outline-none"
            >
              <option value="">-- Aggiungi Città --</option>
              {inactiveTowns.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddTown}
              disabled={!selectedTownToAdd}
              className="bg-medieval-gold hover:bg-medieval-goldLight disabled:opacity-50 text-medieval-dark font-bold p-2 rounded transition-colors duration-150"
              title="Aggiungi Città"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Switch Tab */}
      <div className="flex space-x-2 border-b border-medieval-gold/20 pb-px">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2.5 font-serif font-bold text-sm tracking-wider uppercase border-t border-l border-r rounded-t-lg transition-colors ${
            activeTab === 'global'
              ? 'bg-medieval-slate text-medieval-gold border-medieval-gold/20'
              : 'text-gray-400 hover:text-medieval-gold border-transparent'
          }`}
        >
          Riepilogo Impero
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2.5 font-serif font-bold text-sm tracking-wider uppercase border-t border-l border-r rounded-t-lg transition-colors ${
            activeTab === 'branches'
              ? 'bg-medieval-slate text-medieval-gold border-medieval-gold/20'
              : 'text-gray-400 hover:text-medieval-gold border-transparent'
          }`}
        >
          Gestione Filiali ({Object.keys(empire).length})
        </button>
      </div>

      {/* TAB 1: RIEPILOGO IMPERO */}
      {activeTab === 'global' && (
        <div className="space-y-6">
          {/* Card Riepilogo Finanziario/Lavoratori */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg p-5 flex items-center space-x-4">
              <div className="bg-medieval-gold/10 p-3 rounded-lg">
                <Coins className="h-6 w-6 text-medieval-gold" />
              </div>
              <div>
                <p className="text-3xs text-gray-500 uppercase tracking-widest font-bold">Costi di Manutenzione Giornalieri</p>
                <p className="text-xl font-bold text-medieval-rubyLight font-mono">
                  -{totalMaintenance} <span className="text-xs text-medieval-gold font-serif">g</span>
                </p>
              </div>
            </div>
            <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg p-5 flex items-center space-x-4">
              <div className="bg-medieval-gold/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-medieval-gold" />
              </div>
              <div>
                <p className="text-3xs text-gray-500 uppercase tracking-widest font-bold">Dipendenti Totali</p>
                <p className="text-xl font-bold text-medieval-forestLight font-mono">
                  {totalWorkers} <span className="text-xs text-gray-400 font-serif font-normal">marinai/lavoratori</span>
                </p>
              </div>
            </div>
            <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg p-5 flex items-center space-x-4">
              <div className="bg-medieval-gold/10 p-3 rounded-lg">
                <Factory className="h-6 w-6 text-medieval-gold" />
              </div>
              <div>
                <p className="text-3xs text-gray-500 uppercase tracking-widest font-bold">Città Attive</p>
                <p className="text-xl font-bold text-gray-200 font-mono">
                  {Object.keys(empire).length} <span className="text-xs text-gray-400 font-serif font-normal">filiali</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tabella Bilancio Risorse */}
          <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-medieval-dark/50 border-b border-medieval-gold/20">
              <h2 className="text-lg font-bold font-serif text-medieval-gold" style={{ fontFamily: "'Cinzel', serif" }}>
                Bilancio Globale Risorse
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-medieval-gold/10">
                <thead className="bg-medieval-dark/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-medieval-gold uppercase tracking-wider">Risorsa</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Produzione Totale / Giorno</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Consumo Totale / Giorno</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Bilancio Netto / Giorno</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-medieval-gold/5">
                  {goods.map((good) => {
                    const balance = globalBalances[good.id] || { produced: 0, consumed: 0, net: 0 };
                    if (balance.produced === 0 && balance.consumed === 0) return null; // Nasconde le risorse non movimentate
                    return (
                      <tr key={good.id} className="hover:bg-medieval-gold/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-200">📦 {good.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-medieval-forestLight">
                          +{balance.produced.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-medieval-rubyLight">
                          -{balance.consumed.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-mono font-bold ${
                          balance.net > 0 ? 'text-medieval-forestLight' : balance.net < 0 ? 'text-medieval-rubyLight' : 'text-gray-400'
                        }`}>
                          {balance.net > 0 ? '+' : ''}{balance.net.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-0.5 text-3xs font-bold uppercase rounded-full ${
                            balance.net > 0 ? 'bg-medieval-forest/20 text-medieval-forestLight border border-medieval-forest/30' : 'bg-medieval-ruby/20 text-medieval-rubyLight border border-medieval-ruby/30'
                          }`}>
                            {balance.net > 0 ? 'Surplus' : 'Deficit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {Object.values(globalBalances).every(b => b.produced === 0 && b.consumed === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm italic">
                        Nessuna impresa costruita nell'impero commerciale. Vai in "Gestione Filiali" per edificarne alcune.
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
            <div className="bg-medieval-slate border border-medieval-gold/15 rounded-lg p-12 text-center text-gray-500 italic">
              Nessuna città aggiunta al tuo impero. Usa il menu in alto a destra per iniziare.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {Object.keys(empire).map((townId) => {
                const townObj = towns.find(t => t.id === townId);
                const townReport = branchReports[townId] || { maintenance: 0, workers: 0, balances: {} };
                const townState = empire[townId];

                if (!townObj) return null;

                return (
                  <div key={townId} className="bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg overflow-hidden">
                    {/* Header Filiale */}
                    <div className="px-6 py-4 bg-medieval-dark/50 border-b border-medieval-gold/20 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="text-xl font-bold font-serif text-medieval-gold" style={{ fontFamily: "'Cinzel', serif" }}>
                          {townObj.name}
                        </h3>
                        <p className="text-3xs text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                          {townObj.isRiverTown ? 'Fluviale' : 'Marittimo'} • Costo: -{townReport.maintenance}g/giorno • Lavoratori: {townReport.workers}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveTown(townId)}
                        className="text-gray-400 hover:text-medieval-rubyLight p-1.5 rounded hover:bg-medieval-ruby/10 transition-colors"
                        title="Rimuovi Città"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Fabbriche Edificabili */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-medieval-gold uppercase tracking-wider border-b border-medieval-gold/10 pb-1">
                          Laboratori e Fabbriche
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {businesses.map((business) => {
                            const isSpecialty = townObj.produces.includes(business.producedGoodId);
                            const count = townState[business.id] || 0;
                            return (
                              <div
                                key={business.id}
                                className={`p-3 rounded border flex flex-col justify-between space-y-2 ${
                                  count > 0 ? 'bg-medieval-gold/5 border-medieval-gold/30' : 'bg-medieval-dark/20 border-medieval-gold/5'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-xs font-semibold text-gray-200 block leading-tight">{business.name}</span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider block mt-1 ${
                                      isSpecialty ? 'text-medieval-forestLight' : 'text-yellow-600'
                                    }`}>
                                      {isSpecialty ? 'Ottimale' : 'Penalità -25%'}
                                    </span>
                                  </div>
                                  {count > 0 && (
                                    <span className="bg-medieval-gold text-medieval-dark text-xs font-bold px-1.5 py-0.5 rounded">
                                      x{count}
                                    </span>
                                  )}
                                </div>

                                {/* Controlli +/- */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleUpdateBusinessCount(townId, business.id, -1)}
                                    className="bg-medieval-dark hover:bg-medieval-gold/10 border border-medieval-gold/20 text-gray-400 hover:text-medieval-gold font-bold h-7 w-7 rounded flex items-center justify-center transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="text-sm font-mono font-bold w-6 text-center text-gray-200">{count}</span>
                                  <button
                                    onClick={() => handleUpdateBusinessCount(townId, business.id, 1)}
                                    className="bg-medieval-gold hover:bg-medieval-goldLight text-medieval-dark font-bold h-7 w-7 rounded flex items-center justify-center transition-colors"
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
                        <h4 className="text-xs font-bold text-medieval-gold uppercase tracking-wider border-b border-medieval-gold/10 pb-1">
                          Bilancio Locale delle Risorse
                        </h4>
                        <div className="bg-medieval-dark/30 rounded border border-medieval-gold/10 p-4 h-[350px] overflow-y-auto space-y-2">
                          {Object.keys(townReport.balances).map((goodId) => {
                            const val = townReport.balances[goodId] || 0;
                            if (val === 0) return null;
                            const goodObj = goods.find(g => g.id === goodId);
                            return (
                              <div key={goodId} className="flex justify-between items-center bg-medieval-dark/40 px-3 py-2 rounded border border-medieval-gold/5">
                                <span className="text-xs font-semibold text-gray-300">
                                  📦 {goodObj ? goodObj.name : goodId}
                                </span>
                                <span className={`text-sm font-bold font-mono ${
                                  val > 0 ? 'text-medieval-forestLight' : 'text-medieval-rubyLight'
                                }`}>
                                  {val > 0 ? '+' : ''}{val.toFixed(2)}/g
                                </span>
                              </div>
                            );
                          })}
                          {Object.values(townReport.balances).every(v => v === 0) && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 text-xs italic">
                              <Info className="h-8 w-8 text-gray-600 mb-2" />
                              Nessuna risorsa movimentata. Aggiungi laboratori per simulare la logistica locale.
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
