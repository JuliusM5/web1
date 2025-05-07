// Updated Header.jsx with login/logout button optimized for mobile
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../../utils/i18n';
import { useAuth } from '../../hooks/useAuth'; // Add this import

function Header() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth(); // Add this line to get auth state
  
  // Navigation handlers
  const handleNewTrip = () => {
    navigate('/planner');
  };
  
  const handleOpenSettings = () => {
    navigate('/settings');
  };
  
  const handleOpenTemplates = () => {
    navigate('/templates');
  };

  // Login/logout handlers
  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Helper to determine active view based on path
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" fill="white" stroke="white" strokeWidth="1" />
            <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" fill="#3B82F6" stroke="#3B82F6" strokeWidth="1" />
            <path d="M12 22V11" stroke="#3B82F6" strokeWidth="2" />
            <path d="M17 8.5L12 11L7 8.5" stroke="#3B82F6" strokeWidth="1" />
          </svg>
          <h1 className="text-2xl font-bold">{t('app.name')}</h1>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <button 
                className={isActive('/') ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
                onClick={() => navigate('/')}
              >
                {t('nav.dashboard')}
              </button>
            </li>
            <li>
              <button 
                className={isActive('/planner') ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
                onClick={handleNewTrip}
              >
                {t('nav.planner')}
              </button>
            </li>
            <li>
              <button 
                className={isActive('/trips') ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
                onClick={() => navigate('/trips')}
              >
                {t('nav.trips')}
              </button>
            </li>
            <li>
              <button 
                className={isActive('/flights') ? 'font-bold border-b-2 border-white' : 'hover:text-blue-100'}
                onClick={() => navigate('/flights')}
              >
                {t('nav.flights')}
              </button>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-2">
          {/* Login/Logout button - responsive design */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center text-white px-3 py-1.5 border border-white rounded-md hover:bg-blue-700 transition-colors"
              aria-label={t('nav.logout')}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span className="hidden md:inline">{t('nav.logout') || 'Logout'}</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center text-white"
              aria-label={t('nav.login')}
            >
              {/* Mobile version - just icon */}
              <div className="md:hidden p-2 rounded-full hover:bg-blue-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
              </div>
              {/* Desktop version - icon with text */}
              <div className="hidden md:flex items-center px-3 py-1.5 border border-white rounded-md hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                {t('nav.login') || 'Login'}
              </div>
            </button>
          )}

          <button
            onClick={handleOpenSettings}
            className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            aria-label={t('nav.settings')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          <button
            onClick={handleOpenTemplates}
            className="p-2 rounded-full hover:bg-blue-700 transition-colors"
            aria-label={t('nav.templates')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
            </svg>
          </button>
          <button
            onClick={handleNewTrip}
            className="md:flex hidden items-center bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {t('nav.planner')}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;