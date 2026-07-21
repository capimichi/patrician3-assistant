import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import type { Town } from '../../types';
import { Compass, Waves, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';

const Towns: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { townService, goodService } = useServices();

  const [towns, setTowns] = useState<Town[]>([]);
  const [goods, setGoods] = useState<any[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const loadedTowns = await townService.getTowns();
        const loadedGoods = await goodService.getGoods(currentLang);
        setTowns(loadedTowns);
        setGoods(loadedGoods);
        if (loadedTowns.length > 0) {
          setSelectedTownId(loadedTowns[0].id);
        }
      } catch (err) {
        console.error('Errore nel caricamento delle città e delle merci', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [townService, goodService, currentLang]);

  const selectedTown = towns.find(t => t.id === selectedTownId);

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
          Database delle Città
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Seleziona una delle città storiche della Lega Anseatica per visualizzarne la posizione strategica e le capacità industriali.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista Griglia delle Città */}
        <div className="lg:col-span-1 bg-medieval-slate border border-medieval-gold/20 rounded-lg p-4 shadow-lg h-[600px] overflow-y-auto">
          <h2 className="text-md font-bold font-serif text-medieval-gold border-b border-medieval-gold/15 pb-2 mb-3 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
            <Compass className="h-5 w-5 text-medieval-gold" />
            <span>Città dell'Hansa</span>
          </h2>
          <div className="space-y-1.5">
            {towns.map((town) => (
              <button
                key={town.id}
                onClick={() => setSelectedTownId(town.id)}
                className={`w-full text-left px-4 py-2.5 rounded transition-all duration-150 flex justify-between items-center ${
                  selectedTownId === town.id
                    ? 'bg-medieval-gold text-medieval-dark font-bold'
                    : 'bg-medieval-dark/30 hover:bg-medieval-gold/10 text-gray-300'
                }`}
              >
                <span>{town.name}</span>
                {town.isRiverTown && (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    selectedTownId === town.id
                      ? 'bg-medieval-dark text-medieval-gold'
                      : 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                  }`}>
                    Fiume
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scheda di Dettaglio Città */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTown ? (
            <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg p-6 space-y-6">
              {/* Header Scheda */}
              <div className="border-b border-medieval-gold/20 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-3xl font-bold font-serif text-medieval-gold" style={{ fontFamily: "'Cinzel', serif" }}>
                    {selectedTown.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1 font-semibold">
                    <span className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 text-medieval-gold mr-1" />
                      Coord: X={selectedTown.coordinate?.x || '-'}, Y={selectedTown.coordinate?.y || '-'}
                    </span>
                    <span className="flex items-center">
                      <Waves className="h-3.5 w-3.5 text-blue-400 mr-1" />
                      {selectedTown.isRiverTown ? 'Porto Fluviale (River)' : 'Porto Marittimo (Sea)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Avviso Fiume */}
              {selectedTown.isRiverTown && (
                <div className="bg-blue-950/20 border border-blue-500/20 rounded p-4 text-xs text-blue-300 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold uppercase tracking-wider mb-0.5">Restrizione Fluviale</p>
                    <p>Questa città è raggiungibile solo risalendo fiumi poco profondi. Le navi di grandi dimensioni (Cog e Holk) non possono attraccare qui. Per la navigazione e il trasporto merci a {selectedTown.name} è necessario utilizzare esclusivamente navi fluviali come <strong>Snaikka</strong> o <strong>Crayer</strong>.</p>
                  </div>
                </div>
              )}

              {/* Merci Prodotte Efficacemente */}
              <div className="space-y-3">
                <h4 className="text-sm text-medieval-gold font-bold uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-medieval-forestLight" />
                  <span>Specializzazioni della Città (Produzione Efficace)</span>
                </h4>
                <p className="text-gray-400 text-xs">
                  Le seguenti merci vengono prodotte localmente con la massima efficienza (100% della resa base) e non subiscono penalità.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {selectedTown.produces.map((goodId) => {
                    const goodObj = goods.find(g => g.id === goodId);
                    return (
                      <div key={goodId} className="bg-medieval-dark/40 border border-medieval-forest/20 rounded p-3 flex items-center space-x-3">
                        <span className="text-lg">📦</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-200">{goodObj ? goodObj.name : goodId}</p>
                          <p className="text-2xs text-medieval-forestLight font-bold uppercase">Nessuna Penalità</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Altre Merci (Con Penalità) */}
              <div className="space-y-3 border-t border-medieval-gold/10 pt-6">
                <h4 className="text-sm text-medieval-rubyLight font-bold uppercase tracking-wider flex items-center space-x-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-medieval-rubyLight" />
                  <span>Altre Merci (Produzione con Penalità del 25%)</span>
                </h4>
                <p className="text-gray-400 text-xs">
                  Qualsiasi altra impresa edificata a {selectedTown.name} al di fuori di quelle specializzate subirà una penalità del 25% sul volume di produzione giornaliero a causa della scarsità di materie prime o di manodopera locale specializzata.
                </p>
                <div className="bg-medieval-dark/20 border border-medieval-ruby/15 rounded p-3 text-2xs text-gray-400 leading-relaxed font-medium">
                  Esempio: Se costruisci una Birreria a {selectedTown.name} e la birra non è una sua specialità, la fabbrica produrrà <strong>1.5</strong> barili al giorno anziché la produzione base di <strong>2.0</strong>, pur mantenendo intatti i consumi di materie prime.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 italic">
              Nessuna città selezionata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Towns;
