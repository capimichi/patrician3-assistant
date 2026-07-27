import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { getGoodImagePath } from '../../utils/goodImage';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import { ListControls } from '../../components/ListControls';
import { GoldAmount } from '../../components/GoldAmount';
import { GameIcon } from '../../components/GameIcon';

const ALL_COLUMNS = [
  { id: 'basePrice', labelIt: 'Prezzo Base', labelEn: 'Base Price' },
  { id: 'buyPrice', labelIt: 'Acquisto Max', labelEn: 'Buy Max' },
  { id: 'sellPrice', labelIt: 'Vendita Min', labelEn: 'Sell Min' },
  { id: 'maxSatisfaction', labelIt: 'Soddisfazione', labelEn: 'Satisfaction' },
  { id: 'volume', labelIt: 'Stiva (Volume)', labelEn: 'Cargo Volume' },
  { id: 'type', labelIt: 'Tipo', labelEn: 'Type' }
];

const GoodsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { goodService } = useServices();
  const navigate = useNavigate();

  const [goods, setGoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    // Carica impostazioni colonne
    const saved = localStorage.getItem('patrician3_goods_columns');
    if (saved) {
      try {
        setVisibleColumns(JSON.parse(saved));
      } catch {
        setVisibleColumns(ALL_COLUMNS.map(c => c.id));
      }
    } else {
      setVisibleColumns(ALL_COLUMNS.map(c => c.id));
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const loadedGoods = await goodService.getGoods(currentLang);
        setGoods(loadedGoods);
      } catch (err) {
        console.error('Errore nel caricamento delle merci', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [goodService, currentLang]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (columnId: string) => {
    let updated: string[];
    if (visibleColumns.includes(columnId)) {
      updated = visibleColumns.filter(id => id !== columnId);
    } else {
      updated = [...visibleColumns, columnId];
    }
    setVisibleColumns(updated);
    localStorage.setItem('patrician3_goods_columns', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading') || 'Caricamento...'}</span>
      </div>
    );
  }

  const filteredGoods = goods.filter(good => {
    if (searchQuery.trim().length < 3) return true;
    return good.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 text-neutral-dark">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          {t('database_goods.title')}
        </h1>
        <p className="text-gray-700 text-sm mt-1">
          {t('database_goods.desc')}
        </p>
      </div>

      {/* Area Controlli superiore */}
      <ListControls
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={t('common.search_goods')}
        rightActions={
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-neutral-dark font-bold rounded shadow border border-primary/20 hover:bg-secondary/90 transition-colors animate-micro"
              aria-label={t('database_goods.columns_btn')}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{t('database_goods.columns_btn')}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background rounded-lg border border-primary/30 shadow-2xl p-4 z-50 dropdown-solido">
                <h4 className="text-xs font-bold font-serif text-primary uppercase border-b border-primary/20 pb-2 mb-2">{t('database_goods.columns_title')}</h4>
                <div className="space-y-2">
                  {ALL_COLUMNS.map(col => (
                    <label key={col.id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.id)}
                        onChange={() => toggleColumn(col.id)}
                        className="rounded text-primary focus:ring-primary border-primary/30"
                      />
                      <span>{currentLang === 'it' ? col.labelIt : col.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Tabella Merci */}
      <div className="bg-white border border-primary/20 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/15">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">{t('database_goods.col_good')}</th>
                {visibleColumns.includes('basePrice') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">{t('database_goods.col_base_price')}</th>}
                {visibleColumns.includes('buyPrice') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">{t('database_goods.col_buy_max')}</th>}
                {visibleColumns.includes('sellPrice') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">{t('database_goods.col_sell_min')}</th>}
                {visibleColumns.includes('maxSatisfaction') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">{t('database_goods.col_satisfaction')}</th>}
                {visibleColumns.includes('volume') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">{t('database_goods.col_volume')}</th>}
                {visibleColumns.includes('type') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">{t('database_goods.col_type')}</th>}
                <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">{t('database_goods.col_details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {filteredGoods.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="px-6 py-12 text-center text-gray-500 italic font-serif">
                    {t('common.no_results')} "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredGoods.map((good) => (
                <tr
                  key={good.id}
                  onClick={() => navigate(`/database/goods/${good.id}`)}
                  className="cursor-pointer transition-colors hover:bg-primary/5 bg-background border-l-4 border-transparent hover:border-secondary"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getGoodImagePath(good.id)}
                        alt={good.name}
                        className="h-8 w-8 object-contain border border-primary/20 rounded bg-white p-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                        }}
                      />
                      <div className="text-sm font-semibold text-neutral-dark">{good.name}</div>
                    </div>
                  </td>
                  
                  {visibleColumns.includes('basePrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <GoldAmount amount={good.basePrice} className="font-mono text-neutral-dark text-sm" />
                    </td>
                  )}

                  {visibleColumns.includes('buyPrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <GoldAmount
                        amount={good.buyPriceRange[0] === good.buyPriceRange[1] 
                          ? `${good.buyPriceRange[0]}` 
                          : `${good.buyPriceRange[0]}-${good.buyPriceRange[1]}`}
                        className="font-mono font-semibold text-success text-sm"
                      />
                    </td>
                  )}

                  {visibleColumns.includes('sellPrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <GoldAmount
                        amount={`${good.sellPriceRange[0]}-${good.sellPriceRange[1]}`}
                        className="font-mono font-bold text-primary text-sm"
                      />
                    </td>
                  )}

                  {visibleColumns.includes('maxSatisfaction') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {good.maxSatisfactionPrice ? (
                        <GoldAmount amount={good.maxSatisfactionPrice} className="font-mono text-gray-700 text-sm" />
                      ) : '-'}
                    </td>
                  )}

                  {visibleColumns.includes('volume') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                      {good.volume} {good.volume === 1 ? t('database_goods.barrel') : t('database_goods.barrels')}
                    </td>
                  )}

                  {visibleColumns.includes('type') && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 text-2xs font-bold uppercase rounded-full inline-flex items-center ${
                        good.isImported
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : good.isRawMaterial
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}>
                        {good.isRawMaterial ? (
                          <GameIcon type="load" className="h-3 w-3 mr-1" />
                        ) : !good.isImported ? (
                          <GameIcon type="barrel" className="h-3 w-3 mr-1" />
                        ) : null}
                        {good.isImported 
                          ? t('database_goods.type_imported') 
                          : good.isRawMaterial 
                          ? t('database_goods.type_raw') 
                          : t('database_goods.type_finished')}
                      </span>
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center text-primary text-xs font-bold hover:text-primary/80 transition-colors uppercase tracking-wider">
                      <span>{t('database_goods.detail')}</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoodsList;
