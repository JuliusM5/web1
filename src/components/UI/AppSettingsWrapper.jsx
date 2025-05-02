import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import settingsManager from '../../utils/settingsManager';

/**
 * ErrorBoundary component to handle any errors in settings application
 */
class SettingsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Settings error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You could render a custom error UI here if needed
      return this.props.children;
    }
    return this.props.children;
  }
}

/**
 * A streamlined wrapper component that applies settings once on change
 * With enhanced error handling
 */
function AppSettingsWrapper({ children }) {
  const { settings } = useSettings();
  const [lastApplied, setLastApplied] = useState(null);
  
  // Apply settings when they change
  useEffect(() => {
    if (!settings) return;
    
    // Skip if settings haven't changed (prevents unnecessary operations)
    if (lastApplied && JSON.stringify(lastApplied) === JSON.stringify(settings)) {
      return;
    }
    
    try {
      // Use the simplified settings manager
      const success = settingsManager.applySettings(settings);
      
      // Only update lastApplied if the settings were successfully applied
      if (success) {
        setLastApplied(JSON.parse(JSON.stringify(settings)));
      }
    } catch (error) {
      console.error("Error in settings application:", error);
      // We don't need to rethrow - the ErrorBoundary will catch it
    }
  }, [settings, lastApplied]);
  
  return (
    <SettingsErrorBoundary>
      <div className="app-container">
        {children}
      </div>
    </SettingsErrorBoundary>
  );
}

export default AppSettingsWrapper;