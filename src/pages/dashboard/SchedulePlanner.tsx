import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useTranslation } from 'react-i18next';
import UninitializedWarning from '../../components/UninitializedWarning';
import { Calendar, Plus, Trash2, Bell, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface GameEvent {
  id: string;
  label: string;
  day: number;
  month: number;
  year?: number;
  isAnnual: boolean;
  isCustom?: boolean;
}

const SchedulePlanner: React.FC = () => {
  const { game } = useGame();
  const { i18n } = useTranslation();

  const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

  // Game date state (loaded from local storage, defaults to May 10th, 1300)
  const [currentDay, setCurrentDay] = useState<number>(10);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // May
  const [currentYear, setCurrentYear] = useState<number>(1300);
  const [alertDays, setAlertDays] = useState<number>(42); // 6 weeks default

  // Custom events list
  const [customEvents, setCustomEvents] = useState<GameEvent[]>([]);
  const [defaultEvents, setDefaultEvents] = useState<GameEvent[]>([]);

  // Form states for custom events
  const [newName, setNewName] = useState<string>('');
  const [newDay, setNewDay] = useState<number>(1);
  const [newMonth, setNewMonth] = useState<number>(1);
  const [newYear, setNewYear] = useState<number>(1300);
  const [newIsAnnual, setNewIsAnnual] = useState<boolean>(false);

  // Load date and custom events from localStorage
  useEffect(() => {
    const savedDay = localStorage.getItem('pii_game_date_day');
    const savedMonth = localStorage.getItem('pii_game_date_month');
    const savedYear = localStorage.getItem('pii_game_date_year');
    const savedAlert = localStorage.getItem('pii_game_date_alert');
    const savedCustom = localStorage.getItem('pii_game_custom_events');

    if (savedDay) setCurrentDay(parseInt(savedDay));
    if (savedMonth) setCurrentMonth(parseInt(savedMonth));
    if (savedYear) setCurrentYear(parseInt(savedYear));
    if (savedAlert) setAlertDays(parseInt(savedAlert));
    if (savedCustom) setCustomEvents(JSON.parse(savedCustom));

    // Fetch default events
    fetch('/data/default_events.json')
      .then(res => res.json())
      .then(data => setDefaultEvents(data))
      .catch(err => console.error("Error loading default events database", err));
  }, []);

  // Save changes to date settings
  const handleDateChange = (day: number, month: number, year: number) => {
    setCurrentDay(day);
    setCurrentMonth(month);
    setCurrentYear(year);
    localStorage.setItem('pii_game_date_day', day.toString());
    localStorage.setItem('pii_game_date_month', month.toString());
    localStorage.setItem('pii_game_date_year', year.toString());
  };

  const handleAlertChange = (days: number) => {
    setAlertDays(days);
    localStorage.setItem('pii_game_date_alert', days.toString());
  };

  // Add custom event
  const handleAddCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newEvent: GameEvent = {
      id: `custom-${Date.now()}`,
      label: newName.trim(),
      day: newDay,
      month: newMonth,
      year: newIsAnnual ? undefined : newYear,
      isAnnual: newIsAnnual,
      isCustom: true
    };

    const updated = [...customEvents, newEvent];
    setCustomEvents(updated);
    localStorage.setItem('pii_game_custom_events', JSON.stringify(updated));

    // Reset form
    setNewName('');
    setNewIsAnnual(false);
  };

  // Delete custom event
  const handleDeleteCustomEvent = (id: string) => {
    const updated = customEvents.filter(ev => ev.id !== id);
    setCustomEvents(updated);
    localStorage.setItem('pii_game_custom_events', JSON.stringify(updated));
  };

  if (!game) {
    return <UninitializedWarning />;
  }

  // Combine default and custom events
  const allEvents = [...defaultEvents, ...customEvents];

  // Helper: calculate next occurrence and days remaining
  const calculateDaysRemaining = (ev: GameEvent) => {
    let targetYear = ev.year || currentYear;
    
    if (ev.isAnnual) {
      // If the event has already passed this year, it shifts to next year
      const currentFullDate = new Date(currentYear, currentMonth - 1, currentDay);
      const targetThisYear = new Date(currentYear, ev.month - 1, ev.day);
      
      if (targetThisYear.getTime() < currentFullDate.getTime()) {
        targetYear = currentYear + 1;
      } else {
        targetYear = currentYear;
      }
    }

    const currentDateObj = new Date(currentYear, currentMonth - 1, currentDay);
    const targetDateObj = new Date(targetYear, ev.month - 1, ev.day);

    const diffTime = targetDateObj.getTime() - currentDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      targetYear,
      diffDays
    };
  };

  // Process and sort events
  const processedEvents = allEvents.map(ev => {
    const { targetYear, diffDays } = calculateDaysRemaining(ev);
    return {
      ...ev,
      targetYear,
      diffDays
    };
  }).filter(ev => ev.diffDays >= 0) // Hide already passed events
    .sort((a, b) => a.diffDays - b.diffDays);

  const upcomingEvents = processedEvents.filter(ev => ev.diffDays <= alertDays);

  // Month options translation
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

  const getEventBadge = (label: string, isCustom?: boolean) => {
    if (isCustom) {
      return <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Custom</span>;
    }
    if (label.includes("BM-Wahl")) {
      return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{lang === 'it' ? 'Sindaco' : 'Mayor'}</span>;
    }
    if (label.includes("Eldermann")) {
      return <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{lang === 'it' ? 'Aldermanno' : 'Alderman'}</span>;
    }
    if (label.includes("Mauerbau")) {
      return <span className="bg-sky-100 text-sky-800 border border-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{lang === 'it' ? 'Muro' : 'Wall'}</span>;
    }
    return null;
  };

  const formatEventLabel = (label: string) => {
    return label
      .replace("-BM-Wahl", lang === 'it' ? " - Elezione Sindaco" : " - Mayoral Election")
      .replace("Eldermannwahl", lang === 'it' ? "Elezione Presidente della Lega (Eldermann)" : "Hanseatic Alderman Election")
      .replace("Mauerbau", lang === 'it' ? "Espansione Mura Cittadine" : "City Wall Expansion");
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-dark">
          {lang === 'it' ? 'Pianificatore Scadenze ed Eventi' : 'Elections & Deadlines Planner'}
        </h1>
        <p className="text-sm text-neutral-medium mt-1">
          {lang === 'it' 
            ? 'Gestisci le scadenze e monitora le elezioni sindacali e cittadine per pianificare le donazioni e i festeggiamenti.'
            : 'Track municipal mayoral elections, Alderman votes, and manage custom personal trade contracts.'}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* COLUMN 1: GAME DATE & SETTINGS */}
        <div className="space-y-6">
          {/* Game Date Settings Card */}
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              <span>{lang === 'it' ? 'Data di Gioco Corrente' : 'Current Game Date'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Day Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Giorno' : 'Day'}</label>
                <select
                  value={currentDay}
                  onChange={(e) => handleDateChange(parseInt(e.target.value), currentMonth, currentYear)}
                  className="w-full p-1.5 border border-neutral-medium rounded text-sm bg-white font-bold text-neutral-dark"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Mese' : 'Month'}</label>
                <select
                  value={currentMonth}
                  onChange={(e) => handleDateChange(currentDay, parseInt(e.target.value), currentYear)}
                  className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white font-bold text-neutral-dark"
                >
                  {monthsList.map(m => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Anno' : 'Year'}</label>
                <input
                  type="number"
                  value={currentYear}
                  onChange={(e) => handleDateChange(currentDay, currentMonth, parseInt(e.target.value) || 1300)}
                  className="w-full p-1 border border-neutral-medium rounded text-sm bg-white font-bold text-neutral-dark text-center"
                />
              </div>
            </div>

            {/* Alert days window */}
            <div className="pt-2 border-t border-neutral-light">
              <label className="block text-xs font-bold text-neutral-dark mb-1.5">
                {lang === 'it' ? 'Finestra di Allarme Anticipo:' : 'Alert Alert Window:'}
              </label>
              <select
                value={alertDays}
                onChange={(e) => handleAlertChange(parseInt(e.target.value))}
                className="w-full p-1.5 border border-neutral-medium rounded text-sm bg-white font-bold text-neutral-dark"
              >
                <option value={14}>{lang === 'it' ? '14 Giorni (2 settimane)' : '14 Days (2 weeks)'}</option>
                <option value={30}>{lang === 'it' ? '30 Giorni (circa 1 mese)' : '30 Days (approx. 1 month)'}</option>
                <option value={42}>{lang === 'it' ? '42 Giorni (6 settimane)' : '42 Days (6 weeks)'}</option>
                <option value={60}>{lang === 'it' ? '60 Giorni (2 mesi)' : '60 Days (2 months)'}</option>
                <option value={90}>{lang === 'it' ? '90 Giorni (3 mesi)' : '90 Days (3 months)'}</option>
              </select>
            </div>
          </div>

          {/* Add Custom Event Card */}
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
              <Plus className="h-4.5 w-4.5 text-primary" />
              <span>{lang === 'it' ? 'Crea Nuova Scadenza' : 'Add Custom Deadline'}</span>
            </div>

            <form onSubmit={handleAddCustomEvent} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Nome Evento / Contratto' : 'Event Name / Label'}</label>
                <input
                  type="text"
                  placeholder={lang === 'it' ? 'es. Restituzione Prestito Amburgo' : 'e.g. London Loan Payoff'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white text-neutral-dark font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Giorno' : 'Day'}</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(parseInt(e.target.value))}
                    className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white text-neutral-dark"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-medium mb-1">{lang === 'it' ? 'Mese' : 'Month'}</label>
                  <select
                    value={newMonth}
                    onChange={(e) => setNewMonth(parseInt(e.target.value))}
                    className="w-full p-1.5 border border-neutral-medium rounded text-xs bg-white text-neutral-dark"
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
                    disabled={newIsAnnual}
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value) || 1300)}
                    className="w-full p-1 border border-neutral-medium rounded text-xs bg-white text-neutral-dark text-center disabled:bg-neutral-light disabled:text-neutral-medium"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="newIsAnnual"
                  checked={newIsAnnual}
                  onChange={(e) => setNewIsAnnual(e.target.checked)}
                  className="rounded text-primary focus:ring-primary accent-primary"
                />
                <label htmlFor="newIsAnnual" className="text-xs text-neutral-dark font-semibold select-none cursor-pointer">
                  {lang === 'it' ? 'Ricorrente annuale' : 'Annual recurring'}
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-primary hover:bg-primary/95 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{lang === 'it' ? 'Aggiungi Scadenza' : 'Add Event'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNS 2 & 3: UPCOMING & ALL EVENTS LIST */}
        <div className="xl:col-span-2 space-y-6">
          {/* Urgent / Alert Events Alert panel */}
          <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
            <div className="p-4 bg-red-50/50 border-b border-neutral-light font-bold text-red-800 text-sm flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4.5 w-4.5 text-red-600 animate-bounce" />
                <span>{lang === 'it' ? 'Scadenze Imminenti (In Allerta)' : 'Urgent Events (Inside Alert Window)'}</span>
              </div>
              <span className="bg-red-100 text-red-900 border border-red-300 text-xs px-2 py-0.5 rounded font-black">
                {upcomingEvents.length}
              </span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-10 text-center text-xs text-neutral-medium italic flex flex-col items-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <span>
                  {lang === 'it' 
                    ? 'Nessun evento prioritario in vista all\'interno della finestra d\'allarme!'
                    : 'No urgent events inside the alert window!'}
                </span>
              </div>
            ) : (
              <div className="divide-y divide-neutral-light">
                {upcomingEvents.map(ev => (
                  <div key={ev.id} className="p-3.5 hover:bg-neutral-light/5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getEventBadge(ev.label, ev.isCustom)}
                        <span className="text-xs font-black text-neutral-dark">{formatEventLabel(ev.label)}</span>
                      </div>
                      <div className="text-[10px] text-neutral-medium font-semibold flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {lang === 'it' ? 'Data attesa:' : 'Target date:'} {ev.day.toString().padStart(2, '0')}/{ev.month.toString().padStart(2, '0')}/{ev.targetYear}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="flex items-center space-x-1 bg-red-100 text-red-800 border border-red-300 px-2 py-1 rounded text-xs font-black animate-pulse">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{ev.diffDays} {lang === 'it' ? 'gg rimasti' : 'days left'}</span>
                      </span>
                      {ev.isCustom && (
                        <button
                          onClick={() => handleDeleteCustomEvent(ev.id)}
                          className="p-1 rounded text-neutral-medium hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Schedule List */}
          <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
            <div className="p-4 bg-neutral-light/20 border-b border-neutral-light font-bold text-neutral-dark text-sm">
              {lang === 'it' ? 'Calendario Completo degli Eventi' : 'All Scheduled Events'}
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-neutral-light">
              {processedEvents.map(ev => {
                const isUrgent = ev.diffDays <= alertDays;
                return (
                  <div key={ev.id} className="p-3 hover:bg-neutral-light/5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getEventBadge(ev.label, ev.isCustom)}
                        <span className={`text-xs ${isUrgent ? 'font-bold text-neutral-dark' : 'text-neutral-medium font-semibold'}`}>
                          {formatEventLabel(ev.label)}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-medium font-semibold">
                        {ev.day.toString().padStart(2, '0')}/{ev.month.toString().padStart(2, '0')}/{ev.targetYear} {ev.isAnnual ? `(${lang === 'it' ? 'Annuale' : 'Annual'})` : ''}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        isUrgent 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-neutral-light text-neutral-dark border border-neutral-medium/25'
                      }`}>
                        {ev.diffDays} {lang === 'it' ? 'gg' : 'days'}
                      </span>
                      {ev.isCustom && (
                        <button
                          onClick={() => handleDeleteCustomEvent(ev.id)}
                          className="p-1 rounded text-neutral-medium hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePlanner;
