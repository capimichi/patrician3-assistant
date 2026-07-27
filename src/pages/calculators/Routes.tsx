import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import type { Town } from '../../types';
import { ArrowRightLeft, ShieldAlert } from 'lucide-react';

interface TradeRecommendation {
  goodId: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  buyRange: [number, number];
  sellRange: [number, number];
  isHighPriority: boolean;
}

const Routes: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { townService, goodService } = useServices();

  const [towns, setTowns] = useState<Town[]>([]);
  const [goods, setGoods] = useState<any[]>([]);
  const [originId, setOriginId] = useState<string>('');
  const [destId, setDestId] = useState<string>('');
  const [customPrices, setCustomPrices] = useState<{ [goodId: string]: { buy: number; sell: number } }>({});
  const [cargoSize, setCargoSize] = useState<number>(100);
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
        
        if (loadedTowns.length > 1) {
          setOriginId(loadedTowns[0].id);
          setDestId(loadedTowns[1].id);
        }
      } catch (err) {
        console.error('Errore caricamento dati per rotte', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [townService, goodService, currentLang]);

  const originTown = towns.find(t => t.id === originId);
  const destTown = towns.find(t => t.id === destId);

  // Inizializza i prezzi reali mockati in base ai consigliati quando cambia la coppia di città
  useEffect(() => {
    if (originTown && destTown) {
      const initialPrices: typeof customPrices = {};
      goods.forEach(good => {
        initialPrices[good.id] = {
          buy: good.buyPriceRange[1],  // Imposta il massimo acquisto consigliato come base
          sell: good.sellPriceRange[0] // Imposta il minimo vendita consigliato come base
        };
      });
      setCustomPrices(initialPrices);
    }
  }, [originId, destId, goods]);

  const handlePriceChange = (goodId: string, field: 'buy' | 'sell', value: number) => {
    setCustomPrices(prev => ({
      ...prev,
      [goodId]: {
        ...prev[goodId],
        [field]: Math.max(0, value)
      }
    }));
  };

  // Calcola i suggerimenti per la rotta: Città A -> Città B
  const getRecommendations = (): TradeRecommendation[] => {
    if (!originTown || !destTown) return [];

    const recs: TradeRecommendation[] = [];

    goods.forEach(good => {
      // Regola: Compra in A se A produce quella merce, e vendi in B se B NON la produce.
      // Più in generale, consiglia lo scambio se A produce efficacemente e B no.
      const isProducedInOrigin = originTown.produces.includes(good.id);
      const isProducedInDest = destTown.produces.includes(good.id);

      if (isProducedInOrigin && !isProducedInDest && !good.isImported) {
        // Le merci di consumo di massa (birra, grano, utensili, sale, legno) sono ad alta priorità
        const isHighPriority = ['beer', 'grain', 'iron_goods', 'salt', 'timber'].includes(good.id);
        
        const priceData = customPrices[good.id] || { buy: good.buyPriceRange[1], sell: good.sellPriceRange[0] };

        recs.push({
          goodId: good.id,
          name: good.name,
          buyPrice: priceData.buy,
          sellPrice: priceData.sell,
          buyRange: good.buyPriceRange,
          sellRange: good.sellPriceRange,
          isHighPriority
        });
      }
    });

    return recs;
  };

  const recommendations = getRecommendations();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-dark">
      {/* Intestazione */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          Ottimizzatore di Rotte Commerciali
        </h1>
        <p className="text-gray-700 text-sm mt-1">
          Seleziona due città commerciali per identificare istantaneamente le merci con il maggior potenziale di profitto.
        </p>
      </div>

      {/* Selettori Città */}
      <div className="bg-white border border-primary/20 rounded-lg p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4 flex-grow">
          {/* Origine */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Città di Partenza (Origine)</label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full bg-white text-neutral-dark text-sm py-2 px-3 rounded border border-primary/20 focus:border-primary outline-none font-semibold"
            >
              {towns.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-6">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
          </div>

          {/* Destinazione */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Città di Arrivo (Destinazione)</label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full bg-white text-neutral-dark text-sm py-2 px-3 rounded border border-primary/20 focus:border-primary outline-none font-semibold"
            >
              {towns.filter(t => t.id !== originId).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Spazio Stiva Simulato */}
        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Stiva Simulata (Barili)</label>
          <input
            type="number"
            value={cargoSize}
            min={1}
            max={5000}
            onChange={(e) => setCargoSize(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-white text-neutral-dark text-sm py-2 px-3 rounded border border-primary/20 focus:border-primary outline-none font-semibold font-mono"
          />
        </div>
      </div>

      {/* Restrizioni Canali Fluviali */}
      {((originTown?.isRiverTown && !destTown?.isRiverTown) || (!originTown?.isRiverTown && destTown?.isRiverTown)) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold uppercase tracking-wider mb-0.5">Avviso Navigazione Fluviale</p>
            <p>Una delle due città selezionate è situata nell'entroterra fluviale. Ricordati che non potrai percorrere questa rotta con un convoglio contenente navi Cog o Holk. Dovrai impiegare esclusivamente Snaikka o Crayer.</p>
          </div>
        </div>
      )}

      {/* Tabella Raccomandazioni */}
      <div className="bg-white border border-primary/20 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-background border-b border-primary/20 flex justify-between items-center">
          <h2 className="text-lg font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
            Merci Consigliate per il Viaggio (Partenza da <Link to={`/database/towns/${originTown?.id}`} className="hover:underline text-primary">{originTown?.name}</Link>)
          </h2>
          <span className="text-xs text-primary font-bold uppercase tracking-wider">
            Margini di Profitto
          </span>
        </div>

        {recommendations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary/15">
              <thead className="bg-primary/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Merce</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Prezzo Acquisto Consigliato</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Prezzo Vendita Consigliato</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Acquisto Effettivo (A)</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Vendita Effettiva (B)</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Margine / Barile</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Profitto Stimato ({cargoSize} Barili)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10 bg-background">
                {recommendations.map((rec) => {
                  const margin = rec.sellPrice - rec.buyPrice;
                  const totalProfit = margin * cargoSize;

                  return (
                    <tr key={rec.goodId} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">📦</span>
                          <div>
                            <Link to={`/database/goods/${rec.goodId}`} className="text-sm font-semibold text-neutral-dark block hover:text-primary transition-colors">
                              {rec.name}
                            </Link>
                            {rec.isHighPriority && (
                              <span className="text-[9px] font-bold text-success uppercase tracking-wider">Largo Consumo</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-700 font-mono">
                        {rec.buyRange[0]}-{rec.buyRange[1]} g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-700 font-mono">
                        {rec.sellRange[0]}-{rec.sellRange[1]} g
                      </td>
                      {/* Input Prezzo Acquisto Reale */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={rec.buyPrice}
                          min={0}
                          onChange={(e) => handlePriceChange(rec.goodId, 'buy', parseInt(e.target.value) || 0)}
                          className="w-20 bg-white text-center text-sm py-1 rounded border border-primary/20 focus:border-primary outline-none font-mono text-success font-bold"
                        />
                      </td>
                      {/* Input Prezzo Vendita Reale */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={rec.sellPrice}
                          min={0}
                          onChange={(e) => handlePriceChange(rec.goodId, 'sell', parseInt(e.target.value) || 0)}
                          className="w-20 bg-white text-center text-sm py-1 rounded border border-primary/20 focus:border-primary outline-none font-mono text-primary font-bold"
                        />
                      </td>
                      {/* Margine Netto per barile */}
                      <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-mono font-bold ${
                        margin > 0 ? 'text-success' : margin < 0 ? 'text-danger' : 'text-gray-600'
                      }`}>
                        {margin > 0 ? '+' : ''}{margin} g
                      </td>
                      {/* Profitto complessivo sulla stiva */}
                      <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-mono font-bold ${
                        totalProfit > 0 ? 'text-success' : totalProfit < 0 ? 'text-danger' : 'text-gray-600'
                      }`}>
                        {totalProfit > 0 ? '+' : ''}{totalProfit.toLocaleString()} <span className="text-primary font-normal text-xs font-serif">g</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-700 text-sm italic">
            Nessuna merce consigliata trovata. Questa coppia di città ha produzioni simili o non ci sono specialità compatibili per la partenza da {originTown?.name}. Prova a selezionare un'altra rotta o invertire l'ordine.
          </div>
        )}
      </div>
    </div>
  );
};

export default Routes;
