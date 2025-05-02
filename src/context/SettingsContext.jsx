import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserSettings, saveUserSettings } from '../utils/settingsUtils';
import { syncLanguageWithSettings } from '../utils/i18n';

// Updated default settings with new options
export const DEFAULT_SETTINGS = {
  appearance: {
    fontSize: 'medium',
    colorScheme: 'blue',
    darkMode: false
  },
  preferences: {
    defaultCurrency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    distanceUnit: 'miles',
    temperatureUnit: 'fahrenheit',
    language: 'en-US',
  },
  notifications: {
    tripReminders: true,
    taskReminders: true,
    budgetAlerts: true,
    emailNotifications: false,
    emailAddress: '',
    emailFrequency: 'daily'
  },
  privacy: {
    shareLocationData: true,
    collectAnalytics: true,
    autoSaveEnabled: true,
    dataRetention: 'forever'
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largerClickTargets: false,
    screenReaderOptimized: false,
    textScaling: 100
  }
};

// Create Settings Context
const SettingsContext = createContext();

// Custom hook to use the Settings Context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Settings Provider Component
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Apply settings on initial load
  useEffect(() => {
    const loadSettings = async () => {
      const userSettings = getUserSettings();
      const mergedSettings = mergeWithDefaultSettings(userSettings);
      
      // Set state with merged settings
      setSettings(mergedSettings);
      
      // Sync language with i18n system
      syncLanguageWithSettings(mergedSettings);
      
      setLoading(false);
    };

    loadSettings();
  }, []);

  // Merge user settings with defaults to ensure all properties exist
  const mergeWithDefaultSettings = (userSettings) => {
    // Helper function to deep merge objects
    const deepMerge = (target, source) => {
      const output = { ...target };
      
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (
            typeof source[key] === 'object' && 
            source[key] !== null && 
            !Array.isArray(source[key])
          ) {
            // If both target and source have the key and both are objects, merge them
            if (
              target.hasOwnProperty(key) && 
              typeof target[key] === 'object' && 
              target[key] !== null && 
              !Array.isArray(target[key])
            ) {
              output[key] = deepMerge(target[key], source[key]);
            } else {
              // If target doesn't have the key or is not an object, use source's value
              output[key] = source[key];
            }
          } else {
            // For primitives and arrays, simply use source's value
            output[key] = source[key];
          }
        }
      }
      
      return output;
    };
    
    // Start with default settings and merge with user settings
    return deepMerge(DEFAULT_SETTINGS, userSettings);
  };

  // Update settings
  const updateSettings = (newSettings) => {
    // Update state
    setSettings(newSettings);
    
    // Save to localStorage
    saveUserSettings(newSettings);
    
    // Sync language with i18n system
    syncLanguageWithSettings(newSettings);
    
    return true;
  };

  // Reset settings to defaults
  const resetSettings = () => {
    // Update state
    setSettings(DEFAULT_SETTINGS);
    
    // Save to localStorage
    saveUserSettings(DEFAULT_SETTINGS);
    
    // Sync language with i18n system
    syncLanguageWithSettings(DEFAULT_SETTINGS);
    
    return true;
  };

  // Context value
  const value = {
    settings,
    updateSettings,
    resetSettings,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;