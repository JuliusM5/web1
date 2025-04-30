// src/utils/i18n.js
import { useState, useEffect, createContext, useContext } from 'react';
import translations from './translations';

// Create a context for internationalization
const I18nContext = createContext();

// Default language
const DEFAULT_LANGUAGE = 'en-US';

// Available languages
export const AVAILABLE_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

// Provider component for internationalization
export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  
  // Function to set the language
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      // Update HTML lang attribute
      document.documentElement.setAttribute('lang', lang.split('-')[0]);
      // Store in local storage for persistence
      localStorage.setItem('userLanguage', lang);
    }
  };
  
  // Get translation for a key
  const t = (key, replacements = {}) => {
    // Get the translation from the current language
    let translation = translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
    
    // Replace placeholders with actual values
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(`{${placeholder}}`, value);
    });
    
    return translation;
  };
  
  // Initialize language from localStorage or settings
  useEffect(() => {
    const storedLanguage = localStorage.getItem('userLanguage');
    if (storedLanguage && translations[storedLanguage]) {
      setLanguage(storedLanguage);
      document.documentElement.setAttribute('lang', storedLanguage.split('-')[0]);
    } else {
      // Try to get language from user settings
      try {
        const userSettings = JSON.parse(localStorage.getItem('userSettings'));
        const settingsLanguage = userSettings?.preferences?.language;
        
        if (settingsLanguage && translations[settingsLanguage]) {
          setLanguage(settingsLanguage);
          document.documentElement.setAttribute('lang', settingsLanguage.split('-')[0]);
        }
      } catch (error) {
        console.error('Error loading language from settings:', error);
      }
    }
  }, []);
  
  // Listen for settings changes to sync language
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userSettings') {
        try {
          const userSettings = JSON.parse(e.newValue);
          const settingsLanguage = userSettings?.preferences?.language;
          
          if (settingsLanguage && translations[settingsLanguage] && settingsLanguage !== language) {
            setLanguage(settingsLanguage);
            document.documentElement.setAttribute('lang', settingsLanguage.split('-')[0]);
          }
        } catch (error) {
          console.error('Error syncing language from settings:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);
  
  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use the internationalization context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Connect the settings language preference with the i18n system
export const syncLanguageWithSettings = (userSettings) => {
  if (userSettings?.preferences?.language) {
    const settingsLanguage = userSettings.preferences.language;
    if (translations[settingsLanguage]) {
      localStorage.setItem('userLanguage', settingsLanguage);
      document.documentElement.setAttribute('lang', settingsLanguage.split('-')[0]);
      return true;
    }
  }
  return false;
};