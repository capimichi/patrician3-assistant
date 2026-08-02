import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useTranslation } from 'react-i18next';
import UninitializedWarning from '../../components/UninitializedWarning';
import { Camera, Trash2, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface Snapshot {
  id: string;
  gameDate: string;
  gameYear: number;
  gameMonth: number;
  gameDay: number;
  label: string;
  timestamp: string;
  population: { rich: number; wealthy: number; poor: number };
  houses: { fachwerk: number; giebel: number; kaufmann: number };
  totalBusinesses: number;
}

const Snapshots: React.FC = () => {
  const { game } = useGame();
  const { i18n } = useTranslation();

  const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

  // Game date loaded from local storage for initial values
  const [day, setDay] = useState<number>(10);
  const [month, setMonth] = useState<number>(5);
  const [year, setYear] = useState<number>(1300);
  const [label, setLabel] = useState<string>('');

  // Snapshots list
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    const savedDay = localStorage.getItem('pii_game_date_day');
    const savedMonth = localStorage.getItem('pii_game_date_month');
    const savedYear = localStorage.getItem('pii_game_date_year');
    const savedSnapshots = localStorage.getItem('pii_game_snapshots');

    if (savedDay) setDay(parseInt(savedDay));
    if (savedMonth) setMonth(parseInt(savedMonth));
    if (savedYear) setYear(parseInt(savedYear));
    if (savedSnapshots) setSnapshots(JSON.parse(savedSnapshots));
  }, []);

  if (!game) {
    return <UninitializedWarning />;
  }

  // Create new snapshot of current game state
  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Calculate active league aggregates
    let poor = 0;
    let wealthy = 0;
    let rich = 0;

    let fachwerk = 0;
    let giebel = 0;
    let kaufmann = 0;

    let totalBusinesses = 0;

    Object.values(game.state.towns).forEach(tState => {
      if (tState.isActive) {
        poor += tState.population.poor;
        wealthy += tState.population.wealthy;
        rich += tState.population.rich;

        fachwerk += tState.houses.fachwerk;
        giebel += tState.houses.giebel;
        kaufmann += tState.houses.kaufmann;

        Object.values(tState.businesses).forEach(bState => {
          totalBusinesses += bState.count;
        });
      }
    });

    const newSnapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      gameDate: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`,
      gameYear: year,
      gameMonth: month,
      gameDay: day,
      label: label.trim() || (lang === 'it' ? `Istantanea del ${day}/${month}` : `Snapshot ${day}/${month}`),
      timestamp: new Date().toLocaleString(),
      population: { rich, wealthy, poor },
      houses: { fachwerk, giebel, kaufmann },
      totalBusinesses
    };

    const updated = [...snapshots, newSnapshot].sort((a, b) => {
      // Sort chronologically by game date
      if (a.gameYear !== b.gameYear) return a.gameYear - b.gameYear;
      if (a.gameMonth !== b.gameMonth) return a.gameMonth - b.gameMonth;
      return a.gameDay - b.gameDay;
    });

    setSnapshots(updated);
    localStorage.setItem('pii_game_snapshots', JSON.stringify(updated));
    setLabel('');
  };

  // Delete snapshot
  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    localStorage.setItem('pii_game_snapshots', JSON.stringify(updated));
  };

  // Months listing
  const monthsList = [
    { value: 1, name: lang === 'it' ? 'Gennaio' : 'January' },
    { value: 2, name: lang === 'it' ? 'Febbraio' : 'February' },
    { value: 3, name: lang === 'it' ? 'Marzo' : 'March' },
    { value: 4, name: lang === 'it' ? 'Aprile' : 'April' },
    { value: 5, name: lang === 'it' ? 'Maggio' : 'May' },
    { value: 6, name: lang === 'it' ? 'Giugno' : 'June' },
    { value: 7, name: lang === 'it' ? 'Luglio' : 'July' },
    { value: 8, name: lang === 'it' ? 'Agosto' : 'August' },
    { value: 9, name: lang === 'it' ? 'Settembre' : 'September' },
    { value: 10, name: lang === 'it' ? 'Ottobre' : 'October' },
    { value: 11, name: lang === 'it' ? 'Novembre' : 'November' },
    { value: 12, name: lang === 'it' ? 'Dicembre' : 'December' }
  ];

  // Draw custom SVG Line Chart for population growth
  const renderPopulationChart = () => {
    if (snapshots.length < 2) {
      return (
        <div className="p-12 text-center text-xs text-neutral-medium border border-dashed rounded bg-neutral-light/5">
          {lang === 'it' 
            ? 'Salva almeno due istantanee in date diverse per visualizzare il grafico di andamento.'
            : 'Save at least two snapshots at different game dates to draw progress charts.'}
        </div>
      );
    }

    const width = 500;
    const height = 200;
    const padding = 35;

    // Find min/max values
    const pops = snapshots.map(s => s.population.poor + s.population.wealthy + s.population.rich);
    const minPop = 0;
    const maxPop = Math.max(...pops) * 1.15; // 15% padding at top

    // X coordinates: spaced evenly
    const getX = (idx: number) => {
      return padding + (idx * (width - 2 * padding)) / (snapshots.length - 1);
    };

    // Y coordinates
    const getY = (val: number) => {
      return height - padding - ((val - minPop) * (height - 2 * padding)) / (maxPop - minPop);
    };

    // Draw line paths
    let poorPath = '';
    let wealthyPath = '';
    let richPath = '';
    let totalPath = '';

    snapshots.forEach((s, idx) => {
      const x = getX(idx);
      
      const yPoor = getY(s.population.poor);
      const yWealthy = getY(s.population.wealthy);
      const yRich = getY(s.population.rich);
      const yTotal = getY(s.population.poor + s.population.wealthy + s.population.rich);

      if (idx === 0) {
        poorPath = `M ${x} ${yPoor}`;
        wealthyPath = `M ${x} ${yWealthy}`;
        richPath = `M ${x} ${yRich}`;
        totalPath = `M ${x} ${yTotal}`;
      } else {
        poorPath += ` L ${x} ${yPoor}`;
        wealthyPath += ` L ${x} ${yWealthy}`;
        richPath += ` L ${x} ${yRich}`;
        totalPath += ` L ${x} ${yTotal}`;
      }
    });

    return (
      <div className="space-y-4">
        {/* SVG Wrapper */}
        <div className="bg-neutral-light/10 p-4 border rounded shadow-xs relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Grid lines */}
            <line x1={padding} y1={getY(minPop)} x2={width - padding} y2={getY(minPop)} stroke="#DFD9C0" strokeWidth="1.5" />
            <line x1={padding} y1={getY(maxPop / 2)} x2={width - padding} y2={getY(maxPop / 2)} stroke="#DFD9C0" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1={padding} y1={getY(maxPop)} x2={width - padding} y2={getY(maxPop)} stroke="#DFD9C0" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Paths */}
            <path d={poorPath} fill="none" stroke="#643518" strokeWidth="2" strokeLinecap="round" />
            <path d={wealthyPath} fill="none" stroke="#EABE32" strokeWidth="2" strokeLinecap="round" />
            <path d={richPath} fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
            <path d={totalPath} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />

            {/* Dots */}
            {snapshots.map((s, idx) => {
              const x = getX(idx);
              const yTotal = getY(s.population.poor + s.population.wealthy + s.population.rich);
              return (
                <g key={s.id}>
                  <circle cx={x} cy={yTotal} r="3.5" className="fill-red-600 stroke-white stroke-2" />
                  {/* Date label */}
                  <text x={x} y={height - 10} className="text-[7px] font-bold fill-neutral-medium text-center" textAnchor="middle">
                    {s.gameDate.slice(0, 5)}
                  </text>
                </g>
              );
            })}

            {/* Y axis numbers */}
            <text x={padding - 5} y={getY(minPop) + 3} className="text-[7px] font-bold fill-neutral-medium" textAnchor="end">0</text>
            <text x={padding - 5} y={getY(maxPop / 2) + 3} className="text-[7px] font-bold fill-neutral-medium" textAnchor="end">{Math.round(maxPop / 2)}</text>
            <text x={padding - 5} y={getY(maxPop) + 3} className="text-[7px] font-bold fill-neutral-medium" textAnchor="end">{Math.round(maxPop)}</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-neutral-dark">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-red-600 border border-dashed border-red-600"></span>
            <span>{lang === 'it' ? 'Popolazione Totale' : 'Total Population'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-[#643518]"></span>
            <span>{lang === 'it' ? 'Poveri (Graticcio)' : 'Poor (FWH)'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-[#EABE32]"></span>
            <span>{lang === 'it' ? 'Benestanti (Timpano)' : 'Wealthy (GH)'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-[#15803d]"></span>
            <span>{lang === 'it' ? 'Ricchi (Kaufmann)' : 'Rich (KMH)'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-dark">
          {lang === 'it' ? 'Salvataggi e Istantanee di Progressi' : 'Campaign Progress Snapshots'}
        </h1>
        <p className="text-sm text-neutral-medium mt-1">
          {lang === 'it' 
            ? 'Crea punti di ripristino ed istantanee storiche per tracciare graficamente la crescita economica e demografica della tua lega.'
            : 'Capture snapshots of your Hanseatic empire to plot and analyze population and industrial growth over time.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: CAPTURE NEW SNAPSHOT */}
        <div className="space-y-6 self-start">
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
              <Camera className="h-4.5 w-4.5 text-primary" />
              <span>{lang === 'it' ? 'Salva Istantanea Attuale' : 'Save Current State'}</span>
            </div>

            <form onSubmit={handleSaveSnapshot} className="space-y-3">
              {/* Date preview */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Giorno' : 'Day'}</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value))}
                    className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white text-neutral-dark font-bold"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Mese' : 'Month'}</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full p-1.5 border border-neutral-medium rounded text-[11px] bg-white text-neutral-dark font-bold"
                  >
                    {monthsList.map(m => (
                      <option key={m.value} value={m.value}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Anno' : 'Year'}</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 1300)}
                    className="w-full p-1 border border-neutral-medium rounded text-xs bg-white text-neutral-dark font-bold text-center"
                  />
                </div>
              </div>

              {/* Note / Label */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Nota / Evento Istantanea' : 'Snapshot Note / Label'}</label>
                <input
                  type="text"
                  placeholder={lang === 'it' ? 'es. Fondate 2 nuove birrerie' : 'e.g. Built 2 new breweries'}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white text-neutral-dark font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-primary hover:bg-primary/95 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{lang === 'it' ? 'Crea Istantanea' : 'Capture Snapshot'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNS 2 & 3: CHART & HISTORICAL TIMELINE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Chart */}
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              <span>{lang === 'it' ? 'Andamento Demografico nel Tempo' : 'Historical Growth Charts'}</span>
            </div>

            {renderPopulationChart()}
          </div>

          {/* Historical timeline */}
          <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
            <div className="p-4 bg-neutral-light/20 border-b border-neutral-light font-bold text-neutral-dark text-sm flex items-center space-x-2">
              <BarChart3 className="h-4.5 w-4.5 text-primary" />
              <span>{lang === 'it' ? 'Cronologia delle Istantanee Salvate' : 'Saved Snapshots Log'}</span>
            </div>

            {snapshots.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-medium italic">
                {lang === 'it' 
                  ? 'Nessun salvataggio registrato. Salva una nuova istantanea per iniziare il tracciamento.'
                  : 'No snapshots logged yet. Capture a new state snapshot to begin tracking.'}
              </div>
            ) : (
              <div className="divide-y divide-neutral-light">
                {snapshots.map(s => {
                  const totalPop = s.population.poor + s.population.wealthy + s.population.rich;
                  const totalHouses = s.houses.fachwerk + s.houses.giebel + s.houses.kaufmann;

                  return (
                    <div key={s.id} className="p-4 hover:bg-neutral-light/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-xs font-black text-neutral-dark">{s.gameDate}</span>
                          <span className="text-xs text-neutral-medium font-bold">({s.label})</span>
                        </div>
                        <div className="text-[10px] text-neutral-medium font-semibold">
                          {lang === 'it' ? 'Salvato il:' : 'Captured on:'} {s.timestamp}
                        </div>
                      </div>

                      {/* Info badges */}
                      <div className="flex items-center space-x-4">
                        <div className="text-center text-[10px] font-bold text-neutral-dark bg-neutral-light/50 border border-neutral-medium/25 px-2.5 py-1 rounded shadow-2xs">
                          <div className="text-neutral-medium uppercase text-[8px] font-black">{lang === 'it' ? 'Abitanti' : 'Residents'}</div>
                          <div className="text-xs font-black mt-0.5">{totalPop.toLocaleString()}</div>
                        </div>

                        <div className="text-center text-[10px] font-bold text-neutral-dark bg-neutral-light/50 border border-neutral-medium/25 px-2.5 py-1 rounded shadow-2xs">
                          <div className="text-neutral-medium uppercase text-[8px] font-black">{lang === 'it' ? 'Case' : 'Houses'}</div>
                          <div className="text-xs font-black mt-0.5">{totalHouses}</div>
                        </div>

                        <div className="text-center text-[10px] font-bold text-neutral-dark bg-neutral-light/50 border border-neutral-medium/25 px-2.5 py-1 rounded shadow-2xs">
                          <div className="text-neutral-medium uppercase text-[8px] font-black">{lang === 'it' ? 'Imprese' : 'Businesses'}</div>
                          <div className="text-xs font-black mt-0.5">{s.totalBusinesses}</div>
                        </div>

                        <button
                          onClick={() => handleDeleteSnapshot(s.id)}
                          className="p-1.5 rounded text-neutral-medium hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snapshots;
