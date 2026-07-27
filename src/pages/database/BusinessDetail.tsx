import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { ArrowLeft, Hammer, Landmark, Coins, Users, Sparkles } from 'lucide-react';
import { getGoodImagePath } from '../../utils/goodImage';
import { getBusinessImagePath } from '../../utils/businessImage';
import { TownLinkList } from '../../components/TownLinkList';
import { GoldAmount } from '../../components/GoldAmount';
import { GameIcon } from '../../components/GameIcon';

const BusinessDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { businessService, goodService, townService } = useServices();

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
          const prod = allTowns.filter((town: any) => foundBus.outputs.some((out: any) => town.produces.includes(out.goodId)));
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
        <h2 className="text-2xl font-bold text-primary font-serif">{t('database_businesses.not_found')}</h2>
        <Link to="/database/businesses" className="inline-flex items-center text-primary mt-4 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('database_businesses.back_list')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-dark">
      {/* Ritorno */}
      <div>
        <Link
          to="/database/businesses"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary text-neutral-dark font-bold rounded shadow border border-primary/20 hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('database_businesses.back_list')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Principale (Prodotto & Info Base) */}
        <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-center mb-6">
              <img
                src={getBusinessImagePath(business.id)}
                alt={business.name}
                className="h-32 w-32 object-cover border border-primary/30 rounded bg-white p-1 shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                }}
              />
            </div>
            
            <div className="text-center mb-6 border-b border-primary/10 pb-4">
              <h2 className="text-2xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {business.name}
              </h2>
              <div className="mt-2 text-xs text-gray-700 font-semibold flex flex-col items-center">
                <span>{t('database_businesses.produced_goods')}:</span>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {business.outputs.map((out: any) => {
                    const gObj = goodsList.find(g => g.id === out.goodId);
                    const gName = gObj ? gObj.name : out.goodId;
                    return (
                      <Link
                        key={out.goodId}
                        to={`/database/goods/${out.goodId}`}
                        className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/20 flex items-center space-x-1 transition-colors"
                      >
                        <img src={getGoodImagePath(out.goodId)} alt={gName} className="h-3.5 w-3.5 object-contain" />
                        <span>{gName}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <Coins className="h-4 w-4 text-primary mr-1.5" /> {t('database_businesses.maintenance_cost')}
                </span>
                <div className="inline-flex items-center font-mono font-bold text-danger text-sm">
                  <GoldAmount amount={business.dailyMaintenance} className="text-danger text-sm" />
                  <span className="mx-1">/</span>
                  <GameIcon type="hourglass" className="h-4 w-4 mr-0.5" />
                  <span>{t('production.day')}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <Users className="h-4 w-4 text-primary mr-1.5" /> {t('database_businesses.workers_needed')}
                </span>
                <span className="font-mono font-bold text-neutral-dark">{business.workersNeeded} {t('database_businesses.workers')}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-background border border-primary/10 rounded p-4 text-2xs text-gray-600 leading-relaxed font-medium italic">
            {t('database_businesses.efficiency_tip')}
          </div>
        </div>

        {/* Colonna Destra (Struttura, Costi e Geografia) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resa di Produzione (Output) */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Sparkles className="h-5 w-5 text-primary" />
              <span>{t('database_businesses.production_yield')}</span>
            </h3>

            <div className="space-y-2">
              {business.outputs.map((out: any) => {
                const outGood = goodsList.find(g => g.id === out.goodId);
                const outGoodName = outGood ? outGood.name : out.goodId;
                return (
                  <Link
                    key={out.goodId}
                    to={`/database/goods/${out.goodId}`}
                    className="flex justify-between items-center bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-colors group"
                  >
                    <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                      <img
                        src={getGoodImagePath(out.goodId)}
                        alt={outGoodName}
                        className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                      />
                      <span className="group-hover:text-primary transition-colors">{outGoodName}</span>
                    </span>
                    <span className="text-sm font-bold text-success font-mono inline-flex items-center">
                      <GameIcon type="barrel" className="h-3.5 w-3.5 mr-1" />
                      +{out.amountPerDay} /
                      <GameIcon type="hourglass" className="h-3.5 w-3.5 mx-1" />
                      {t('production.day')}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Fabbisogno Materie Prime */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Hammer className="h-5 w-5 text-primary" />
              <span>{t('database_businesses.raw_materials')}</span>
            </h3>

            {business.inputs.length > 0 ? (
              <div className="space-y-2">
                 {business.inputs.map((input: any) => {
                  const inputGood = goodsList.find(g => g.id === input.goodId);
                  const inputGoodName = inputGood ? inputGood.name : input.goodId;
                  return (
                    <Link
                      key={input.goodId}
                      to={`/database/goods/${input.goodId}`}
                      className="flex justify-between items-center bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-colors group"
                    >
                      <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                        <img
                          src={getGoodImagePath(input.goodId)}
                          alt={inputGoodName}
                          className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                        />
                        <span className="group-hover:text-primary transition-colors">{inputGoodName}</span>
                      </span>
                      <span className="text-sm font-bold text-danger font-mono inline-flex items-center">
                        <GameIcon type="load" className="h-3.5 w-3.5 mr-1" />
                        -{input.amountPerDay} /
                        <GameIcon type="hourglass" className="h-3.5 w-3.5 mx-1" />
                        {t('production.day')}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-success font-bold italic flex items-center space-x-1.5 bg-green-50 p-3 rounded border border-green-200">
                <span>✓</span>
                <span>{t('database_businesses.no_raw_needed')}</span>
              </p>
            )}
          </div>

          {/* Requisiti di Costruzione */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Coins className="h-5 w-5 text-primary" />
              <span>{t('database_businesses.construction_cost')}</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background p-3 rounded flex flex-col items-center justify-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">{t('database_businesses.columns.cost')}</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <img src="/images/gold.png" alt="Oro" className="h-5 w-5 object-contain" />
                  <span className="text-lg font-bold text-primary font-mono">{business.constructionCost.gold}</span>
                </div>
              </div>
              <div className="bg-background p-3 rounded flex flex-col items-center justify-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">{t('database_businesses.columns.bricks')}</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <img src={getGoodImagePath('bricks')} alt="Mattoni" className="h-5 w-5 object-contain" />
                  <span className="text-lg font-bold text-neutral-dark font-mono">{business.constructionCost.bricks}</span>
                </div>
              </div>
              <div className="bg-background p-3 rounded flex flex-col items-center justify-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">{t('database_businesses.columns.timber')}</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <img src={getGoodImagePath('timber')} alt="Legno" className="h-5 w-5 object-contain" />
                  <span className="text-lg font-bold text-neutral-dark font-mono">{business.constructionCost.timber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Geografia della Produzione */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Landmark className="h-5 w-5 text-primary" />
              <span>{t('database_businesses.producing_cities')}</span>
            </h3>

            <TownLinkList
              towns={producingTowns}
              emptyMessage={t('database_businesses.no_optimal_cities')}
              variant="grid"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
