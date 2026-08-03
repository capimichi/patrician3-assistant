import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import UninitializedWarning from '../../components/UninitializedWarning';
import type { Town } from '../../types';
import type { LocalizedBusiness } from '../../services/BusinessService';
import { useTranslation } from 'react-i18next';
import { Snowflake, Sun, Info } from 'lucide-react';
import { getGoodImagePath } from '../../utils/goodImage';

interface BusinessRow {
  id: string;
  name: string;
  effectiveKey: string;
  ineffectiveKey: string;
  hasIneffective: boolean;
  goodId: string;
}

const getGoodIdFromBusinessId = (bizId: string): string => {
  if (bizId === 'cattle_farm_leather') return 'leather';
  if (bizId === 'cattle_farm_meat') return 'meat';
  if (bizId === 'cattle_farm') return 'leather'; // Leather is the major production
  
  const map: Record<string, string> = {
    brewery: 'beer',
    iron_smelter: 'pig_iron',
    fishery: 'fish',
    whale_fishery: 'whale_oil',
    grain_farm: 'grain',
    hemp_farm: 'hemp',
    apiary: 'honey',
    hunting_lodge: 'skins',
    pitchmaker: 'pitch',
    sawmill: 'timber',
    sheep_farm: 'wool',
    saltworks: 'salt',
    pottery_workshop: 'pottery',
    weaving_mill: 'cloth',
    vineyard: 'wine',
    workshop: 'iron_goods',
    brickworks: 'bricks'
  };
  return map[bizId] || bizId;
};

const Businesses: React.FC = () => {
  const { game } = useGame();
  const { townService, businessService } = useServices();
  const { t, i18n } = useTranslation();

  const [towns, setTowns] = useState<Town[]>([]);
  const [businesses, setBusinesses] = useState<LocalizedBusiness[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'cities'>('summary');

  const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

  useEffect(() => {
    townService.getTowns().then(setTowns);
    businessService.getBusinesses(lang).then(setBusinesses);
  }, [townService, businessService, lang]);

  if (!game) {
    return <UninitializedWarning />;
  }

  const activeTowns = towns.filter(town => {
    const townState = game.state.towns[town.id];
    return townState && townState.isActive;
  });

  // Construct our 19 rows of business categories mapping to the 32 ODS rates keys
  const rows: BusinessRow[] = [
    { id: 'brewery', name: lang === 'it' ? 'Birreria (Birra)' : 'Brewery (Beer)', effectiveKey: 'brewery_e', ineffectiveKey: '', hasIneffective: false, goodId: 'beer' },
    { id: 'iron_smelter', name: lang === 'it' ? 'Fonderia (Ferro Grezzo)' : 'Iron Smelter (Pig Iron)', effectiveKey: 'iron_smelter_e', ineffectiveKey: 'iron_smelter_i', hasIneffective: true, goodId: 'pig_iron' },
    { id: 'fishery', name: lang === 'it' ? 'Pescatore (Pesce)' : 'Fishery (Fish)', effectiveKey: 'fishery_e', ineffectiveKey: 'fishery_i', hasIneffective: true, goodId: 'fish' },
    { id: 'whale_fishery', name: lang === 'it' ? 'Baleniere (Olio di Balena)' : 'Whale Fishery (Whale Oil)', effectiveKey: 'whale_fishery_e', ineffectiveKey: '', hasIneffective: false, goodId: 'whale_oil' },
    { id: 'grain_farm', name: lang === 'it' ? 'Fattoria (Grano)' : 'Grain Farm', effectiveKey: 'grain_farm_e', ineffectiveKey: 'grain_farm_i', hasIneffective: true, goodId: 'grain' },
    { id: 'hemp_farm', name: lang === 'it' ? 'Piantagione (Canapa)' : 'Hemp Farm', effectiveKey: 'hemp_farm_e', ineffectiveKey: 'hemp_farm_i', hasIneffective: true, goodId: 'hemp' },
    { id: 'apiary', name: lang === 'it' ? 'Apicoltore (Miele)' : 'Apiary (Honey)', effectiveKey: 'apiary_e', ineffectiveKey: 'apiary_i', hasIneffective: true, goodId: 'honey' },
    { id: 'hunting_lodge', name: lang === 'it' ? 'Cacciatore (Pelli)' : 'Hunting Lodge (Skins)', effectiveKey: 'hunting_lodge_e', ineffectiveKey: 'hunting_lodge_i', hasIneffective: true, goodId: 'skins' },
    { id: 'pitchmaker', name: lang === 'it' ? 'Fornace di Pece' : 'Pitchmaker', effectiveKey: 'pitchmaker_e', ineffectiveKey: '', hasIneffective: false, goodId: 'pitch' },
    { id: 'sawmill', name: lang === 'it' ? 'Segheria (Legno)' : 'Sawmill (Timber)', effectiveKey: 'sawmill_e', ineffectiveKey: 'sawmill_i', hasIneffective: true, goodId: 'timber' },
    { id: 'sheep_farm', name: lang === 'it' ? 'Allevamento Ovini (Lana)' : 'Sheep Farm (Wool)', effectiveKey: 'sheep_farm_e', ineffectiveKey: 'sheep_farm_i', hasIneffective: true, goodId: 'wool' },
    { id: 'saltworks', name: lang === 'it' ? 'Salina (Sale)' : 'Saltworks', effectiveKey: 'saltworks_e', ineffectiveKey: '', hasIneffective: false, goodId: 'salt' },
    { id: 'pottery_workshop', name: lang === 'it' ? 'Laboratorio Ceramica' : 'Pottery Workshop', effectiveKey: 'pottery_workshop_e', ineffectiveKey: 'pottery_workshop_i', hasIneffective: true, goodId: 'pottery' },
    { id: 'cattle_farm_leather', name: lang === 'it' ? 'Allevamento Bovini (Cuoio)' : 'Cattle Farm (Leather)', effectiveKey: 'cattle_farm_leather_e', ineffectiveKey: 'cattle_farm_leather_i', hasIneffective: true, goodId: 'leather' },
    { id: 'cattle_farm_meat', name: lang === 'it' ? 'Allevamento Bovini (Carne)' : 'Cattle Farm (Meat)', effectiveKey: 'cattle_farm_meat_e', ineffectiveKey: 'cattle_farm_meat_i', hasIneffective: true, goodId: 'meat' },
    { id: 'weaving_mill', name: lang === 'it' ? 'Tessitura (Tessuti)' : 'Weaving Mill (Cloth)', effectiveKey: 'weaving_mill_e', ineffectiveKey: '', hasIneffective: false, goodId: 'cloth' },
    { id: 'vineyard', name: lang === 'it' ? 'Vigneto (Vino)' : 'Vineyard (Wine)', effectiveKey: 'vineyard_e', ineffectiveKey: 'vineyard_i', hasIneffective: true, goodId: 'wine' },
    { id: 'workshop', name: lang === 'it' ? 'Officina (Utensili)' : 'Workshop (Iron Goods)', effectiveKey: 'workshop_e', ineffectiveKey: '', hasIneffective: false, goodId: 'iron_goods' },
    { id: 'brickworks', name: lang === 'it' ? 'Fornace (Mattoni)' : 'Brickworks', effectiveKey: 'brickworks_e', ineffectiveKey: 'brickworks_i', hasIneffective: true, goodId: 'bricks' }
  ];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">{t('dashboard.businesses_title')}</h1>
          <p className="text-sm text-neutral-medium mt-1">
            {t('dashboard.businesses_desc')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-light/50 p-1 rounded border border-neutral-medium shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-white text-primary shadow-sm'
                : 'text-neutral-medium hover:text-neutral-dark'
            }`}
          >
            {t('dashboard.tab_league_summary')}
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cities'
                ? 'bg-white text-primary shadow-sm'
                : 'text-neutral-medium hover:text-neutral-dark'
            }`}
          >
            {t('dashboard.tab_city_breakdown')}
          </button>
        </div>
      </div>

      {activeTab === 'summary' ? (
        <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm border-collapse">
              <thead className="bg-neutral-light text-neutral-dark font-semibold border-b border-neutral-light">
                <tr>
                  <th className="p-3 border-r border-neutral-light">{t('dashboard.col_business')}</th>
                  <th className="p-3 border-r border-neutral-light text-right">{t('dashboard.col_effective')}</th>
                  <th className="p-3 border-r border-neutral-light text-right">{t('dashboard.col_ineffective')}</th>
                  <th className="p-3 border-r border-neutral-light text-right bg-neutral-light/30">{t('dashboard.col_total_equiv')}</th>
                  <th className="p-3 border-r border-neutral-light text-right text-amber-700 bg-amber-50/20">
                    <div className="flex items-center justify-end space-x-1">
                      <Sun className="h-3.5 w-3.5" />
                      <span>{t('dashboard.col_demand_summer')}</span>
                    </div>
                  </th>
                  <th className="p-3 border-r border-neutral-light text-right text-sky-700 bg-sky-50/20">
                    <div className="flex items-center justify-end space-x-1">
                      <Snowflake className="h-3.5 w-3.5" />
                      <span>{t('dashboard.col_demand_winter')}</span>
                    </div>
                  </th>
                  <th className="p-3 border-r border-neutral-light text-right text-primary bg-neutral-light/20">{t('dashboard.col_demand_weighted')}</th>
                  <th className="p-3 text-right">{t('dashboard.col_balance')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const effectiveCount = game.getBusinessesCount(row.effectiveKey);
                  const ineffectiveCount = row.hasIneffective ? game.getBusinessesCount(row.ineffectiveKey) : 0;
                  const equivalent = game.getBusinessesEquivalent(row.effectiveKey);
                  
                  const demandSummer = game.getTheoreticalRequiredBusinesses(row.effectiveKey, 'summer');
                  const demandWinter = game.getTheoreticalRequiredBusinesses(row.effectiveKey, 'winter');
                  const demandWeighted = parseFloat(((demandSummer * 3 + demandWinter) / 4).toFixed(2));
                  
                  const balance = parseFloat((equivalent - demandWeighted).toFixed(2));

                  return (
                    <tr key={row.id} className="border-b border-neutral-light hover:bg-neutral-light/10">
                      <td className="p-3 border-r border-neutral-light font-semibold text-neutral-dark flex items-center space-x-2">
                        <img 
                          src={getGoodImagePath(row.goodId)} 
                          alt={row.name} 
                          className="h-5 w-5 object-contain shrink-0" 
                        />
                        <span>{row.name}</span>
                      </td>
                      <td className="p-3 border-r border-neutral-light text-right font-medium">{effectiveCount}</td>
                      <td className="p-3 border-r border-neutral-light text-right text-neutral-medium">{row.hasIneffective ? ineffectiveCount : '-'}</td>
                      <td className="p-3 border-r border-neutral-light text-right font-bold bg-neutral-light/10">{equivalent.toFixed(2)}</td>
                      <td className="p-3 border-r border-neutral-light text-right font-medium text-amber-800 bg-amber-50/10">{demandSummer}</td>
                      <td className="p-3 border-r border-neutral-light text-right font-medium text-sky-800 bg-sky-50/10">{demandWinter}</td>
                      <td className="p-3 border-r border-neutral-light text-right font-bold text-neutral-dark bg-neutral-light/5">{demandWeighted.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          balance > 0 
                            ? 'bg-green-100 text-green-800' 
                            : balance < 0
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : 'bg-neutral-light text-neutral-dark border border-neutral-medium/25'
                        }`}>
                          {balance > 0 ? '+' : ''}{balance.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-neutral-light/20 text-xs text-neutral-medium flex items-start space-x-2 border-t border-neutral-light">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>{t('dashboard.col_total_equiv')}:</strong> Calcolato ricalcolando le imprese inefficienti (penalità del -25%) secondo i coefficienti reali del gioco.
              </p>
              <p>
                <strong>{t('dashboard.col_demand_weighted')}:</strong> Media ponderata (75% Estate, 25% Inverno) del fabbisogno della Lega.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTowns.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm">
              {t('dashboard.no_towns_added')}
            </div>
          ) : (
            activeTowns.map(town => {
              const townState = game.state.towns[town.id];
              if (!townState) return null;

              // Filter out businesses that actually have count > 0 in this town
              const activeBiz = Object.entries(townState.businesses)
                .filter(([_, state]) => state.count > 0)
                .map(([bId, state]) => {
                  const ref = businesses.find(b => b.id === bId);
                  return {
                    id: bId,
                    name: ref ? ref.name : bId,
                    count: state.count,
                    efficiency: state.efficiency
                  };
                });

              return (
                <div key={town.id} className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-light pb-2">
                    <span className="font-bold text-neutral-dark text-lg">{town.name}</span>
                    <span className="text-xs text-neutral-medium bg-neutral-light border px-2 py-0.5 rounded font-semibold">
                      {activeBiz.length} {lang === 'it' ? 'Tipi Laboratorio' : 'Business Types'}
                    </span>
                  </div>

                  {activeBiz.length === 0 ? (
                    <div className="text-xs text-neutral-medium italic py-2">
                      {lang === 'it' ? 'Nessuna impresa costruita in questa città.' : 'No businesses constructed in this city.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {activeBiz.map(biz => (
                        <div key={biz.id} className="flex items-center justify-between p-2 bg-neutral-light/20 rounded border border-neutral-light">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <img 
                              src={getGoodImagePath(getGoodIdFromBusinessId(biz.id))} 
                              alt={biz.name} 
                              className="h-5 w-5 object-contain shrink-0" 
                            />
                            <span className="font-semibold text-neutral-dark truncate max-w-[120px]" title={biz.name}>
                              {biz.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span className="font-bold text-neutral-dark bg-white border px-1.5 py-0.5 rounded shadow-sm">
                              x{biz.count}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              biz.efficiency === 2 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {biz.efficiency === 2 ? 'Eff' : 'Ineff'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Businesses;
