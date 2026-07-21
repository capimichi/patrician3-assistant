import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import type { LocalizedBuilding } from '../../services/BuildingService';
import { Landmark, Coins, Hammer, Users } from 'lucide-react';

const Buildings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { buildingService } = useServices();

  const [buildings, setBuildings] = useState<LocalizedBuilding[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const loadedBuildings = await buildingService.getBuildings(currentLang);
        setBuildings(loadedBuildings);
      } catch (err) {
        console.error('Errore nel caricamento degli edifici', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [buildingService, currentLang]);

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
          Database Edifici
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Analizza le tipologie di abitazioni residenziali necessarie per ospitare i cittadini delle tue città e generare profitti costanti dagli affitti.
        </p>
      </div>

      {/* Grid delle Case */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {buildings.map((building) => {
          return (
            <div key={building.id} className="bg-medieval-slate border border-medieval-gold/20 rounded-lg shadow-lg overflow-hidden flex flex-col justify-between">
              {/* Card Header */}
              <div className="px-6 py-5 bg-medieval-dark/50 border-b border-medieval-gold/15 flex items-center space-x-3">
                <Landmark className="h-6 w-6 text-medieval-gold" />
                <h2 className="text-xl font-bold font-serif text-medieval-gold" style={{ fontFamily: "'Cinzel', serif" }}>
                  {building.name}
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6 flex-grow">
                {/* Capienza Abitanti */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <Users className="h-3.5 w-3.5 text-medieval-gold" />
                    <span>Capacità Abitativa</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2 bg-medieval-dark/20 p-2.5 rounded border border-medieval-gold/5 text-center">
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Poveri</p>
                      <p className="text-sm font-semibold text-gray-200 font-mono">{building.capacity.poor}</p>
                    </div>
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Benestanti</p>
                      <p className="text-sm font-semibold text-gray-200 font-mono">{building.capacity.wealthy}</p>
                    </div>
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Ricchi</p>
                      <p className="text-sm font-semibold text-gray-200 font-mono">{building.capacity.rich}</p>
                    </div>
                  </div>
                </div>

                {/* Affitti Settimanali */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <Coins className="h-3.5 w-3.5 text-medieval-gold" />
                    <span>Rendita da Affitto / Settimana</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2 bg-medieval-dark/20 p-2.5 rounded border border-medieval-gold/5 text-center">
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Poveri</p>
                      <p className="text-sm font-bold text-medieval-forestLight font-mono">
                        {building.weeklyRent.poor > 0 ? `+${building.weeklyRent.poor}g` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Benestanti</p>
                      <p className="text-sm font-bold text-medieval-forestLight font-mono">
                        {building.weeklyRent.wealthy > 0 ? `+${building.weeklyRent.wealthy}g` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Ricchi</p>
                      <p className="text-sm font-bold text-medieval-forestLight font-mono">
                        {building.weeklyRent.rich > 0 ? `+${building.weeklyRent.rich}g` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requisiti di Edificazione */}
                <div className="space-y-2 border-t border-medieval-gold/10 pt-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <Hammer className="h-3.5 w-3.5 text-medieval-gold" />
                    <span>Requisiti di Costruzione</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2 bg-medieval-dark/20 p-2.5 rounded border border-medieval-gold/5 text-center">
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Oro</p>
                      <p className="text-xs font-semibold text-medieval-gold font-mono">{building.constructionCost.gold}</p>
                    </div>
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Mattoni</p>
                      <p className="text-xs font-semibold text-gray-300 font-mono">{building.constructionCost.bricks}</p>
                    </div>
                    <div>
                      <p className="text-3xs text-gray-500 font-bold uppercase">Legno</p>
                      <p className="text-xs font-semibold text-gray-300 font-mono">{building.constructionCost.timber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="px-6 py-3 bg-medieval-dark/30 border-t border-medieval-gold/10 text-3xs text-gray-500 font-medium italic">
                Costruisci case nelle zone centrali per massimizzare la soddisfazione dei ceti sociali medio-alti.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Buildings;
