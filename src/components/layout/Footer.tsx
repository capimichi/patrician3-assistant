import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-primary/20 py-4 text-center mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-gray-700 text-sm">
        <p className="font-serif tracking-wider text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
          🏰 Lega Anseatica — Patrician III Assistant © 2026
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Progettato per la pianificazione e l'ottimizzazione commerciale dell'impero dei mari.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
