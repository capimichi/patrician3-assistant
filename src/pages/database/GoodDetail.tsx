import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { getGoodImagePath } from '../../utils/goodImage';
import { ArrowLeft, Sparkles, Hammer, Landmark } from 'lucide-react';
import { TownLinkList } from '../../components/TownLinkList';
import { GoldAmount } from '../../components/GoldAmount';

const GoodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { goodService, businessService, townService } = useServices();

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
        const associatedBus = allBusinesses.find(b => b.outputs.some(out => out.goodId === id));
        setBusiness(associatedBus || null);

        // Carica Città di produzione
        const allTowns = await townService.getTowns();
        const prod = allTowns.filter((town: any) => town.produces.includes(id));
        setProducingTowns(prod);

        // Calcola città che consumano questa merce come input industriale
        const cons = allTowns.filter((town: any) => {
          // Controlla se la città produce beni che richiedono questa risorsa come input
          return town.produces.some((townProdId: string) => {
            const prodBus = allBusinesses.find(b => b.outputs.some(out => out.goodId === townProdId));
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
                <GoldAmount amount={good.basePrice} className="font-mono font-bold text-neutral-dark" />
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  Acquisto Consigliato (Max)
                </span>
                <GoldAmount
                  amount={good.buyPriceRange[0] === good.buyPriceRange[1]
                    ? `${good.buyPriceRange[0]}`
                    : `${good.buyPriceRange[0]}-${good.buyPriceRange[1]}`}
                  className="font-mono font-bold text-success"
                />
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Vendita Consigliata (Min)</span>
                <GoldAmount
                  amount={`${good.sellPriceRange[0]}-${good.sellPriceRange[1]}`}
                  className="font-mono font-bold text-primary"
                />
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Prezzo Max per Soddisfazione</span>
                {good.maxSatisfactionPrice ? (
                  <GoldAmount amount={good.maxSatisfactionPrice} className="font-mono font-bold text-neutral-dark" />
                ) : (
                  <span className="font-mono font-bold text-neutral-dark">-</span>
                )}
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
                  <Link to={`/database/businesses/${business.id}`} className="hover:underline">
                    <h4 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                      {business.name}
                    </h4>
                  </Link>
                  <p className="text-gray-700 text-xs">Laboratorio di produzione standard</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-background border border-primary/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Produzione/Giorno</p>
                    <p className="text-xl font-bold text-success font-mono">
                      +{business.baseProductionPerDay} <span className="text-xs font-normal font-sans">barili</span>
                    </p>
                  </div>
                  <div className="bg-background border border-primary/10 p-3 rounded text-center flex flex-col justify-center items-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Manutenzione/Giorno</p>
                    <GoldAmount amount={business.dailyMaintenance} className="text-xl font-bold text-danger font-mono mt-1" />
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
                          <Link
                            key={input.goodId}
                            to={`/database/goods/${input.goodId}`}
                            className="flex justify-between items-center bg-background px-3 py-2 rounded border border-primary/5 hover:border-primary/30 transition-colors group"
                          >
                            <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                              <img
                                src={getGoodImagePath(input.goodId)}
                                alt={input.goodId}
                                className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                              />
                              <span className="group-hover:text-primary transition-colors">{inputGood ? inputGood.name : input.goodId}</span>
                            </span>
                            <span className="text-sm font-bold text-danger font-mono">- {input.amountPerDay}</span>
                          </Link>
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
                    <div className="bg-background p-2 rounded flex flex-col items-center justify-center border border-primary/10 text-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Oro</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src="/images/gold.png" alt="Oro" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-primary font-mono">{business.constructionCost.gold}</span>
                      </div>
                    </div>
                    <div className="bg-background p-2 rounded flex flex-col items-center justify-center border border-primary/10 text-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Mattoni</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src={getGoodImagePath('bricks')} alt="Mattoni" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-neutral-dark font-mono">{business.constructionCost.bricks}</span>
                      </div>
                    </div>
                    <div className="bg-background p-2 rounded flex flex-col items-center justify-center border border-primary/10 text-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Legno</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src={getGoodImagePath('timber')} alt="Legno" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-neutral-dark font-mono">{business.constructionCost.timber}</span>
                      </div>
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
                <TownLinkList
                  towns={producingTowns}
                  emptyMessage="Non prodotta in alcuna città dell'Hansa di default."
                  variant="list"
                />
              </div>

              <div>
                <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Città che Consumano (Uso Industriale)</h4>
                <TownLinkList
                  towns={consumingTowns}
                  emptyMessage="Nessuna industria anseatica consuma questa merce."
                  variant="list"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodDetail;
