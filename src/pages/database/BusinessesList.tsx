import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { SlidersHorizontal, ArrowRight, Coins } from 'lucide-react';
import { getGoodImagePath } from '../../utils/goodImage';
import { getBusinessImagePath } from '../../utils/businessImage';
import { ListControls } from '../../components/ListControls';

const ALL_COLUMNS = [
  { id: 'product', labelIt: 'Bene Prodotto', labelEn: 'Produced Good' },
  { id: 'production', labelIt: 'Produzione', labelEn: 'Production' },
  { id: 'maintenance', labelIt: 'Manutenzione', labelEn: 'Maintenance' },
  { id: 'inputs', labelIt: 'Materie Prime', labelEn: 'Raw Materials' },
  { id: 'workers', labelIt: 'Lavoratori', labelEn: 'Workers' },
  { id: 'cost', labelIt: 'Costi Edificazione', labelEn: 'Build Cost' }
];

const BusinessesList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { businessService, goodService } = useServices();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [goods, setGoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const saved = localStorage.getItem('patrician3_businesses_columns');
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
        const loadedB = await businessService.getBusinesses(currentLang);
        const loadedG = await goodService.getGoods(currentLang);
        setBusinesses(loadedB);
        setGoods(loadedG);
      } catch (err) {
        console.error('Errore nel caricamento delle imprese', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [businessService, goodService, currentLang]);

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
    localStorage.setItem('patrician3_businesses_columns', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 font-serif uppercase tracking-wider text-primary">{t('common.loading')}</span>
      </div>
    );
  }

  const filteredBusinesses = businesses.filter(business => {
    if (searchQuery.trim().length < 3) return true;
    return business.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 text-neutral-dark">
      <div>
        <h1 className="text-3xl font-extrabold text-primary tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          Database Imprese & Officine
        </h1>
        <p className="text-gray-700 text-sm mt-1">
          Analizza i costi di edificazione, manutenzione ed il consumo di materie prime delle fabbriche private della Lega Anseatica.
        </p>
      </div>

      {/* Area Controlli superiore */}
      <ListControls
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={t('common.search_businesses')}
        rightActions={
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-neutral-dark font-bold rounded shadow border border-primary/20 hover:bg-secondary/90 transition-colors"
              aria-label="Colonne"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Colonne</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background rounded-lg border border-primary/30 shadow-2xl p-4 z-50 dropdown-solido">
                <h4 className="text-xs font-bold font-serif text-primary uppercase border-b border-primary/20 pb-2 mb-2">Visualizza Colonne</h4>
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

      {/* Tabella Imprese */}
      <div className="bg-white border border-primary/20 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/15">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Impresa</th>
                {visibleColumns.includes('product') && <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Bene Prodotto</th>}
                {visibleColumns.includes('production') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Produzione</th>}
                {visibleColumns.includes('maintenance') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Manutenzione</th>}
                {visibleColumns.includes('inputs') && <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Materie Prime</th>}
                {visibleColumns.includes('workers') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Lavoratori</th>}
                {visibleColumns.includes('cost') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Costi Edificazione</th>}
                <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Dettagli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="px-6 py-12 text-center text-gray-500 italic font-serif">
                    {t('common.no_results')} "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((business) => {
                return (
                  <tr
                    key={business.id}
                    onClick={() => navigate(`/database/businesses/${business.id}`)}
                    className="cursor-pointer transition-colors hover:bg-primary/5 bg-background border-l-4 border-transparent hover:border-secondary"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getBusinessImagePath(business.id)}
                          alt={business.name}
                          className="h-10 w-10 object-cover border border-primary/10 rounded bg-background p-0.5 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                          }}
                        />
                        <div className="text-sm font-bold text-neutral-dark">{business.name}</div>
                      </div>
                    </td>
                    
                    {visibleColumns.includes('product') && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {business.outputs.map((out: any) => {
                            const productGood = goods.find(g => g.id === out.goodId);
                            const productName = productGood ? productGood.name : out.goodId;
                            return (
                              <div key={out.goodId} className="flex items-center space-x-2">
                                <img
                                  src={getGoodImagePath(out.goodId)}
                                  alt={productName}
                                  className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                                  }}
                                />
                                <span className="text-xs text-gray-700 font-semibold">{productName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('production') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-success font-mono">
                        <div className="flex flex-col space-y-1.5">
                          {business.outputs.map((out: any) => (
                            <div key={out.goodId} className="flex justify-center items-center h-6">
                              <span>+{out.amountPerDay}</span>
                              <span className="text-[10px] font-normal text-gray-500 font-sans ml-0.5">/g</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('maintenance') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-danger font-mono">
                        {business.dailyMaintenance} g <span className="text-[10px] font-normal text-gray-500 font-sans">/g</span>
                      </td>
                    )}

                    {visibleColumns.includes('inputs') && (
                      <td className="px-6 py-4">
                        {business.inputs.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {business.inputs.map((input: any) => {
                              const inputGoodObj = goods.find(g => g.id === input.goodId);
                              const inputGoodName = inputGoodObj ? inputGoodObj.name : input.goodId;
                              return (
                                <div key={input.goodId} className="flex items-center space-x-1 bg-background border border-primary/5 px-1.5 py-0.5 rounded shadow-2xs" title={inputGoodName}>
                                  <img
                                    src={getGoodImagePath(input.goodId)}
                                    alt={inputGoodName}
                                    className="h-4 w-4 object-contain bg-white rounded p-0.5"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                                    }}
                                  />
                                  <span className="text-[10px] font-mono text-danger">-{input.amountPerDay}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-bold uppercase">
                            Autonoma
                          </span>
                        )}
                      </td>
                    )}

                    {visibleColumns.includes('workers') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                        {business.workersNeeded}
                      </td>
                    )}

                    {visibleColumns.includes('cost') && (
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-center font-mono text-gray-700">
                        <span className="inline-flex flex-col text-left space-y-0.5 bg-background p-1.5 rounded border border-primary/5">
                          <span className="flex items-center text-[10px]"><Coins className="h-3 w-3 text-primary mr-1" />{business.constructionCost.gold}g</span>
                          <span className="flex items-center text-[10px]">🧱 {business.constructionCost.bricks}</span>
                          <span className="flex items-center text-[10px]">🪵 {business.constructionCost.timber}</span>
                        </span>
                      </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center text-primary text-xs font-bold hover:text-primary/80 transition-colors uppercase tracking-wider">
                        <span>Vedi</span>
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusinessesList;
