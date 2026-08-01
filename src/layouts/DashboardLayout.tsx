import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useServices } from '../servicesContext';

const DashboardLayout: React.FC = () => {
  const { game, createNewGame } = useGame();
  const { townService } = useServices();
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const sidebarItems = [
    { path: '/dashboard/input', en: 'Input Sheet', it: 'Foglio di Input' },
    { path: '/dashboard/population', en: 'Population', it: 'Popolazione' },
    { path: '/dashboard/businesses', en: 'Businesses', it: 'Attività e Imprese' },
    { path: '/dashboard/housing', en: 'Housing', it: 'Abitazioni' },
    { path: '/dashboard/consumption', en: 'Consumption', it: 'Consumi e Bilanci' },
    { path: '/dashboard/office-manager', en: 'Office Trade Manager', it: 'Gestione Amministratore' },
    { path: '/dashboard/convoy-manager', en: 'Convoy Manager', it: 'Gestione Convogli' },
    { path: '/dashboard/all-in-one', en: 'All-in-One Dashboard', it: 'Pannello Tutto-in-Uno' },
    { path: '/dashboard/building-materials', en: 'Building Materials', it: 'Materiali da Costruzione' },
    { path: '/dashboard/schedule', en: 'Schedule', it: 'Scadenze ed Eventi' },
    { path: '/dashboard/snapshots', en: 'Snapshots', it: 'Storico e Salvataggi' }
  ];

  const handleNewGame = async () => {
    if (game) {
      setShowConfirmReset(true);
    } else {
      const towns = await townService.getTowns();
      await createNewGame(towns);
      navigate('/dashboard/input');
    }
  };

  const confirmReset = async () => {
    const towns = await townService.getTowns();
    await createNewGame(towns);
    setShowConfirmReset(false);
    navigate('/dashboard/input');
  };

  return (
    <div className="flex min-h-screen bg-background pt-16">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-neutral-light flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-light font-bold text-neutral-dark">
          Dashboard Sheets / Fogli
        </div>
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col p-2.5 rounded transition-colors ${
                  active 
                    ? 'bg-primary text-white font-medium shadow-sm' 
                    : 'text-neutral-dark hover:bg-neutral-light'
                }`}
              >
                <span className="text-sm font-semibold">{item.en}</span>
                <span className="text-xs opacity-80">{item.it}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <div className="flex-grow flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-neutral-light py-3 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-neutral-dark text-lg">PII Calculator Dashboard</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
              game ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {game ? 'Active / Attiva' : 'No Active Game / Nessuna Partita'}
            </span>
          </div>
          <button
            onClick={handleNewGame}
            className="bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary-dark shadow-sm transition-colors"
          >
            New Game / Nuova Partita
          </button>
        </header>

        {/* Page Body */}
        <main className="flex-grow p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full border border-neutral-light shadow-lg">
            <h3 className="text-lg font-bold text-neutral-dark mb-2">Overwrite Game? / Sovrascrivere Partita?</h3>
            <p className="text-neutral-medium text-sm mb-6">
              Creando un nuovo gioco eliminerai tutti i dati inseriti per la campagna attuale. Questa operazione non può essere annullata.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 border border-neutral-medium rounded text-sm font-medium text-neutral-dark hover:bg-neutral-light"
              >
                Annulla
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 bg-red-600 rounded text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Sovrascrivi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
