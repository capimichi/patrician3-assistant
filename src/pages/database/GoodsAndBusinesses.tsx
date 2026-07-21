import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { Sparkles, Info, Hammer } from 'lucide-react';

const GoodsAndBusinesses: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { goodService, businessService } = useServices();

  const [goods, setGoods] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedGoodId, setSelectedGoodId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const loadedGoods = await goodService.getGoods(currentLang);
        const loadedBusinesses = await businessService.getBusinesses(currentLang);
        setGoods(loadedGoods);
        setBusinesses(loadedBusinesses);
        // Pre-seleziona la prima merce
        if (loadedGoods.length > 0) {
          setSelectedGoodId(loadedGoods[0].id);
        }
      } catch (err) {
        console.error('Errore nel caricamento dei dati di merci e imprese', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [goodService, businessService, currentLang]);

  const selectedGood = goods.find(g => g.id === selectedGoodId);
  const associatedBusiness = businesses.find(b => b.producedGoodId === selectedGoodId);

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
      {/* Intestazione Pagina */}
      <div>
        <h1 className="text-3xl font-extrabold text-medieval-gold tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          Merci & Produzione Industriale
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Consulta i prezzi consigliati di compravendita e analizza le catene di produzione della Lega Anseatica.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabella Merci */}
        <div className="lg:col-span-2 bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-medieval-dark/50 border-b border-medieval-gold/20 flex justify-between items-center">
            <h2 className="text-lg font-bold font-serif text-medieval-gold" style={{ fontFamily: "'Cinzel', serif" }}>
              Listino Prezzi Consigliati
            </h2>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">20 Merci</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-medieval-gold/10">
              <thead className="bg-medieval-dark/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-medieval-gold uppercase tracking-wider">Merce</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Prezzo Base</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Acquisto Max</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Vendita Min</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Soddisfazione</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-medieval-gold uppercase tracking-wider">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medieval-gold/5">
                {goods.map((good) => (
                  <tr
                    key={good.id}
                    onClick={() => setSelectedGoodId(good.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedGoodId === good.id
                        ? 'bg-medieval-gold/10 border-l-4 border-medieval-gold'
                        : 'hover:bg-medieval-gold/5'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">📦</span>
                        <div className="text-sm font-semibold text-gray-200">{good.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-300 font-mono">
                      {good.basePrice} <span className="text-medieval-gold text-xs">g</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-medieval-forestLight font-mono">
                      {good.buyPriceRange[0]}-{good.buyPriceRange[1]} <span className="text-medieval-gold text-xs font-normal">g</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-medieval-goldLight font-mono">
                      {good.sellPriceRange[0]}-{good.sellPriceRange[1]} <span className="text-medieval-gold text-xs font-normal">g</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-400 font-mono">
                      {good.maxSatisfactionPrice ? `${good.maxSatisfactionPrice} g` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-2xs font-bold uppercase rounded-full ${
                        good.isImported
                          ? 'bg-purple-900/40 text-purple-300 border border-purple-800/30'
                          : good.isRawMaterial
                          ? 'bg-medieval-forest/20 text-medieval-forestLight border border-medieval-forest/30'
                          : 'bg-medieval-gold/10 text-medieval-gold border border-medieval-gold/30'
                      }`}>
                        {good.isImported ? 'Import' : good.isRawMaterial ? 'Greggio' : 'Finito'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dettaglio Impresa Associata */}
        <div className="space-y-6">
          <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-medieval-gold border-b border-medieval-gold/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Info className="h-5 w-5 text-medieval-gold" />
              <span>Dettagli Merce</span>
            </h3>

            {selectedGood && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Identificativo</h4>
                  <p className="text-sm font-semibold text-gray-300 capitalize">{selectedGood.id}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Volume in Stiva</h4>
                  <p className="text-sm font-semibold text-gray-300">{selectedGood.volume} Barile/i</p>
                </div>
                {selectedGood.isImported && (
                  <div className="bg-purple-950/20 border border-purple-500/20 rounded p-3 text-xs text-purple-300 flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p>Questa merce non è prodotta nell'Hansa. Può essere importata solo organizzando spedizioni navali nel Mar Mediterraneo o nelle Americhe.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-medieval-gold border-b border-medieval-gold/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Hammer className="h-5 w-5 text-medieval-gold" />
              <span>Struttura Produttiva</span>
            </h3>

            {associatedBusiness ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold font-serif text-medieval-goldLight" style={{ fontFamily: "'Cinzel', serif" }}>
                    {associatedBusiness.name}
                  </h4>
                  <p className="text-gray-400 text-xs mt-0.5">Laboratorio di produzione standard</p>
                </div>

                {/* Statistiche Produzione */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-medieval-dark/40 border border-medieval-gold/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-500 uppercase tracking-widest font-bold">Produzione/Giorno</p>
                    <p className="text-xl font-bold text-medieval-forestLight font-mono">
                      +{associatedBusiness.baseProductionPerDay} <span className="text-xs font-normal">barili</span>
                    </p>
                  </div>
                  <div className="bg-medieval-dark/40 border border-medieval-gold/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-500 uppercase tracking-widest font-bold">Manutenzione/Giorno</p>
                    <p className="text-xl font-bold text-medieval-rubyLight font-mono">
                      {associatedBusiness.dailyMaintenance} <span className="text-xs font-normal text-medieval-gold font-serif">g</span>
                    </p>
                  </div>
                </div>

                {/* Materie Prime Consumate */}
                <div>
                  <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Risorse Necessarie (Consumo/Giorno)</h4>
                  {associatedBusiness.inputs.length > 0 ? (
                    <div className="space-y-2">
                      {associatedBusiness.inputs.map((input: any) => {
                        const inputGood = goods.find(g => g.id === input.goodId);
                        return (
                          <div key={input.goodId} className="flex justify-between items-center bg-medieval-dark/20 px-3 py-2 rounded border border-medieval-gold/5">
                            <span className="text-sm text-gray-300 font-semibold flex items-center space-x-2">
                              <span>📦</span>
                              <span>{inputGood ? inputGood.name : input.goodId}</span>
                            </span>
                            <span className="text-sm font-bold text-medieval-rubyLight font-mono">-{input.amountPerDay}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-medieval-forestLight italic flex items-center space-x-1.5">
                      <span>✓</span>
                      <span>Nessuna materia prima necessaria (Produzione autonoma)</span>
                    </p>
                  )}
                </div>

                {/* Costi Costruzione */}
                <div className="border-t border-medieval-gold/10 pt-4">
                  <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Requisiti di Edificazione</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-medieval-dark/20 p-2 rounded text-center border border-medieval-gold/5">
                      <p className="text-3xs text-gray-500 font-bold uppercase">Oro</p>
                      <p className="text-sm font-semibold text-medieval-gold font-mono">{associatedBusiness.constructionCost.gold}</p>
                    </div>
                    <div className="bg-medieval-dark/20 p-2 rounded text-center border border-medieval-gold/5">
                      <p className="text-3xs text-gray-500 font-bold uppercase">Mattoni</p>
                      <p className="text-sm font-semibold text-gray-300 font-mono">{associatedBusiness.constructionCost.bricks}</p>
                    </div>
                    <div className="bg-medieval-dark/20 p-2 rounded text-center border border-medieval-gold/5">
                      <p className="text-3xs text-gray-500 font-bold uppercase">Legno</p>
                      <p className="text-sm font-semibold text-gray-300 font-mono">{associatedBusiness.constructionCost.timber}</p>
                    </div>
                  </div>
                  <p className="text-3xs text-gray-400 mt-2 text-right">
                    Richiede {associatedBusiness.workersNeeded} lavoratori attivi
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs italic">
                Nessuna impresa associata. Questa merce non può essere prodotta tramite laboratori.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsAndBusinesses;
