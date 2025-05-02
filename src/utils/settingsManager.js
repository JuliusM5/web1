/**
 * Streamlined Settings Manager - A singleton to manage theme settings
 * With improved error handling and safety checks
 */

// Single source of truth for current settings state
const currentState = {
    appearance: null,
    accessibility: null,
    language: null
  };
  
  // Single active operation flag
  let operationInProgress = false;
  let pendingOperation = null;
  
  /**
   * Enhanced deep equality check for objects and arrays
   */
  const isEqual = (a, b) => {
    // Handle identical references and primitive cases
    if (a === b) return true;
    
    // Handle nulls and undefined
    if (a == null || b == null) return a === b;
    
    // Handle different types
    if (typeof a !== typeof b) return false;
    
    // Handle primitive types
    if (typeof a !== 'object') return a === b;
    
    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, i) => isEqual(val, b[i]));
    }
    
    // If one is array and other is not
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    // Handle regular objects
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => 
      keysB.includes(key) && isEqual(a[key], b[key])
    );
  };
  
  /**
   * Safely get a property or return a default value
   */
  const safeGet = (obj, path, defaultValue = null) => {
    if (obj == null) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || result[key] === undefined) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result ?? defaultValue;
  };
  
  /**
   * Apply settings using a single operation approach with enhanced safety
   */
  const applySettings = (settings) => {
    // Guard against invalid settings
    if (!settings || typeof settings !== 'object') {
      console.error('Invalid settings object provided');
      return false;
    }
    
    try {
      // Check if settings have actually changed
      const hasAppearanceChanged = 
        settings.appearance && !isEqual(currentState.appearance, settings.appearance);
      
      const hasAccessibilityChanged = 
        settings.accessibility && !isEqual(currentState.accessibility, settings.accessibility);
      
      const language = safeGet(settings, 'preferences.language');
      const hasLanguageChanged = 
        language && currentState.language !== language;
      
      // Skip if nothing has changed
      if (!hasAppearanceChanged && !hasAccessibilityChanged && !hasLanguageChanged) {
        return true;
      }
      
      // If operation in progress, queue this one and exit
      if (operationInProgress) {
        pendingOperation = { ...settings };
        return true;
      }
      
      // Lock operations
      operationInProgress = true;
      
      // Apply appearance settings if changed
      if (hasAppearanceChanged) {
        const fontSize = safeGet(settings, 'appearance.fontSize', 'medium');
        const colorScheme = safeGet(settings, 'appearance.colorScheme', 'blue');
        const darkMode = safeGet(settings, 'appearance.darkMode', false);
        
        try {
          // Apply font size
          document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
          if (fontSize === 'small') {
            document.documentElement.classList.add('text-sm');
          } else if (fontSize === 'medium') {
            document.documentElement.classList.add('text-base');
          } else if (fontSize === 'large') {
            document.documentElement.classList.add('text-lg');
          }
          
          // Apply color scheme
          const colorSchemeClasses = [
            'theme-blue', 'theme-purple', 'theme-green', 
            'theme-red', 'theme-amber', 'theme-indigo'
          ];
          document.documentElement.classList.remove(...colorSchemeClasses);
          document.documentElement.classList.add(`theme-${colorScheme}`);
          
          // Apply dark mode
          if (darkMode) {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
          } else {
            document.documentElement.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
          }
          
          // Set theme property
          document.documentElement.style.setProperty('--current-theme', colorScheme);
          document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
          
          // Update current state (deep copy to prevent reference issues)
          currentState.appearance = JSON.parse(JSON.stringify(settings.appearance));
        } catch (appearanceError) {
          console.error('Error applying appearance settings:', appearanceError);
          // Continue with other settings despite appearance error
        }
      }
      
      // Apply accessibility settings if changed
      if (hasAccessibilityChanged) {
        try {
          const highContrast = safeGet(settings, 'accessibility.highContrast', false);
          const reducedMotion = safeGet(settings, 'accessibility.reducedMotion', false);
          const largerClickTargets = safeGet(settings, 'accessibility.largerClickTargets', false);
          const textScaling = safeGet(settings, 'accessibility.textScaling', 100);
          const screenReaderOptimized = safeGet(settings, 'accessibility.screenReaderOptimized', false);
          
          // Apply high contrast
          if (highContrast) {
            document.documentElement.classList.add('high-contrast');
          } else {
            document.documentElement.classList.remove('high-contrast');
          }
          
          // Apply reduced motion
          if (reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
          } else {
            document.documentElement.classList.remove('reduced-motion');
          }
          
          // Apply larger click targets
          if (largerClickTargets) {
            document.documentElement.classList.add('larger-targets');
          } else {
            document.documentElement.classList.remove('larger-targets');
          }
          
          // Apply text scaling
          if (textScaling && textScaling !== 100) {
            document.documentElement.style.setProperty('--text-scale-ratio', `${textScaling / 100}`);
            document.documentElement.classList.add('custom-text-scaling');
          } else {
            document.documentElement.classList.remove('custom-text-scaling');
            document.documentElement.style.removeProperty('--text-scale-ratio');
          }
          
          // Apply screen reader optimizations
          if (screenReaderOptimized) {
            document.documentElement.setAttribute('data-screen-reader-optimized', 'true');
          } else {
            document.documentElement.removeAttribute('data-screen-reader-optimized');
          }
          
          // Update current state (deep copy to prevent reference issues)
          currentState.accessibility = JSON.parse(JSON.stringify(settings.accessibility));
        } catch (accessibilityError) {
          console.error('Error applying accessibility settings:', accessibilityError);
          // Continue with other settings despite accessibility error
        }
      }
      
      // Apply language settings if changed
      if (hasLanguageChanged) {
        try {
          const languageCode = language.split('-')[0];
          document.documentElement.setAttribute('lang', languageCode);
          currentState.language = language;
        } catch (languageError) {
          console.error('Error applying language settings:', languageError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error applying settings:', error);
      return false;
    } finally {
      // Always release lock regardless of errors
      operationInProgress = false;
      
      // Process any pending operation
      if (pendingOperation) {
        const nextOperation = pendingOperation;
        pendingOperation = null;
        setTimeout(() => applySettings(nextOperation), 0);
      }
    }
  };
  
  /**
   * Initialize settings manager
   */
  const initialize = () => {
    try {
      // Load the CSS file for dark mode and accessibility if not already loaded
      if (!document.getElementById('accessibility-darkmode-css')) {
        const link = document.createElement('link');
        link.id = 'accessibility-darkmode-css';
        link.rel = 'stylesheet';
        link.href = '/accessibility-darkmode.css';
        document.head.appendChild(link);
      }
    } catch (error) {
      console.error('Error initializing settings manager:', error);
    }
  };
  
  // Initialize on import
  initialize();
  
  // Export the manager
  const settingsManager = {
    applySettings,
    initialize
  };
  
  export default settingsManager;