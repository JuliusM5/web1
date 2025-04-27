import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { applyThemeSettings } from '../../utils/settingsUtils';

/**
 * Component that wraps the application and applies the current theme and settings
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components
 * @returns {React.ReactNode} Wrapped children
 */
function AppSettingsWrapper({ children }) {
  const { settings } = useSettings();
  
  // Apply settings whenever they change
  useEffect(() => {
    applyThemeSettings(settings);
  }, [settings]);
  
  return (
    <div className="app-container">
      {children}
    </div>
  );
}

export default AppSettingsWrapper;