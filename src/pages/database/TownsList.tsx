import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServices } from '../../servicesContext';
import { SlidersHorizontal, ArrowRight, Compass, MapPin, Waves } from 'lucide-react';
import { getGoodImagePath } from '../../utils/goodImage';
import type { Town } from '../../types';

const ALL_COLUMNS = [
  { id: 'type', labelIt: 'Tipo Porto', labelEn: 'Port Type' },
  { id: 'produces', labelIt: 'Specializzazioni', labelEn: 'Specializations' },
  { id: 'specCount', labelIt: 'N. Specializzazioni', labelEn: 'Spec. Count' },
  { id: 'coordinates', labelIt: 'Coordinate', labelEn: 'Coordinates' }
];

const TownsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { townService, goodService } = useServices();
  const navigate = useNavigate();

  const [towns, setTowns] = useState<Town[]>([]);
  const [goods, setGoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language === 'it' || i18n.language === 'en') ? i18n.language : 'en';

  useEffect(() => {
    const saved = localStorage.getItem('patrician3_towns_columns');
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
        const loadedTowns = await townService.getTowns();
        const loadedGoods = await goodService.getGoods(currentLang);
        setTowns(loadedTowns);
        setGoods(loadedGoods);
      } catch (err) {
        console.error('Errore nel caricamento delle città', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [townService, goodService, currentLang]);

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
    localStorage.setItem('patrician3_towns_columns', JSON.stringify(updated));
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-wide uppercase font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
            Database Città dell'Hansa
          </h1>
          <p className="text-gray-700 text-sm mt-1">
            Analizza la rete delle città storiche della Lega Anseatica, i loro porti e le loro produzioni specializzate.
          </p>
        </div>

        {/* Menu Selettore Colonne */}
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
      </div>

      {/* Tabella Città */}
      <div className="bg-white border border-primary/20 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/15">
            <thead className="bg-primary/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Città</th>
                {visibleColumns.includes('type') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Tipo Porto</th>}
                {visibleColumns.includes('produces') && <th className="px-6 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider">Specializzazioni</th>}
                {visibleColumns.includes('specCount') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">N. Merci</th>}
                {visibleColumns.includes('coordinates') && <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Coordinate</th>}
                <th className="px-6 py-3 text-center text-xs font-semibold text-primary uppercase tracking-wider">Dettagli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {towns.map((town) => (
                <tr
                  key={town.id}
                  onClick={() => navigate(`/database/towns/${town.id}`)}
                  className="cursor-pointer transition-colors hover:bg-primary/5 bg-background border-l-4 border-transparent hover:border-secondary"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Compass className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-sm font-semibold text-neutral-dark">{town.name}</div>
                      {town.isRiverTown && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          Fluviale
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {visibleColumns.includes('type') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center text-xs font-semibold ${town.isRiverTown ? 'text-blue-800' : 'text-neutral-dark'}`}>
                        {town.isRiverTown ? (
                          <>
                            <Waves className="h-3.5 w-3.5 mr-1 text-blue-600" /> Porto Fluviale
                          </>
                        ) : (
                          <>Porto Marittimo</>
                        )}
                      </span>
                    </td>
                  )}

                  {visibleColumns.includes('produces') && (
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {town.produces.map((goodId) => {
                          const goodObj = goods.find(g => g.id === goodId);
                          const goodName = goodObj ? goodObj.name : goodId;
                          return (
                            <div key={goodId} className="relative group" title={goodName}>
                              <img
                                src={getGoodImagePath(goodId)}
                                alt={goodName}
                                className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5 shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  )}

                  {visibleColumns.includes('specCount') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                      {town.produces.length}
                    </td>
                  )}

                  {visibleColumns.includes('coordinates') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                      <span className="inline-flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-primary/70" />
                        X:{town.coordinate?.x || '-'}, Y:{town.coordinate?.y || '-'}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TownsList;
