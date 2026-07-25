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
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-dark">
      {/* Intestazione Pagina */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          Merci & Produzione Industriale
        </h1>
        <p className="text-gray-700 text-sm mt-1">
          Consulta i prezzi consigliati di compravendita e analizza le catene di produzione della Lega Anseatica.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabella Merci */}
        <div className="lg:col-span-2 bg-white border border-primary/20 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-background border-b border-primary/20 flex justify-between items-center">
            <h2 className="text-lg font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
              Listino Prezzi Consigliati
            </h2>
            <span className="text-xs text-gray-700 font-semibold uppercase tracking-wider">20 Merci</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary/15">
              <thead className="bg-primary/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Merce</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Prezzo Base</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Acquisto Max</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Vendita Min</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Soddisfazione</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {goods.map((good) => (
                  <tr
                    key={good.id}
                    onClick={() => setSelectedGoodId(good.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedGoodId === good.id
                        ? 'bg-secondary/20 border-l-4 border-secondary'
                        : 'hover:bg-primary/5 bg-background'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">📦</span>
                        <div className="text-sm font-semibold text-neutral-dark">{good.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-neutral-dark font-mono">
                      {good.basePrice} <span className="text-primary text-xs font-serif">g</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-success font-mono">
                      {good.buyPriceRange[0]}-{good.buyPriceRange[1]} <span className="text-primary text-xs font-normal font-serif">g</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-primary font-mono">
                      {good.sellPriceRange[0]}-{good.sellPriceRange[1]} <span className="text-primary text-xs font-normal font-serif">g</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 font-mono">
                      {good.maxSatisfactionPrice ? `${good.maxSatisfactionPrice} g` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-2xs font-bold uppercase rounded-full ${
                        good.isImported
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : good.isRawMaterial
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
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
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Info className="h-5 w-5 text-primary" />
              <span>Dettagli Merce</span>
            </h3>

            {selectedGood && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider">Identificativo</h4>
                  <p className="text-sm font-semibold text-neutral-dark capitalize">{selectedGood.id}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider">Volume in Stiva</h4>
                  <p className="text-sm font-semibold text-neutral-dark">{selectedGood.volume} Barile/i</p>
                </div>
                {selectedGood.isImported && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-3 text-xs text-purple-900 flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-700 mt-0.5 flex-shrink-0" />
                    <p>Questa merce non è prodotta nell'Hansa. Può essere importata solo organizzando spedizioni navali nel Mar Mediterraneo o nelle Americhe.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Hammer className="h-5 w-5 text-primary" />
              <span>Struttura Produttiva</span>
            </h3>

            {associatedBusiness ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                    {associatedBusiness.name}
                  </h4>
                  <p className="text-gray-700 text-xs mt-0.5">Laboratorio di produzione standard</p>
                </div>

                {/* Statistiche Produzione */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background border border-primary/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Produzione/Giorno</p>
                    <p className="text-xl font-bold text-success font-mono">
                      +{associatedBusiness.baseProductionPerDay} <span className="text-xs font-normal font-sans">barili</span>
                    </p>
                  </div>
                  <div className="bg-background border border-primary/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Manutenzione/Giorno</p>
                    <p className="text-xl font-bold text-danger font-mono">
                      {associatedBusiness.dailyMaintenance} <span className="text-xs font-normal text-primary font-serif">g</span>
                    </p>
                  </div>
                </div>

                {/* Materie Prime Consumate */}
                <div>
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">Risorse Necessarie (Consumo/Giorno)</h4>
                  {associatedBusiness.inputs.length > 0 ? (
                    <div className="space-y-2">
                      {associatedBusiness.inputs.map((input: any) => {
                        const inputGood = goods.find(g => g.id === input.goodId);
                        return (
                          <div key={input.goodId} className="flex justify-between items-center bg-background px-3 py-2 rounded border border-primary/5">
                            <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                              <span>📦</span>
                              <span>{inputGood ? inputGood.name : input.goodId}</span>
                            </span>
                            <span className="text-sm font-bold text-danger font-mono">-{input.amountPerDay}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-success font-bold italic flex items-center space-x-1.5">
                      <span>✓</span>
                      <span>Nessuna materia prima necessaria (Produzione autonoma)</span>
                    </p>
                  )}
                </div>

                {/* Costi Costruzione */}
                <div className="border-t border-primary/10 pt-4">
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-3">Requisiti di Edificazione</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Oro</p>
                      <p className="text-sm font-semibold text-primary font-mono">{associatedBusiness.constructionCost.gold}</p>
                    </div>
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Mattoni</p>
                      <p className="text-sm font-semibold text-neutral-dark font-mono">{associatedBusiness.constructionCost.bricks}</p>
                    </div>
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Legno</p>
                      <p className="text-sm font-semibold text-neutral-dark font-mono">{associatedBusiness.constructionCost.timber}</p>
                    </div>
                  </div>
                  <p className="text-3xs text-gray-600 mt-2 text-right italic font-medium">
                    Richiede {associatedBusiness.workersNeeded} lavoratori attivi
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-600 text-xs italic">
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
