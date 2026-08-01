import React from 'react';
import { useNavigate } from 'react-router-dom';

const UninitializedWarning: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-neutral-light shadow-sm max-w-lg mx-auto mt-12">
      <span className="text-5xl mb-4" role="img" aria-label="warning">⚠️</span>
      <h2 className="text-2xl font-bold text-neutral-dark mb-2">Game Not Initialized / Gioco non inizializzato</h2>
      <p className="text-neutral-medium mb-6">
        Non hai ancora creato o caricato una partita attiva. Inizializzala ora nel foglio di input per attivare i calcoli.
      </p>
      <button
        onClick={() => navigate('/dashboard/input')}
        className="bg-primary text-white font-medium py-2 px-6 rounded hover:bg-primary-dark transition-colors shadow-sm animate-pulse"
      >
        Initialize Game / Inizializza Gioco
      </button>
    </div>
  );
};

export default UninitializedWarning;
