import React from 'react';
import { useI18n } from '../../utils/i18n';

function CheapFlightsButton({ active, onClick }) {
  const { t } = useI18n();
  
  return (
    <button 
      className={active ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
      onClick={onClick}
    >
      {t('nav.cheapFlights')}
    </button>
  );
}

export default CheapFlightsButton;