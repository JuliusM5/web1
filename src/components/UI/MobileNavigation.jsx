// src/components/UI/MobileNavigation.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../utils/i18n';
import { useAuth } from '../../hooks/useAuth';

function MobileNavigation({ view, setView, onNewTrip, onOpenSettings }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLabel, setShowLabel] = useState(true);
  
  // Hide labels when scrolling down
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 10) {
        setShowLabel(false);
      } else if (currentScrollY < lastScrollY - 10) {
        setShowLabel(true);
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Navigate to specific view
  const handleNavigate = (newView, path) => {
    if (setView) {
      setView(newView);
    }
    navigate(path);
  };
  
  // Handle account/login
  const handleAccountOrLogin = () => {
    if (isAuthenticated) {
      navigate('/settings');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        <button
          onClick={() => handleNavigate('dashboard', '/')}
          className={`flex flex-col items-center justify-center ${
            view === 'dashboard' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          {showLabel && <span className="text-xs mt-1">{t('nav.home', 'Home')}</span>}
        </button>
        
        <button
          onClick={() => handleNavigate('trips', '/trips')}
          className={`flex flex-col items-center justify-center ${
            view === 'trips' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          {showLabel && <span className="text-xs mt-1">{t('nav.trips', 'Trips')}</span>}
        </button>
        
        <button
          onClick={() => {
            if (onNewTrip) {
              onNewTrip();
            } else {
              handleNavigate('planner', '/planner');
            }
          }}
          className="relative flex flex-col items-center justify-center"
        >
          <div className="absolute -top-5 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          {showLabel && <span className="text-xs mt-8 text-gray-600">{t('nav.newTrip', 'New Trip')}</span>}
        </button>
        
        <button
          onClick={() => handleNavigate('flights', '/flights')}
          className={`flex flex-col items-center justify-center ${
            view === 'flights' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          {showLabel && <span className="text-xs mt-1">{t('nav.flights', 'Flights')}</span>}
        </button>
        
        <button
          onClick={handleAccountOrLogin}
          className="flex flex-col items-center justify-center text-gray-600"
        >
          {isAuthenticated ? (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              {showLabel && <span className="text-xs mt-1">{t('nav.account', 'Account')}</span>}
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              {showLabel && <span className="text-xs mt-1">{t('nav.login', 'Login')}</span>}
            </>
          )}
        </button>
      </div>
    </nav>
  );
}

export default MobileNavigation;