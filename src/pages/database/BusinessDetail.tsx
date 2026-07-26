import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { ArrowLeft, Hammer, Landmark, Coins, Users, Sparkles } from 'lucide-react';
import { getGoodImagePath } from '../../utils/goodImage';

const BusinessDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { businessService, goodService, townService } = useServices();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any | null>(null);
  const [goodsList, setGoodsList] = useState<any[]>([]);
  const [producingTowns, setProducingTowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const foundBus = await businessService.getBusinessById(id, currentLang);
        const allGoods = await goodService.getGoods(currentLang);
        const allTowns = await townService.getTowns();

        setBusiness(foundBus || null);
        setGoodsList(allGoods);

        if (foundBus) {
          const prod = allTowns.filter((town: any) => town.produces.includes(foundBus.producedGoodId));
          setProducingTowns(prod);
        }
      } catch (err) {
        console.error('Errore nel caricamento del dettaglio impresa', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, businessService, goodService, townService, currentLang]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading')}</span>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12 text-neutral-dark">
        <h2 className="text-2xl font-bold text-primary font-serif">Impresa non trovata</h2>
        <Link to="/database/businesses" className="inline-flex items-center text-primary mt-4 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Torna alle imprese
        </Link>
      </div>
    );
  }

  const productGood = goodsList.find(g => g.id === business.producedGoodId);
  const productName = productGood ? productGood.name : business.producedGoodId;

  return (
    <div className="space-y-6 text-neutral-dark">
      {/* Ritorno */}
      <div>
        <Link
          to="/database/businesses"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary text-neutral-dark font-bold rounded shadow border border-primary/20 hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Torna alle imprese</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Principale (Prodotto & Info Base) */}
        <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-center mb-6">
              <img
                src={getGoodImagePath(business.producedGoodId)}
                alt={productName}
                className="h-32 w-32 object-contain border border-primary/30 rounded bg-white p-2 shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                }}
              />
            </div>
            
            <div className="text-center mb-6 border-b border-primary/10 pb-4">
              <h2 className="text-2xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {business.name}
              </h2>
              <div className="mt-2 text-xs text-gray-700 font-semibold">
                Produce: <span className="text-primary font-bold">{productName}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <Sparkles className="h-4 w-4 text-success mr-1.5" /> Produzione Base
                </span>
                <span className="font-mono font-bold text-success">+{business.baseProductionPerDay} /giorno</span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <Coins className="h-4 w-4 text-primary mr-1.5" /> Manutenzione
                </span>
                <span className="font-mono font-bold text-danger">{business.dailyMaintenance} g /giorno</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <Users className="h-4 w-4 text-primary mr-1.5" /> Lavoratori Richiesti
                </span>
                <span className="font-mono font-bold text-neutral-dark">{business.workersNeeded} dipendenti</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-background border border-primary/10 rounded p-4 text-2xs text-gray-600 leading-relaxed font-medium italic">
            Massimizza l'efficienza assumendo il numero totale di lavoratori (30) e costruendo in città che supportano questa risorsa come specializzazione.
          </div>
        </div>

        {/* Colonna Destra (Struttura, Costi e Geografia) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fabbisogno Materie Prime */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Hammer className="h-5 w-5 text-primary" />
              <span>Fabbisogno Industriale (Input)</span>
            </h3>

            {business.inputs.length > 0 ? (
              <div className="space-y-2">
                {business.inputs.map((input: any) => {
                  const inputGood = goodsList.find(g => g.id === input.goodId);
                  const inputGoodName = inputGood ? inputGood.name : input.goodId;
                  return (
                    <div
                      key={input.goodId}
                      onClick={() => navigate(`/database/goods/${input.goodId}`)}
                      className="flex justify-between items-center bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-colors cursor-pointer group"
                    >
                      <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                        <img
                          src={getGoodImagePath(input.goodId)}
                          alt={inputGoodName}
                          className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                        />
                        <span className="group-hover:text-primary transition-colors">{inputGoodName}</span>
                      </span>
                      <span className="text-sm font-bold text-danger font-mono">-{input.amountPerDay} /giorno</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-success font-bold italic flex items-center space-x-1.5 bg-green-50 p-3 rounded border border-green-200">
                <span>✓</span>
                <span>Produzione Autonoma: questa impresa non consuma alcuna materia prima.</span>
              </p>
            )}
          </div>

          {/* Requisiti di Costruzione */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Coins className="h-5 w-5 text-primary" />
              <span>Costi di Costruzione</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background p-3 rounded text-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Oro</p>
                <p className="text-lg font-bold text-primary font-mono mt-1">{business.constructionCost.gold}g</p>
              </div>
              <div className="bg-background p-3 rounded text-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Mattoni</p>
                <p className="text-lg font-bold text-neutral-dark font-mono mt-1">{business.constructionCost.bricks}</p>
              </div>
              <div className="bg-background p-3 rounded text-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Legno</p>
                <p className="text-lg font-bold text-neutral-dark font-mono mt-1">{business.constructionCost.timber}</p>
              </div>
            </div>
          </div>

          {/* Geografia della Produzione */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Landmark className="h-5 w-5 text-primary" />
              <span>Città di Produzione Efficace (Resa 100%)</span>
            </h3>

            {producingTowns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {producingTowns.map(town => (
                  <div
                    key={town.id}
                    onClick={() => navigate(`/database/towns/${town.id}`)}
                    className="cursor-pointer bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-sm font-semibold text-neutral-dark group-hover:text-primary transition-colors">{town.name}</span>
                    {town.isRiverTown && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                        Fluviale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 italic">Questa risorsa non è una specializzazione di default di alcuna città della Lega Ansea. Verrà prodotta ovunque con penalità di rendimento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
