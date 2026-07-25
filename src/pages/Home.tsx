import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Factory, Landmark, Anchor, Compass } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 py-4 text-neutral-dark">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wider text-primary uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
          {t('home.welcome')}
        </h1>
        <p className="text-xl text-gray-700 font-medium tracking-wide">
          {t('home.subtitle')}
        </p>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        <p className="max-w-2xl mx-auto text-gray-700 leading-relaxed pt-2">
          {t('home.desc')}
        </p>
      </div>

      {/* Grid delle funzionalità principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {/* Calcolatore Produzione */}
        <div className="bg-white border border-primary/20 rounded-lg p-6 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('header.production')}
              </h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {t('home.production_card')}
            </p>
          </div>
          <Link
            to="/calculators/production"
            className="w-full text-center bg-secondary hover:bg-secondary/90 text-neutral-dark font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Apri Strumento
          </Link>
        </div>

        {/* Ottimizzatore Rotte */}
        <div className="bg-white border border-primary/20 rounded-lg p-6 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('header.routes')}
              </h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {t('home.routes_card')}
            </p>
          </div>
          <Link
            to="/calculators/routes"
            className="w-full text-center bg-secondary hover:bg-secondary/90 text-neutral-dark font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Apri Strumento
          </Link>
        </div>

        {/* Gestore Convogli */}
        <div className="bg-white border border-primary/20 rounded-lg p-6 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Anchor className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                {t('header.convoy')}
              </h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {t('home.convoy_card')}
            </p>
          </div>
          <Link
            to="/calculators/convoy"
            className="w-full text-center bg-secondary hover:bg-secondary/90 text-neutral-dark font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Apri Strumento
          </Link>
        </div>
      </div>

      {/* Sezione Statistiche Rapide della Lega Anseatica */}
      <div className="bg-white border border-primary/10 rounded-lg p-8 mt-12 text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-4">
          <Landmark className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-primary mb-2 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
          Lega Anseatica (Hanseatic League)
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed max-w-2xl mx-auto">
          La Lega Anseatica fu un'alleanza commerciale di corporazioni e di città della Germania settentrionale e dell'Europa baltica che monopolizzò i commerci nel Nord Europa dal tardo Medioevo fino agli albori dell'era moderna. In Patrician III, il tuo obiettivo è scalare la piramide sociale da semplice Commerciante a Sindaco ed infine a Governatore della Lega.
        </p>
      </div>
    </div>
  );
};

export default Home;
