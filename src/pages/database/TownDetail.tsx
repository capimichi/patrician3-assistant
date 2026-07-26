import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { ArrowLeft, MapPin, Waves, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getGoodImagePath } from '../../utils/goodImage';
import type { Town } from '../../types';

const TownDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { townService, goodService } = useServices();
  const navigate = useNavigate();

  const [town, setTown] = useState<Town | null>(null);
  const [goods, setGoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const loadedTown = await townService.getTownById(id);
        const loadedGoods = await goodService.getGoods(currentLang);
        setTown(loadedTown || null);
        setGoods(loadedGoods);
      } catch (err) {
        console.error('Errore nel caricamento del dettaglio città', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, townService, goodService, currentLang]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading')}</span>
      </div>
    );
  }

  if (!town) {
    return (
      <div className="text-center py-12 text-neutral-dark">
        <h2 className="text-2xl font-bold text-primary font-serif">Città non trovata</h2>
        <Link to="/database/towns" className="inline-flex items-center text-primary mt-4 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Torna al database città
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-dark">
      {/* Ritorno */}
      <div>
        <Link
          to="/database/towns"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary text-neutral-dark font-bold rounded shadow border border-primary/20 hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Torna alle città</span>
        </Link>
      </div>

      <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6 space-y-6">
        {/* Header Scheda */}
        <div className="border-b border-primary/20 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
              {town.name}
            </h1>
            <div className="flex items-center space-x-4 text-xs text-gray-700 mt-1 font-semibold">
              <span className="flex items-center">
                <MapPin className="h-3.5 w-3.5 text-primary mr-1" />
                Coordinate: X={town.coordinate?.x || '-'}, Y={town.coordinate?.y || '-'}
              </span>
              <span className={`flex items-center font-bold ${town.isRiverTown ? 'text-blue-800' : 'text-neutral-dark'}`}>
                <Waves className="h-3.5 w-3.5 mr-1 text-blue-600" />
                {town.isRiverTown ? 'Porto Fluviale (River)' : 'Porto Marittimo (Sea)'}
              </span>
            </div>
          </div>
        </div>

        {/* Avviso Fiume */}
        {town.isRiverTown && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-xs text-blue-900 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider mb-0.5">Restrizione Fluviale</p>
              <p>Questa città è raggiungibile solo risalendo fiumi poco profondi. Le navi di grandi dimensioni (Cog e Holk) non possono attraccare qui. Per la navigazione e il trasporto merci a {town.name} è necessario utilizzare esclusivamente navi fluviali come <strong>Snaikka</strong> o <strong>Crayer</strong>.</p>
            </div>
          </div>
        )}

        {/* Merci Prodotte Efficacemente */}
        <div className="space-y-3">
          <h4 className="text-sm text-primary font-bold uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-success" />
            <span>Specializzazioni della Città (Produzione Efficace)</span>
          </h4>
          <p className="text-gray-700 text-xs">
            Le seguenti merci vengono prodotte localmente con la massima efficienza (100% della resa base) e non subiscono penalità. Clicca su una merce per vederne i dettagli.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {town.produces.map((goodId) => {
              const goodObj = goods.find(g => g.id === goodId);
              const goodName = goodObj ? goodObj.name : goodId;
              return (
                <div
                  key={goodId}
                  onClick={() => navigate(`/database/goods/${goodId}`)}
                  className="cursor-pointer bg-background border border-success/20 hover:border-success/50 hover:bg-success/5 rounded p-3 flex items-center space-x-3 transition-colors group"
                >
                  <img
                    src={getGoodImagePath(goodId)}
                    alt={goodName}
                    className="h-8 w-8 object-contain border border-primary/10 rounded bg-white p-0.5 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-neutral-dark group-hover:text-primary transition-colors">{goodName}</p>
                    <p className="text-[10px] text-success font-bold uppercase">Resa 100%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Altre Merci (Con Penalità) */}
        <div className="space-y-3 border-t border-primary/10 pt-6">
          <h4 className="text-sm text-danger font-bold uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="h-4.5 w-4.5 text-danger" />
            <span>Altre Merci (Produzione con Penalità del 25%)</span>
          </h4>
          <p className="text-gray-700 text-xs">
            Qualsiasi altra impresa edificata a {town.name} al di fuori di quelle specializzate subirà una penalità del 25% sul volume di produzione giornaliero a causa della scarsità di materie prime o di manodopera locale specializzata.
          </p>
          <div className="bg-background border border-danger/10 rounded p-3 text-xs text-gray-700 leading-relaxed font-medium">
            Esempio: Se costruisci un'impresa di un bene non specializzato in questa città, la fabbrica produrrà il 25% in meno al giorno, mantenendo intatti i consumi di materie prime e costi di gestione.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TownDetail;
