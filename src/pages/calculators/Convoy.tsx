import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import type { LocalizedShipType } from '../../services/ShipService';
import { Anchor, ShieldAlert, ShieldCheck, Coins, Users, Compass } from 'lucide-react';

interface ConvoyFleet {
  [shipId: string]: {
    count: number;
    armType: 'none' | 'partial' | 'max';
  };
}

const Convoy: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { shipService } = useServices();

  const [ships, setShips] = useState<LocalizedShipType[]>([]);
  const [fleet, setFleet] = useState<ConvoyFleet>({});
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const loadedShips = await shipService.getShips(currentLang);
        setShips(loadedShips);
        
        // Inizializza flotta vuota
        const initialFleet: ConvoyFleet = {};
        loadedShips.forEach(s => {
          initialFleet[s.id] = { count: 0, armType: 'none' };
        });
        setFleet(initialFleet);
      } catch (err) {
        console.error('Errore nel caricamento delle navi', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [shipService, currentLang]);

  const handleUpdateShipCount = (shipId: string, value: number) => {
    setFleet(prev => ({
      ...prev,
      [shipId]: {
        ...prev[shipId],
        count: Math.max(0, (prev[shipId]?.count || 0) + value)
      }
    }));
  };

  const handleUpdateArmType = (shipId: string, armType: 'none' | 'partial' | 'max') => {
    setFleet(prev => ({
      ...prev,
      [shipId]: {
        ...prev[shipId],
        armType
      }
    }));
  };

  // Esegue i calcoli complessivi del convoglio
  const calculateConvoyStats = () => {
    let totalGrossCapacity = 0;
    let totalNetCapacity = 0;
    let totalMinSailors = 0;
    let totalMaxSailors = 0;
    let totalWeapons = 0;
    let totalDailyCost = 0;
    let isConvoyRiverFriendly = true;
    let shipCount = 0;

    Object.keys(fleet).forEach(shipId => {
      const shipState = fleet[shipId];
      if (!shipState || shipState.count <= 0) return;

      const shipInfo = ships.find(s => s.id === shipId);
      if (!shipInfo) return;

      const count = shipState.count;
      shipCount += count;

      // Idoneità Fluviale: se anche una sola nave non è fluviale, l'intero convoglio non può risalire i fiumi
      if (!shipInfo.isRiverFriendly) {
        isConvoyRiverFriendly = false;
      }

      // Capacità Lorda
      const grossCap = shipInfo.baseCapacity * count;
      totalGrossCapacity += grossCap;

      // Armamento in base alla configurazione
      let weaponsCount = 0;
      if (shipState.armType === 'partial') {
        weaponsCount = Math.floor(shipInfo.maxWeapons / 2) * count;
      } else if (shipState.armType === 'max') {
        weaponsCount = shipInfo.maxWeapons * count;
      }
      totalWeapons += weaponsCount;

      // Regola stiva netta: ogni arma installata riduce lo spazio di stiva di 10 barili
      const netCap = grossCap - (weaponsCount * 10);
      totalNetCapacity += Math.max(0, netCap);

      // Marinai minimi e massimi
      totalMinSailors += shipInfo.minSailors * count;
      totalMaxSailors += shipInfo.maxSailors * count;

      // Manutenzione giornaliera flotta
      totalDailyCost += shipInfo.dailyCost * count;
    });

    // Aggiunge i salari dei marinai al costo giornaliero flotta (es. 2 monete d'oro al giorno per marinaio, assumendo equipaggio al massimo)
    // Se non ci sono navi, i marinai sono 0
    const sailorSalary = shipCount > 0 ? (totalMaxSailors * 2) : 0;
    totalDailyCost += sailorSalary;

    return {
      totalGrossCapacity,
      totalNetCapacity,
      totalMinSailors,
      totalMaxSailors,
      totalWeapons,
      totalDailyCost,
      isConvoyRiverFriendly,
      shipCount
    };
  };

  const {
    totalGrossCapacity,
    totalNetCapacity,
    totalMinSailors,
    totalMaxSailors,
    totalWeapons,
    totalDailyCost,
    isConvoyRiverFriendly,
    shipCount
  } = calculateConvoyStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-medieval-gold">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medieval-gold"></div>
        <span className="ml-3 font-serif uppercase tracking-wider">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div>
        <h1 className="text-3xl font-extrabold text-medieval-gold tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          Gestore Convogli Navali
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Assembla la tua flotta commerciale e calcola lo spazio stiva effettivo in base all'equipaggiamento bellico.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Costruttore Convoglio (Impostazione navi) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-lg font-bold font-serif text-medieval-gold border-b border-medieval-gold/15 pb-2 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Anchor className="h-5 w-5 text-medieval-gold" />
              <span>Navi del Convoglio</span>
            </h2>

            <div className="space-y-6">
              {ships.map((ship) => {
                const state = fleet[ship.id] || { count: 0, armType: 'none' };
                return (
                  <div key={ship.id} className="bg-medieval-dark/40 border border-medieval-gold/10 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Info Nave */}
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">⛵</span>
                        <h3 className="text-lg font-bold text-gray-200 font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
                          {ship.name}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          ship.isRiverFriendly ? 'bg-blue-900/30 text-blue-300' : 'bg-orange-900/30 text-orange-300'
                        }`}>
                          {ship.isRiverFriendly ? 'Fluviale' : 'D\'alto Mare'}
                        </span>
                      </div>
                      <p className="text-2xs text-gray-400 font-medium">
                        Stiva Base: {ship.baseCapacity} • Marinai: {ship.minSailors}-{ship.maxSailors} • Armi Max: {ship.maxWeapons}
                      </p>
                    </div>

                    {/* Quantità e Armamento */}
                    <div className="flex flex-wrap items-center gap-6">
                      {/* Contatore Quantità */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateShipCount(ship.id, -1)}
                          className="bg-medieval-dark hover:bg-medieval-gold/10 border border-medieval-gold/20 text-gray-400 hover:text-medieval-gold font-bold h-8 w-8 rounded flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="text-sm font-mono font-bold w-6 text-center text-gray-200">{state.count}</span>
                        <button
                          onClick={() => handleUpdateShipCount(ship.id, 1)}
                          className="bg-medieval-gold hover:bg-medieval-goldLight text-medieval-dark font-bold h-8 w-8 rounded flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Selettore Armi */}
                      {state.count > 0 && (
                        <div className="flex items-center bg-medieval-dark/50 p-1 rounded border border-medieval-gold/10 text-xs font-semibold">
                          <button
                            onClick={() => handleUpdateArmType(ship.id, 'none')}
                            className={`px-2.5 py-1 rounded transition-colors ${
                              state.armType === 'none'
                                ? 'bg-medieval-gold text-medieval-dark font-bold'
                                : 'text-gray-400 hover:text-medieval-gold'
                            }`}
                          >
                            Nessuno
                          </button>
                          <button
                            onClick={() => handleUpdateArmType(ship.id, 'partial')}
                            className={`px-2.5 py-1 rounded transition-colors ${
                              state.armType === 'partial'
                                ? 'bg-medieval-gold text-medieval-dark font-bold'
                                : 'text-gray-400 hover:text-medieval-gold'
                            }`}
                          >
                            Medio
                          </button>
                          <button
                            onClick={() => handleUpdateArmType(ship.id, 'max')}
                            className={`px-2.5 py-1 rounded transition-colors ${
                              state.armType === 'max'
                                ? 'bg-medieval-gold text-medieval-dark font-bold'
                                : 'text-gray-400 hover:text-medieval-gold'
                            }`}
                          >
                            Massimo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quadro Statistiche Convoglio */}
        <div className="space-y-6">
          <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-lg font-bold font-serif text-medieval-gold border-b border-medieval-gold/15 pb-2 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Compass className="h-5 w-5 text-medieval-gold" />
              <span>Statistiche Flotta</span>
            </h2>

            {shipCount > 0 ? (
              <div className="space-y-5">
                {/* Status Canali Fluviali */}
                <div className="flex justify-between items-center border-b border-medieval-gold/10 pb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accesso Fiumi</span>
                  {isConvoyRiverFriendly ? (
                    <span className="bg-medieval-forest/20 text-medieval-forestLight text-2xs font-bold uppercase px-2.5 py-1 rounded border border-medieval-forest/30 flex items-center space-x-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Ottimale</span>
                    </span>
                  ) : (
                    <span className="bg-medieval-ruby/20 text-medieval-rubyLight text-2xs font-bold uppercase px-2.5 py-1 rounded border border-medieval-ruby/30 flex items-center space-x-1">
                      <ShieldAlert className="h-3 w-3" />
                      <span>Restrizione</span>
                    </span>
                  )}
                </div>

                {/* Stiva Lorda vs Netta */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span>Capacità di Stiva</span>
                    <span className="font-mono text-gray-300">{totalNetCapacity} / {totalGrossCapacity} barili</span>
                  </div>
                  <div className="w-full bg-medieval-dark rounded-full h-2 overflow-hidden border border-medieval-gold/10">
                    <div
                      className="bg-medieval-gold h-full rounded-full transition-all duration-300"
                      style={{ width: `${totalGrossCapacity > 0 ? (totalNetCapacity / totalGrossCapacity) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400 italic">
                    La stiva netta considera una riduzione di 10 barili per ogni cannone imbarcato.
                  </p>
                </div>

                {/* Equipaggio e Cannoni */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-medieval-gold/10 py-4">
                  <div>
                    <span className="text-3xs text-gray-500 font-bold uppercase tracking-widest block">Equipaggio (Min-Max)</span>
                    <span className="text-lg font-bold font-mono text-gray-200 flex items-center mt-1">
                      <Users className="h-4 w-4 mr-1.5 text-medieval-gold" />
                      {totalMinSailors}-{totalMaxSailors}
                    </span>
                  </div>
                  <div>
                    <span className="text-3xs text-gray-500 font-bold uppercase tracking-widest block">Cannoni Imbarcati</span>
                    <span className="text-lg font-bold font-mono text-gray-200 flex items-center mt-1">
                      ⚔️ {totalWeapons}
                    </span>
                  </div>
                </div>

                {/* Spesa Manutenzione */}
                <div className="flex justify-between items-center bg-medieval-dark/40 p-3 rounded border border-medieval-gold/10">
                  <div>
                    <span className="text-2xs text-gray-500 font-bold uppercase tracking-widest block">Spesa Giornaliera</span>
                    <span className="text-3xs text-gray-600 block mt-0.5">(Manutenzione + Salari)</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-medieval-rubyLight flex items-center">
                    <Coins className="h-4.5 w-4.5 mr-1.5 text-medieval-gold" />
                    -{totalDailyCost}g
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-xs italic">
                Nessuna nave nel convoglio commerciale. Usa i controlli a sinistra per aggiungere navi.
              </div>
            )}
          </div>

          {/* Avviso Fluviale Critico */}
          {!isConvoyRiverFriendly && (
            <div className="bg-medieval-ruby/10 border border-medieval-ruby/30 rounded-lg p-4 text-xs text-medieval-rubyLight flex items-start space-x-3 shadow-lg">
              <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold uppercase tracking-wider mb-0.5">Attenzione Fiumi</p>
                <p>Questo convoglio contiene navi non fluviali (Kogge o Holk) e <strong>non potrà risalire i fiumi</strong> per attraccare in città come <strong>Colonia, Torun, Ladoga o Novgorod</strong>. Dovrai dividere la flotta o utilizzare solo Snaikka e Crayer per quelle destinazioni.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Convoy;
