import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserSettings, saveUserSettings, applyThemeSettings, DEFAULT_SETTINGS } from '../utils/settingsUtils';

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
      setSettings(userSettings);
      applyThemeSettings(userSettings);
      setLoading(false);
    };

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = (newSettings) => {
    // Apply the new settings immediately
    setSettings(newSettings);
    
    // Save to localStorage
    saveUserSettings(newSettings);
    
    // Apply theme changes
    applyThemeSettings(newSettings);
    
    return true;
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveUserSettings(DEFAULT_SETTINGS);
    applyThemeSettings(DEFAULT_SETTINGS);
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