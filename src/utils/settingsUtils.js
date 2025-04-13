// Default application settings
export const DEFAULT_SETTINGS = {
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      colorScheme: 'blue',
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
    },
    privacy: {
      shareLocationData: true,
      collectAnalytics: true,
      autoSaveEnabled: true,
    }
  };
  
  // Get current user settings (or defaults if none exist)
  export const getUserSettings = () => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
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
    const { theme, fontSize, colorScheme } = settings.appearance;
    
    // Apply theme (light/dark mode)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
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
    const colorSchemeClasses = ['theme-blue', 'theme-purple', 'theme-green', 'theme-red', 'theme-amber', 'theme-indigo'];
    document.documentElement.classList.remove(...colorSchemeClasses);
    document.documentElement.classList.add(`theme-${colorScheme}`);
    
    return true;
  };
  
  // Format date according to user preferences
  export const formatDate = (dateString, settings) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const format = settings?.preferences?.dateFormat || 'MM/DD/YYYY';
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}/${date.getFullYear()}`;
      case 'YYYY-MM-DD':
        return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
      case 'MMMM D, YYYY':
        return `${getMonthName(date.getMonth())} ${date.getDate()}, ${date.getFullYear()}`;
      case 'D MMMM YYYY':
        return `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}`;
      case 'MM/DD/YYYY':
      default:
        return `${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}/${date.getFullYear()}`;
    }
  };
  
  // Format currency according to user preferences
  export const formatCurrency = (amount, settings) => {
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
      formattedAmount = Math.round(amount).toLocaleString();
    } else {
      formattedAmount = Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    
    return `${symbol}${formattedAmount}`;
  };
  
  // Convert temperature according to user preferences
  export const formatTemperature = (celsius, settings) => {
    const unit = settings?.preferences?.temperatureUnit || 'fahrenheit';
    
    if (unit === 'celsius') {
      return `${Math.round(celsius)}°C`;
    } else {
      // Convert to Fahrenheit
      const fahrenheit = (celsius * 9/5) + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
  };
  
  // Convert distance according to user preferences
  export const formatDistance = (kilometers, settings) => {
    const unit = settings?.preferences?.distanceUnit || 'miles';
    
    if (unit === 'kilometers') {
      return `${kilometers.toFixed(1)} km`;
    } else {
      // Convert to miles
      const miles = kilometers * 0.621371;
      return `${miles.toFixed(1)} mi`;
    }
  };
  
  // Helper functions
  const padZero = (num) => {
    return num.toString().padStart(2, '0');
  };
  
  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };
  
  // Reset all app data (for privacy clear option)
  export const clearAllAppData = () => {
    if (window.confirm("Are you sure you want to clear ALL data? This will delete all your trips, templates, and settings. This action cannot be undone.")) {
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
  export const exportUserData = () => {
    try {
      const data = {
        trips: JSON.parse(localStorage.getItem('travelPlannerTrips') || '[]'),
        templates: JSON.parse(localStorage.getItem('tripTemplates') || '[]'),
        settings: JSON.parse(localStorage.getItem('userSettings') || '{}')
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `travelease_backup_${new Date().toISOString().split('T')[0]}.json`;
      
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
  export const importUserData = async (file) => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            
            // Validate the imported data has expected structure
            if (!data.trips || !data.templates || !data.settings) {
              reject(new Error("Invalid data format. The file does not contain valid TravelEase data."));
              return;
            }
            
            // Import the data
            localStorage.setItem('travelPlannerTrips', JSON.stringify(data.trips));
            localStorage.setItem('tripTemplates', JSON.stringify(data.templates));
            localStorage.setItem('userSettings', JSON.stringify(data.settings));
            
            resolve(true);
          } catch (error) {
            reject(new Error("Failed to parse the imported file: " + error.message));
          }
        };
        
        reader.onerror = () => {
          reject(new Error("Failed to read the file"));
        };
        
        reader.readAsText(file);
      });
    } catch (error) {
      console.error("Error importing user data:", error);
      return false;
    }
  };