import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { getGoodImagePath } from '../../utils/goodImage';
import { ArrowLeft, Sparkles, Hammer, Landmark } from 'lucide-react';

const GoodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { goodService, businessService, townService } = useServices();
  const navigate = useNavigate();

  const [good, setGood] = useState<any | null>(null);
  const [goodsList, setGoodsList] = useState<any[]>([]);
  const [business, setBusiness] = useState<any | null>(null);
  const [producingTowns, setProducingTowns] = useState<any[]>([]);
  const [consumingTowns, setConsumingTowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const allGoods = await goodService.getGoods(currentLang);
        setGoodsList(allGoods);

        const foundGood = allGoods.find(g => g.id === id);
        if (!foundGood) {
          setGood(null);
          setLoading(false);
          return;
        }
        setGood(foundGood);

        // Carica Impresa
        const allBusinesses = await businessService.getBusinesses(currentLang);
        const associatedBus = allBusinesses.find(b => b.producedGoodId === id);
        setBusiness(associatedBus || null);

        // Carica Città di produzione
        const allTowns = await townService.getTowns();
        const prod = allTowns.filter((town: any) => town.produces.includes(id));
        setProducingTowns(prod);

        // Calcola città che consumano questa merce come input industriale
        const cons = allTowns.filter((town: any) => {
          // Controlla se la città produce beni che richiedono questa risorsa come input
          return town.produces.some((townProdId: string) => {
            const prodBus = allBusinesses.find(b => b.producedGoodId === townProdId);
            if (!prodBus) return false;
            return prodBus.inputs.some((input: any) => input.goodId === id);
          });
        });
        setConsumingTowns(cons);

      } catch (err) {
        console.error('Errore nel caricamento del dettaglio merce', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id, goodService, businessService, townService, currentLang]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading') || 'Caricamento...'}</span>
      </div>
    );
  }

  if (!good) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-primary font-serif">Risorsa non trovata</h2>
        <Link to="/database/goods" className="inline-flex items-center text-primary mt-4 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Torna al listino
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-dark">
      {/* Ritorno */}
      <div>
        <Link
          to="/database/goods"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary text-neutral-dark font-bold rounded shadow border border-primary/20 hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Torna al listino</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Principale (Informazioni di Mercato) */}
        <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-center mb-6">
              <img
                src={getGoodImagePath(good.id)}
                alt={good.name}
                className="h-32 w-32 object-contain border border-primary/30 rounded bg-white p-2 shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                }}
              />
            </div>
            
            <div className="text-center mb-6 border-b border-primary/10 pb-4">
              <h2 className="text-2xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {good.name}
              </h2>
              <div className="mt-2">
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                  good.isImported
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : good.isRawMaterial
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                }`}>
                  {good.isImported ? 'Importata (Mediterraneo)' : good.isRawMaterial ? 'Materia Grezza' : 'Bene Finito'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Prezzo Base di Riferimento</span>
                <span className="font-mono font-bold text-neutral-dark">{good.basePrice} g</span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  Acquisto Consigliato (Max)
                </span>
                <span className="font-mono font-bold text-success">
                  {good.buyPriceRange[0] === good.buyPriceRange[1] 
                    ? `${good.buyPriceRange[0]}` 
                    : `${good.buyPriceRange[0]}-${good.buyPriceRange[1]}`} g
                </span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Vendita Consigliata (Min)</span>
                <span className="font-mono font-bold text-primary">
                  {good.sellPriceRange[0]}-{good.sellPriceRange[1]} g
                </span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Prezzo Max per Soddisfazione</span>
                <span className="font-mono font-bold text-neutral-dark">
                  {good.maxSatisfactionPrice ? `${good.maxSatisfactionPrice} g` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Spazio in Stiva</span>
                <span className="font-mono font-bold text-neutral-dark">
                  {good.volume} {good.volume === 1 ? 'barile' : 'barili'}
                </span>
              </div>
            </div>
          </div>

          {good.isImported && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded p-4 text-xs text-purple-900 flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-purple-700 mt-0.5 flex-shrink-0" />
              <p>Questa merce non è prodotta nella Lega Anseatica. Può essere ottenuta esclusivamente organizzando spedizioni marittime con convogli nel Mar Mediterraneo o nelle Americhe.</p>
            </div>
          )}
        </div>

        {/* Colonna Destra (Struttura e Città) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Struttura Produttiva */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Hammer className="h-5 w-5 text-primary" />
              <span>Struttura Produttiva</span>
            </h3>

            {business ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                    {business.name}
                  </h4>
                  <p className="text-gray-700 text-xs">Laboratorio di produzione standard</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-background border border-primary/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Produzione/Giorno</p>
                    <p className="text-xl font-bold text-success font-mono">
                      +{business.baseProductionPerDay} <span className="text-xs font-normal font-sans">barili</span>
                    </p>
                  </div>
                  <div className="bg-background border border-primary/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Manutenzione/Giorno</p>
                    <p className="text-xl font-bold text-danger font-mono">
                      {business.dailyMaintenance} <span className="text-xs font-normal text-primary font-serif">g</span>
                    </p>
                  </div>
                </div>

                {/* Consumo Materie Prime */}
                <div>
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Materie Prime Necessarie (Consumo/Giorno)</h4>
                  {business.inputs.length > 0 ? (
                    <div className="space-y-2">
                      {business.inputs.map((input: any) => {
                        const inputGood = goodsList.find(g => g.id === input.goodId);
                        return (
                          <div
                            key={input.goodId}
                            onClick={() => navigate(`/database/goods/${input.goodId}`)}
                            className="flex justify-between items-center bg-background px-3 py-2 rounded border border-primary/5 hover:border-primary/30 transition-colors cursor-pointer group"
                          >
                            <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                              <img
                                src={getGoodImagePath(input.goodId)}
                                alt={input.goodId}
                                className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                              />
                              <span className="group-hover:text-primary transition-colors">{inputGood ? inputGood.name : input.goodId}</span>
                            </span>
                            <span className="text-sm font-bold text-danger font-mono">-{input.amountPerDay}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-success font-bold italic flex items-center space-x-1.5 bg-green-50/50 p-2.5 rounded border border-green-200/40">
                      <span>✓</span>
                      <span>Nessuna materia prima necessaria (Produzione autonoma)</span>
                    </p>
                  )}
                </div>

                {/* Costi di Costruzione */}
                <div className="border-t border-primary/10 pt-4">
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-3">Requisiti di Edificazione</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Oro</p>
                      <p className="text-sm font-semibold text-primary font-mono">{business.constructionCost.gold}</p>
                    </div>
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Mattoni</p>
                      <p className="text-sm font-semibold text-neutral-dark font-mono">{business.constructionCost.bricks}</p>
                    </div>
                    <div className="bg-background p-2 rounded text-center border border-primary/10">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Legno</p>
                      <p className="text-sm font-semibold text-neutral-dark font-mono">{business.constructionCost.timber}</p>
                    </div>
                  </div>
                  <p className="text-3xs text-gray-600 mt-2 text-right italic font-medium">
                    Richiede {business.workersNeeded} lavoratori attivi
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-600 text-xs italic">
                Questa risorsa non può essere prodotta direttamente tramite laboratori privati edificabili.
              </div>
            )}
          </div>

          {/* Città di produzione */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Landmark className="h-5 w-5 text-primary" />
              <span>Geografia & Commercio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Città Produttrici (Produzione Efficace)</h4>
                {producingTowns.length > 0 ? (
                  <ul className="space-y-1.5">
                    {producingTowns.map(town => (
                      <li key={town.id} className="text-sm font-semibold bg-background px-2.5 py-1.5 rounded border border-primary/5">
                        <Link to="/database/towns" className="text-neutral-dark hover:text-primary transition-colors flex items-center justify-between">
                          <span>{town.name}</span>
                          {town.isRiverTown && <span className="text-3xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">Fluviale</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600 italic">Non prodotta in alcuna città dell'Hansa di default.</p>
                )}
              </div>

              <div>
                <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Città che Consumano (Uso Industriale)</h4>
                {consumingTowns.length > 0 ? (
                  <ul className="space-y-1.5">
                    {consumingTowns.map(town => (
                      <li key={town.id} className="text-sm font-semibold bg-background px-2.5 py-1.5 rounded border border-primary/5">
                        <Link to="/database/towns" className="text-neutral-dark hover:text-primary transition-colors flex items-center justify-between">
                          <span>{town.name}</span>
                          {town.isRiverTown && <span className="text-3xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">Fluviale</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600 italic">Nessuna industria anseatica consuma questa merce.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodDetail;
