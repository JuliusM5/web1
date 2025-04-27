import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { applyThemeSettings, applyAccessibilitySettings } from '../../utils/settingsUtils';

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
    if (!settings) return;
    
    // Apply theme settings
    applyThemeSettings(settings);
    
    // Apply accessibility settings
    applyAccessibilitySettings(settings);
    
    // Add language attribute to the HTML tag
    if (settings.preferences && settings.preferences.language) {
      document.documentElement.setAttribute('lang', settings.preferences.language.split('-')[0]);
    }
    
    // Apply dark mode if enabled
    if (settings.appearance && settings.appearance.darkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
    
    // Load the CSS file for dark mode and accessibility
    if (!document.getElementById('accessibility-darkmode-css')) {
      const link = document.createElement('link');
      link.id = 'accessibility-darkmode-css';
      link.rel = 'stylesheet';
      link.href = '/accessibility-darkmode.css';
      document.head.appendChild(link);
    }
    
    // Apply reduced motion based on user preference
    if (settings.accessibility && settings.accessibility.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Apply high contrast mode
    if (settings.accessibility && settings.accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply larger click targets
    if (settings.accessibility && settings.accessibility.largerClickTargets) {
      document.documentElement.classList.add('larger-targets');
    } else {
      document.documentElement.classList.remove('larger-targets');
    }
    
    // Apply custom text scaling
    if (settings.accessibility && settings.accessibility.textScaling && settings.accessibility.textScaling !== 100) {
      document.documentElement.style.setProperty('--text-scale-ratio', `${settings.accessibility.textScaling / 100}`);
      document.documentElement.classList.add('custom-text-scaling');
    } else {
      document.documentElement.classList.remove('custom-text-scaling');
      document.documentElement.style.removeProperty('--text-scale-ratio');
    }
    
    // Screen reader optimizations
    if (settings.accessibility && settings.accessibility.screenReaderOptimized) {
      document.documentElement.setAttribute('data-screen-reader-optimized', 'true');
    } else {
      document.documentElement.removeAttribute('data-screen-reader-optimized');
    }
    
  }, [settings]);
  
  return (
    <div className="app-container">
      {children}
    </div>
  );
}

export default AppSettingsWrapper;