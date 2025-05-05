import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import settingsManager from '../../utils/settingsManager';

/**
 * ErrorBoundary component to handle any errors in settings application
 */
class SettingsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Settings error caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="error-container p-4 bg-red-50 rounded-lg max-w-lg mx-auto my-8 shadow-md">
          <h2 className="text-xl font-semibold text-red-700 mb-3">Something went wrong</h2>
          <div className="mb-4 p-3 bg-white rounded border border-red-200">
            <p className="text-red-600 mb-2">{this.state.error && this.state.error.toString()}</p>
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-700 mb-1">View technical details</summary>
              <div className="p-2 bg-gray-100 rounded overflow-auto max-h-64 text-gray-800 font-mono text-xs">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </div>
            </details>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
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
  const [settingsError, setSettingsError] = useState(null);
  
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
        // Clear any previous settings error when successful
        setSettingsError(null);
      }
    } catch (error) {
      console.error("Error in settings application:", error);
      setSettingsError(error);
      // We don't need to rethrow - the ErrorBoundary will catch it
    }
  }, [settings, lastApplied]);
  
  // Render settings error if there is one
  if (settingsError) {
    return (
      <div className="settings-error p-4 bg-yellow-50 rounded-lg max-w-lg mx-auto my-8 shadow-md">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Settings Error</h2>
        <p className="text-yellow-700 mb-3">There was an error applying your settings:</p>
        <div className="bg-white p-3 rounded border border-yellow-200 mb-4">
          <p className="text-gray-800">{settingsError.toString()}</p>
        </div>
        <button
          onClick={() => setSettingsError(null)}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
        >
          Continue Anyway
        </button>
      </div>
    );
  }
  
  return (
    <SettingsErrorBoundary>
      <div className="app-container">
        {children}
      </div>
    </SettingsErrorBoundary>
  );
}

export default AppSettingsWrapper;