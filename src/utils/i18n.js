/**
 * Internationalization utilities for TravelEase
 * Provides translations and locale-specific formatting
 */

// Available languages
export const AVAILABLE_LANGUAGES = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'zh-CN', name: '中文(简体)' },
  ];
  
  // Translation strings
  const translations = {
    'en-US': {
      // Common
      'app.name': 'TravelEase',
      'app.tagline': 'Plan your trips with ease',
      
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.planTrip': 'Plan Trip',
      'nav.myTrips': 'My Trips',
      'nav.templates': 'Templates',
      'nav.settings': 'Settings',
      
      // Dashboard
      'dashboard.upcomingTrips': 'Upcoming Trips',
      'dashboard.recentTrips': 'Recent Trips',
      'dashboard.stats': 'Travel Statistics',
      'dashboard.totalTrips': 'Total Trips',
      'dashboard.upcomingCount': 'Upcoming',
      'dashboard.daysTraveled': 'Days Traveled',
      'dashboard.budgetTotal': 'Budget Total',
      'dashboard.noTrips': 'No trips planned yet.',
      'dashboard.createTrip': 'Plan a Trip Now',
      
      // Trip Planning
      'trip.destination': 'Destination',
      'trip.startDate': 'Start Date',
      'trip.endDate': 'End Date',
      'trip.budget': 'Budget',
      'trip.duration': 'Duration',
      'trip.days': 'days',
      'trip.save': 'Save Trip',
      'trip.update': 'Update Trip',
      'trip.cancel': 'Cancel',
      
      // Budget
      'budget.planner': 'Budget Planner',
      'budget.accommodation': 'Accommodation',
      'budget.food': 'Food',
      'budget.transportation': 'Transportation',
      'budget.activities': 'Activities',
      'budget.other': 'Other',
      'budget.total': 'Total',
      'budget.daily': 'Daily Budget',
      'budget.perDay': 'per day',
      'budget.tips': 'Budget Tips',
      
      // Weather
      'weather.forecast': 'Weather Forecast',
      'weather.current': 'Current Weather',
      'weather.loading': 'Loading weather forecast...',
      'weather.error': 'Failed to load weather',
      'weather.noDestination': 'Enter a destination to see weather forecast.',
      'weather.fiveDay': '5-Day Forecast',
      'weather.wind': 'Wind',
      'weather.humidity': 'Humidity',
      'weather.feelsLike': 'Feels Like',
      'weather.dataFrom': 'Data from Open-Meteo API',
      'weather.lastUpdated': 'Last updated',
      
      // Tasks
      'tasks.title': 'Tasks',
      'tasks.add': 'Add Task',
      'tasks.description': 'Task Description',
      'tasks.dueDate': 'Due Date',
      'tasks.time': 'Time',
      'tasks.category': 'Category',
      'tasks.priority': 'Priority',
      'tasks.completed': 'Completed',
      'tasks.pending': 'Pending',
      'tasks.high': 'High',
      'tasks.medium': 'Medium',
      'tasks.low': 'Low',
      'tasks.edit': 'Edit Task',
      'tasks.delete': 'Delete Task',
      'tasks.save': 'Save Task',
      'tasks.markComplete': 'Mark as completed',
      'tasks.completeDepsFirst': 'Complete dependencies first',
      'tasks.noDeps': 'No dependencies',
      
      // Notes
      'notes.title': 'Notes',
      'notes.add': 'Add Note',
      'notes.category': 'Category',
      'notes.text': 'Text',
      'notes.restaurant': 'Restaurant',
      'notes.attraction': 'Attraction',
      'notes.hotel': 'Hotel',
      'notes.activity': 'Activity',
      'notes.shopping': 'Shopping',
      'notes.contact': 'Local Contact',
      'notes.general': 'General Note',
      
      // Transportation
      'transport.title': 'Transportation',
      'transport.add': 'Add Transportation',
      'transport.type': 'Type',
      'transport.from': 'From',
      'transport.to': 'To',
      'transport.price': 'Price',
      'transport.flight': 'Flight',
      'transport.train': 'Train',
      'transport.bus': 'Bus',
      'transport.ferry': 'Ferry',
      'transport.rental': 'Rental Car',
      'transport.taxi': 'Taxi/Rideshare',
      
      // Photos
      'photos.title': 'Photos',
      'photos.add': 'Add Photos',
      'photos.upload': 'Upload from Device',
      'photos.url': 'Add from URL',
      'photos.caption': 'Caption',
      'photos.select': 'Select an image file',
      
      // Settings
      'settings.title': 'Settings',
      'settings.appearance': 'Appearance',
      'settings.preferences': 'Preferences',
      'settings.notifications': 'Notifications',
      'settings.privacy': 'Privacy',
      'settings.theme': 'Theme',
      'settings.light': 'Light',
      'settings.dark': 'Dark',
      'settings.system': 'System',
      'settings.fontSize': 'Font Size',
      'settings.small': 'Small',
      'settings.medium': 'Medium',
      'settings.large': 'Large',
      'settings.colorScheme': 'Color Scheme',
      'settings.currency': 'Default Currency',
      'settings.dateFormat': 'Date Format',
      'settings.distanceUnit': 'Distance Unit',
      'settings.miles': 'Miles',
      'settings.kilometers': 'Kilometers',
      'settings.tempUnit': 'Temperature Unit',
      'settings.fahrenheit': 'Fahrenheit (°F)',
      'settings.celsius': 'Celsius (°C)',
      'settings.language': 'Language',
      'settings.save': 'Save Settings',
      'settings.reset': 'Reset to Defaults',
      
      // Export & Share
      'export.toPDF': 'Export as PDF',
      'export.generating': 'Generating PDF...',
      'export.success': 'PDF generated successfully',
      'export.error': 'Failed to generate PDF',
      'share.email': 'Email Itinerary',
      'share.emailAddress': 'Enter email address',
      'share.send': 'Send',
      'share.success': 'Trip details sent to',
      'share.error': 'Failed to send email',
      
      // Templates
      'template.title': 'Trip Templates',
      'template.use': 'Use Template',
      'template.save': 'Save as Template',
      'template.name': 'Template Name',
      'template.description': 'Template Description',
      'template.select': 'Select Trip to Save as Template',
      'template.preview': 'Template Preview',
      'template.duration': 'Duration',
      'template.budget': 'Budget',
      'template.tasks': 'Tasks',
      'template.notes': 'Notes',
      
      // Offline
      'offline.status': 'You are offline',
      'offline.connected': 'Connected',
      'offline.changes': 'Changes will be saved locally and synchronized when you reconnect.',
      'offline.lastSync': 'Last synced',
      'offline.pendingChanges': 'change(s) pending synchronization',
      'offline.syncNow': 'Sync Now',
      
      // Updates
      'update.available': 'Update Available',
      'update.message': 'A new version of TravelEase is available. Refresh to update.',
      'update.now': 'Update Now',
    },
    
    'es-ES': {
      // Common
      'app.name': 'TravelEase',
      'app.tagline': 'Planifica tus viajes con facilidad',
      
      // Navigation
      'nav.dashboard': 'Panel',
      'nav.planTrip': 'Planificar Viaje',
      'nav.myTrips': 'Mis Viajes',
      'nav.templates': 'Plantillas',
      'nav.settings': 'Configuración',
      
      // Dashboard
      'dashboard.upcomingTrips': 'Próximos Viajes',
      'dashboard.recentTrips': 'Viajes Recientes',
      'dashboard.stats': 'Estadísticas de Viaje',
      'dashboard.totalTrips': 'Total de Viajes',
      'dashboard.upcomingCount': 'Próximos',
      'dashboard.daysTraveled': 'Días Viajados',
      'dashboard.budgetTotal': 'Presupuesto Total',
      'dashboard.noTrips': 'Aún no hay viajes planificados.',
      'dashboard.createTrip': 'Planificar un Viaje Ahora',
      
      // More Spanish translations would go here...
    },
    
    'fr-FR': {
      // French translations would go here...
      'app.name': 'TravelEase',
      'app.tagline': 'Planifiez vos voyages facilement',
      
      'nav.dashboard': 'Tableau de bord',
      'nav.planTrip': 'Planifier un Voyage',
      'nav.myTrips': 'Mes Voyages',
      'nav.templates': 'Modèles',
      'nav.settings': 'Paramètres',
      
      // More French translations would go here...
    },
    
    // Additional language translations would be added here
  };
  
  // Current language
  let currentLanguage = 'en-US';
  
  /**
   * Initialize the language based on user settings or browser preference
   * 
   * @param {Object} userSettings User settings
   */
  export const initializeLanguage = (userSettings) => {
    if (userSettings?.preferences?.language) {
      // Use language from user settings
      setLanguage(userSettings.preferences.language);
    } else {
      // Use browser language if available and supported
      const browserLang = navigator.language;
      const isSupported = AVAILABLE_LANGUAGES.some(lang => lang.code === browserLang);
      
      if (isSupported) {
        setLanguage(browserLang);
      } else {
        // Default to English (US)
        setLanguage('en-US');
      }
    }
  };
  
  /**
   * Set the current language
   * 
   * @param {string} languageCode Language code to set
   * @returns {boolean} Whether the language was set successfully
   */
  export const setLanguage = (languageCode) => {
    if (translations[languageCode]) {
      currentLanguage = languageCode;
      
      // Update HTML lang attribute
      document.documentElement.lang = languageCode;
      
      // Store in localStorage
      localStorage.setItem('language', languageCode);
      
      // Dispatch event for components to update
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: languageCode }
      }));
      
      return true;
    }
    return false;
  };
  
  /**
   * Get a translated string
   * 
   * @param {string} key Translation key
   * @param {Object} params Parameters to replace in the string
   * @returns {string} Translated string
   */
  export const translate = (key, params = {}) => {
    // Get the translation for the current language
    const translation = translations[currentLanguage]?.[key] || translations['en-US']?.[key] || key;
    
    // Replace parameters
    return translation.replace(/{(\w+)}/g, (match, paramName) => {
      return params[paramName] !== undefined ? params[paramName] : match;
    });
  };
  
  /**
   * Format a date according to the current locale
   * 
   * @param {string|Date} date Date to format
   * @param {Object} options Formatting options
   * @returns {string} Formatted date
   */
  export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Default options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    // Merge options
    const finalOptions = { ...defaultOptions, ...options };
    
    // Format the date
    return dateObj.toLocaleString(currentLanguage, finalOptions);
  };
  
  /**
   * Format a number as currency
   * 
   * @param {number} amount Amount to format
   * @param {Object} userSettings User settings
   * @returns {string} Formatted currency
   */
  export const formatCurrency = (amount, userSettings = {}) => {
    // Get currency from user settings or default to USD
    const currency = userSettings?.preferences?.defaultCurrency || 'USD';
    
    // Format the currency
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  /**
   * Format a number
   * 
   * @param {number} number Number to format
   * @param {Object} options Formatting options
   * @returns {string} Formatted number
   */
  export const formatNumber = (number, options = {}) => {
    return new Intl.NumberFormat(currentLanguage, options).format(number);
  };
  
  /**
   * Get current language code
   * 
   * @returns {string} Current language code
   */
  export const getCurrentLanguage = () => {
    return currentLanguage;
  };
  
  /**
   * Check if the current language is RTL (right-to-left)
   * 
   * @returns {boolean} Whether the current language is RTL
   */
  export const isRTL = () => {
    // List of RTL languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    
    // Check if current language is RTL
    return rtlLanguages.some(lang => currentLanguage.startsWith(lang));
  };