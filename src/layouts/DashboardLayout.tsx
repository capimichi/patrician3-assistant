import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useServices } from '../servicesContext';
import { useTranslation } from 'react-i18next';
import { Globe, ArrowLeft } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { game, createNewGame } = useGame();
  const { townService } = useServices();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const sidebarItems = [
    { path: '/dashboard/input', key: 'input_sheet' },
    { path: '/dashboard/population', key: 'population' },
    { path: '/dashboard/businesses', key: 'businesses' },
    { path: '/dashboard/housing', key: 'housing' },
    { path: '/dashboard/consumption', key: 'consumption' },
    { path: '/dashboard/office-manager', key: 'office_manager' },
    { path: '/dashboard/convoy-manager', key: 'convoy_manager' },
    { path: '/dashboard/all-in-one', key: 'all_in_one' },
    { path: '/dashboard/building-materials', key: 'building_materials' },
    { path: '/dashboard/schedule', key: 'schedule' },
    { path: '/dashboard/snapshots', key: 'snapshots' }
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

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="flex min-h-screen bg-background">
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
                className={`flex flex-col p-2.5 rounded transition-all ${
                  active 
                    ? 'bg-primary text-white font-medium shadow-sm' 
                    : 'text-neutral-dark hover:bg-neutral-light'
                }`}
              >
                <span className="text-sm font-semibold">{t(`dashboard.${item.key}`)}</span>
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
            <span className="font-bold text-neutral-dark text-lg">{t('dashboard.title')}</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
              game ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {game ? t('dashboard.active') : t('dashboard.no_active')}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* New Game */}
            <button
              onClick={handleNewGame}
              className="bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary-dark shadow-sm transition-colors cursor-pointer"
            >
              {t('dashboard.new_game')}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:text-primary transition-colors border border-primary/20 hover:border-primary/50 cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase text-xs font-bold">{i18n.language}</span>
            </button>

            {/* Back to Frontend */}
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium text-neutral-dark hover:text-primary transition-colors border border-neutral-medium hover:bg-neutral-light"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('dashboard.back_frontend')}</span>
            </Link>
          </div>
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
            <h3 className="text-lg font-bold text-neutral-dark mb-2">{t('dashboard.new_game_confirm_title')}</h3>
            <p className="text-neutral-medium text-sm mb-6">
              {t('dashboard.new_game_confirm_desc')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 border border-neutral-medium rounded text-sm font-medium text-neutral-dark hover:bg-neutral-light"
              >
                {t('dashboard.cancel')}
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 bg-red-600 rounded text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                {t('dashboard.overwrite')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
