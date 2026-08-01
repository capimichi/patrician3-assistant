import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UninitializedWarning: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-neutral-light shadow-sm max-w-lg mx-auto mt-12">
      <span className="text-5xl mb-4" role="img" aria-label="warning">⚠️</span>
      <h2 className="text-2xl font-bold text-neutral-dark mb-2">{t('dashboard.warning_title')}</h2>
      <p className="text-neutral-medium mb-6">
        {t('dashboard.warning_desc')}
      </p>
      <button
        onClick={() => navigate('/dashboard/input')}
        className="bg-primary text-white font-medium py-2 px-6 rounded hover:bg-primary-dark transition-colors shadow-sm animate-pulse cursor-pointer"
      >
        {t('dashboard.warning_btn')}
      </button>
    </div>
  );
};

export default UninitializedWarning;
