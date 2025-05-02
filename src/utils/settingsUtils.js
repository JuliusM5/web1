// Import the DEFAULT_SETTINGS from SettingsContext
import { DEFAULT_SETTINGS } from '../context/SettingsContext';
import translations from './translations';

// Get current user settings (or defaults if none exist)
export const getUserSettings = () => {
  try {
    const savedSettings = localStorage.getItem('userSettings');
    if (!savedSettings) return DEFAULT_SETTINGS;
    
    const parsedSettings = JSON.parse(savedSettings);
    
    // Ensure all expected properties exist (handles partial settings from older versions)
    return {
      appearance: { ...DEFAULT_SETTINGS.appearance, ...parsedSettings.appearance },
      preferences: { ...DEFAULT_SETTINGS.preferences, ...parsedSettings.preferences },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...parsedSettings.notifications },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...parsedSettings.privacy },
      accessibility: { ...DEFAULT_SETTINGS.accessibility, ...parsedSettings.accessibility }
    };
  } catch (error) {
    console.error("Error loading user settings:", error);
    return DEFAULT_SETTINGS;
  }
};

// Save user settings
export const saveUserSettings = (settings) => {
  try {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Error saving user settings:", error);
    return false;
  }
};

// Apply theme settings to the document
export const applyThemeSettings = (settings) => {
  if (!settings || !settings.appearance) {
    console.error("Invalid settings object provided to applyThemeSettings");
    return false;
  }
  
  const { fontSize, colorScheme, darkMode } = settings.appearance;
  console.log("Applying theme settings:", { fontSize, colorScheme, darkMode });

  
  
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
  // Remove any existing color scheme classes
  const colorSchemeClasses = [
    'theme-blue', 'theme-purple', 'theme-green', 
    'theme-red', 'theme-amber', 'theme-indigo'
  ];
  document.documentElement.classList.remove(...colorSchemeClasses);
  
  // Add the new color scheme class
  const themeClass = `theme-${colorScheme}`;
  document.documentElement.classList.add(themeClass);
  
  // Apply dark mode
  if (darkMode) {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    console.log("Dark mode classes applied");
  } else {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    console.log("Dark mode classes removed");
  }
  
  // Set a custom property to track current theme
  document.documentElement.style.setProperty('--current-theme', colorScheme);
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  
  console.log(`Applied theme: ${colorScheme}, font size: ${fontSize}, dark mode: ${darkMode}`);
  
  return true;
};

// Apply accessibility settings
export const applyAccessibilitySettings = (settings) => {
  if (!settings || !settings.accessibility) return false;

  const { highContrast, reducedMotion, largerClickTargets, textScaling, screenReaderOptimized } = settings.accessibility;

  // Apply high contrast mode
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
  }

  // Apply screen reader optimizations
  if (screenReaderOptimized) {
    document.documentElement.setAttribute('data-screen-reader-optimized', 'true');
  } else {
    document.documentElement.removeAttribute('data-screen-reader-optimized');
  }

  return true;
};

/**
 * Create a translation function for the specified language
 * 
 * @param {string} language Language code (e.g., 'en-US', 'es-ES')
 * @returns {Function} Translation function
 */
export const createTranslateFunction = (language) => {
  const defaultLanguage = 'en-US';
  
  // Return a translation function that gets strings for the specified language
  return (key, replacements = {}) => {
    // Get the translation from the current language or fall back to default
    let translation = translations[language]?.[key] || translations[defaultLanguage]?.[key] || key;
    
    // Replace placeholders with actual values
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(`{${placeholder}}`, value);
    });
    
    return translation;
  };
};

// Format date according to user preferences with internationalization
export const formatDate = (dateString, settings, language = 'en-US') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const format = settings?.preferences?.dateFormat || 'MM/DD/YYYY';
  const t = createTranslateFunction(language);
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}/${date.getFullYear()}`;
    case 'YYYY-MM-DD':
      return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
    case 'MMMM D, YYYY':
      return `${getMonthName(date.getMonth(), language, t)} ${date.getDate()}, ${date.getFullYear()}`;
    case 'D MMMM YYYY':
      return `${date.getDate()} ${getMonthName(date.getMonth(), language, t)} ${date.getFullYear()}`;
    case 'MM/DD/YYYY':
    default:
      return `${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}/${date.getFullYear()}`;
  }
};

// Format currency according to user preferences
export const formatCurrency = (amount, settings, language = 'en-US') => {
  if (amount === undefined || amount === null) return '';
  
  const currencyCode = settings?.preferences?.defaultCurrency || 'USD';
  
  // Simple mapping of currency codes to symbols
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'CA$',
    'AUD': 'AU$',
    'CNY': '¥',
    'INR': '₹',
  };
  
  const symbol = currencySymbols[currencyCode] || currencyCode;
  
  // Format the amount with 2 decimal places (except for JPY)
  let formattedAmount;
  if (currencyCode === 'JPY' || currencyCode === 'CNY') {
    formattedAmount = Math.round(amount).toLocaleString(language);
  } else {
    // Use locale-sensitive number formatting
    formattedAmount = Number(amount).toLocaleString(language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  return `${symbol}${formattedAmount}`;
};

// Convert temperature according to user preferences
export const formatTemperature = (celsius, settings, language = 'en-US') => {
  const t = createTranslateFunction(language);
  const unit = settings?.preferences?.temperatureUnit || 'fahrenheit';
  
  if (unit === 'celsius') {
    return t('format.temperature.celsius', { value: Math.round(celsius) });
  } else {
    // Convert to Fahrenheit
    const fahrenheit = (celsius * 9/5) + 32;
    return t('format.temperature.fahrenheit', { value: Math.round(fahrenheit) });
  }
};

// Convert distance according to user preferences
export const formatDistance = (kilometers, settings, language = 'en-US') => {
  const t = createTranslateFunction(language);
  const unit = settings?.preferences?.distanceUnit || 'miles';
  
  if (unit === 'kilometers') {
    return t('format.distance.kilometers', { value: kilometers.toFixed(1) });
  } else {
    // Convert to miles
    const miles = kilometers * 0.621371;
    return t('format.distance.miles', { value: miles.toFixed(1) });
  }
};

// Helper functions
const padZero = (num) => {
  return num.toString().padStart(2, '0');
};

const getMonthName = (monthIndex, language = 'en-US', t = null) => {
  // If translation function is provided, use it
  if (t) {
    return t(`date.month.${monthIndex}`);
  }
  
  // Fallback to using localized month names
  try {
    const date = new Date();
    date.setMonth(monthIndex);
    return date.toLocaleString(language, { month: 'long' });
  } catch (error) {
    // Fallback to English month names if locale is not supported
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  }
};

// Reset all app data (for privacy clear option)
export const clearAllAppData = (language = 'en-US') => {
  const t = createTranslateFunction(language);
  
  if (window.confirm(t('settings.privacy.confirmClearAllData'))) {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing app data:", error);
      return false;
    }
  }
  return false;
};

// Export all user data as JSON
export const exportUserData = (language = 'en-US') => {
  try {
    const data = {
      trips: JSON.parse(localStorage.getItem('travelPlannerTrips') || '[]'),
      templates: JSON.parse(localStorage.getItem('tripTemplates') || '[]'),
      settings: JSON.parse(localStorage.getItem('userSettings') || '{}')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const t = createTranslateFunction(language);
    const currentDate = new Date().toISOString().split('T')[0];
    const exportFileName = `${t('app.name').toLowerCase()}_backup_${currentDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    return true;
  } catch (error) {
    console.error("Error exporting user data:", error);
    return false;
  }
};

// Import user data from JSON file
export const importUserData = async (file, language = 'en-US') => {
  const t = createTranslateFunction(language);
  
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate the imported data has expected structure
          if (!data.trips || !data.templates || !data.settings) {
            reject(new Error(t('settings.import.invalidDataFormat')));
            return;
          }
          
          // Import the data
          localStorage.setItem('travelPlannerTrips', JSON.stringify(data.trips));
          localStorage.setItem('tripTemplates', JSON.stringify(data.templates));
          localStorage.setItem('userSettings', JSON.stringify(data.settings));
          
          resolve(true);
        } catch (error) {
          reject(new Error(t('settings.import.parseError', { error: error.message })));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(t('settings.import.readError')));
      };
      
      reader.readAsText(file);
    });
  } catch (error) {
    console.error("Error importing user data:", error);
    return false;
  }
};