import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, ChevronDown, Menu, X, Globe } from 'lucide-react';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'db' | 'calc' | null>(null);

  const dbRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  // Chiude i dropdown al click fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown === 'db' &&
        dbRef.current &&
        !dbRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
      if (
        activeDropdown === 'calc' &&
        calcRef.current &&
        !calcRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Chiude i menu al cambio rotta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(nextLang);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-card border-b border-primary/20 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Titolo */}
          <Link to="/" className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-xl font-bold tracking-wider text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
              Patrician III Assistant
            </span>
          </Link>

          {/* Navigazione Desktop */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary bg-background' : 'text-gray-700 hover:text-primary'
              }`}
            >
              {t('header.home')}
            </Link>

            {/* Dropdown Database */}
            <div className="relative" ref={dbRef}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'db' ? null : 'db')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/database') ? 'text-primary' : 'text-gray-700 hover:text-primary'
                }`}
              >
                <span>{t('header.database')}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {activeDropdown === 'db' && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-2xl bg-background dropdown-solido border border-primary/40 ring-1 ring-black ring-opacity-5 z-[60]">
                  <div className="py-1">
                    <Link
                      to="/database/goods"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.goods')}
                    </Link>
                    <Link
                      to="/database/businesses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.businesses')}
                    </Link>
                    <Link
                      to="/database/towns"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.towns')}
                    </Link>
                    <Link
                      to="/database/buildings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.buildings')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Calcolatori */}
            <div className="relative" ref={calcRef}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'calc' ? null : 'calc')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/calculators') ? 'text-primary' : 'text-gray-700 hover:text-primary'
                }`}
              >
                <span>{t('header.calculators')}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {activeDropdown === 'calc' && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-2xl bg-background dropdown-solido border border-primary/40 ring-1 ring-black ring-opacity-5 z-[60]">
                  <div className="py-1">
                    <Link
                      to="/calculators/production"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.production')}
                    </Link>
                    <Link
                      to="/calculators/routes"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.routes')}
                    </Link>
                    <Link
                      to="/calculators/convoy"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-background hover:text-primary transition-colors"
                    >
                      {t('header.convoy')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Selettore Lingua */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary transition-colors border border-primary/20 hover:border-primary/50"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{i18n.language}</span>
            </button>
          </nav>

          {/* Hamburger Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-md text-gray-700 hover:text-primary border border-primary/20"
            >
              <span className="uppercase text-xs font-bold">{i18n.language}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary hover:bg-background/50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigazione Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background dropdown-solido border-t border-primary/30 px-2 pt-2 pb-3 space-y-1 shadow-lg">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-background/50"
          >
            {t('header.home')}
          </Link>
          <div className="px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            {t('header.database')}
          </div>
          <Link
            to="/database/goods"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.goods')}
          </Link>
          <Link
            to="/database/businesses"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.businesses')}
          </Link>
          <Link
            to="/database/towns"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.towns')}
          </Link>
          <Link
            to="/database/buildings"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.buildings')}
          </Link>
          <div className="px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mt-2">
            {t('header.calculators')}
          </div>
          <Link
            to="/calculators/production"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.production')}
          </Link>
          <Link
            to="/calculators/routes"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.routes')}
          </Link>
          <Link
            to="/calculators/convoy"
            className="block pl-6 pr-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-background/50"
          >
            {t('header.convoy')}
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
