import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { exportUserData, importUserData, clearAllAppData } from '../../utils/settingsUtils';
import { createSettingsPreview, hideSettingsPreview } from '../../utils/settingsPreviewUtils';
import { useI18n, AVAILABLE_LANGUAGES } from '../../utils/i18n';

function UserSettings({ onClose }) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('appearance');
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState('');
  const [settingsChanged, setSettingsChanged] = useState(false);
  const { t, changeLanguage } = useI18n();

  // Local copy of settings for making changes
  const [localSettings, setLocalSettings] = useState({...settings});
  
  // Reset local settings when component reopens
  useEffect(() => {
    setLocalSettings({...settings});
    setSettingsChanged(false);
  }, [settings]);
  
  // Initialize preview when appearance tab is active
  useEffect(() => {
    if (activeTab === 'appearance' && settingsChanged) {
      // Use a timeout to debounce preview creation
      const timeoutId = setTimeout(() => {
        const previewId = 'appearance-preview';
        createSettingsPreview(previewId, localSettings, 'appearance');
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        hideSettingsPreview('appearance-preview');
      };
    }
  }, [activeTab, localSettings, settingsChanged]);

  // Initialize currency preview when preferences tab is active
  useEffect(() => {
    if (activeTab === 'preferences' && settingsChanged) {
      const previewId = 'currency-preview';
      createSettingsPreview(previewId, localSettings, 'currency');
      
      return () => hideSettingsPreview(previewId);
    }
  }, [activeTab, localSettings, settingsChanged]);

  // Initialize date preview when preferences tab is active
  useEffect(() => {
    if (activeTab === 'preferences' && settingsChanged) {
      const previewId = 'date-preview';
      createSettingsPreview(previewId, localSettings, 'date');
      
      return () => hideSettingsPreview(previewId);
    }
  }, [activeTab, localSettings, settingsChanged]);
  
  // Handle input changes with debouncing
  const handleChange = (section, setting, value) => {
    // Use a function to ensure we're updating based on the latest state
    setLocalSettings(prevSettings => {
      const newSettings = {
        ...prevSettings,
        [section]: {
          ...prevSettings[section],
          [setting]: value
        }
      };
      return newSettings;
    });
    
    setSettingsChanged(true);
  };
  
  // Save settings and close
  const saveAndClose = () => {
    if (settingsChanged) {
      // Debounce the settings update
      setTimeout(() => {
        updateSettings(localSettings);
      }, 50);
    }
    onClose();
  };
  
  // Reset to defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      resetSettings();
      setLocalSettings({...settings});
      setSettingsChanged(false);
    }
  };
  
  // Handle file import
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      setImportError('');
    }
  };
  
  // Import data
  const handleImportData = async () => {
    if (!importFile) return;
    
    try {
      await importUserData(importFile);
      alert('Data imported successfully. The application will now reload.');
      window.location.reload();
    } catch (error) {
      setImportError(error.message);
    }
  };
  
  // Export data
  const handleExportData = () => {
    exportUserData();
  };
  
  // Clear all data
  const handleClearData = () => {
    if (clearAllAppData()) {
      alert('All data has been cleared. The application will now reload.');
      window.location.reload();
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = (enabled) => {
    handleChange('appearance', 'darkMode', enabled);
  };

  // Update for language selection
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    handleChange('preferences', 'language', newLanguage);
    
    // Directly change the language for immediate feedback
    changeLanguage(newLanguage);
  };
  
  // Available color schemes
  const colorSchemes = [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'purple', name: 'Purple', color: '#8b5cf6' },
    { id: 'green', name: 'Green', color: '#10b981' },
    { id: 'red', name: 'Red', color: '#ef4444' },
    { id: 'amber', name: 'Amber', color: '#f59e0b' },
    { id: 'indigo', name: 'Indigo', color: '#6366f1' },
  ];
  
  // Currency options
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];
  
  // Date format options
  const dateFormats = [
    { id: 'MM/DD/YYYY', display: 'MM/DD/YYYY', example: '04/13/2025' },
    { id: 'DD/MM/YYYY', display: 'DD/MM/YYYY', example: '13/04/2025' },
    { id: 'YYYY-MM-DD', display: 'YYYY-MM-DD', example: '2025-04-13' },
    { id: 'MMMM D, YYYY', display: 'Month D, YYYY', example: 'April 13, 2025' },
    { id: 'D MMMM YYYY', display: 'D Month YYYY', example: '13 April 2025' },
  ];
  
  // Accessibility options
  const accessibilityOptions = [
    { id: 'highContrast', label: 'High Contrast Mode', description: 'Increases contrast for better readability' },
    { id: 'reducedMotion', label: 'Reduce Motion', description: 'Minimizes animations and transitions' },
    { id: 'largerClickTargets', label: 'Larger Click Targets', description: 'Makes buttons and interactive elements larger' },
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t('settings.title', 'User Settings')}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-grow overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/4 bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'appearance' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('appearance')}
              >
                {t('settings.tabs.appearance', 'Appearance')}
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'preferences' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                {t('settings.tabs.preferences', 'Preferences')}
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'notifications' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                {t('settings.tabs.notifications', 'Notifications')}
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'privacy' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                {t('settings.tabs.privacy', 'Privacy')}
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'accessibility' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('accessibility')}
              >
                {t('settings.tabs.accessibility', 'Accessibility')}
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'data' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('data')}
              >
                {t('settings.tabs.data', 'Data Management')}
              </button>
            </nav>
            
            <div className="mt-8">
              <button
                onClick={handleResetToDefaults}
                className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
              >
                {t('settings.resetDefaults', 'Reset to Defaults')}
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="w-3/4 p-6 overflow-y-auto">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t('settings.appearance.title', 'Appearance Settings')}</h3>
                
                <div className="space-y-6">
                  {/* Dark Mode Setting */}
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative mr-3">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.appearance.darkMode || false}
                          onChange={(e) => toggleDarkMode(e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.appearance.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.appearance.darkMode ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <span className="font-medium">{t('settings.appearance.darkMode', 'Dark Mode')}</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-16">{t('settings.appearance.darkModeHelp', 'Switch between light and dark theme')}</p>
                  </div>
                
                  {/* Font Size Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.appearance.fontSize', 'Font Size')}</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          localSettings.appearance.fontSize === 'small'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('appearance', 'fontSize', 'small')}
                      >
                        {t('settings.appearance.small', 'Small')}
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          localSettings.appearance.fontSize === 'medium'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('appearance', 'fontSize', 'medium')}
                      >
                        {t('settings.appearance.medium', 'Medium')}
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          localSettings.appearance.fontSize === 'large'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('appearance', 'fontSize', 'large')}
                      >
                        {t('settings.appearance.large', 'Large')}
                      </button>
                    </div>
                  </div>
                  
                  {/* Color Scheme Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.appearance.colorScheme', 'Color Scheme')}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {colorSchemes.map(scheme => (
                        <button
                          key={scheme.id}
                          className={`p-3 rounded-lg flex items-center space-x-2 ${
                            localSettings.appearance.colorScheme === scheme.id
                              ? 'ring-2 ring-blue-500 bg-blue-100'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleChange('appearance', 'colorScheme', scheme.id)}
                        >
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: scheme.color }}
                          ></div>
                          <span>{t(`settings.appearance.colors.${scheme.id}`, scheme.name)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <p className="text-sm text-blue-700">
                    <strong>{t('settings.notes.note', 'Note')}:</strong> {t('settings.notes.saveToApply', 'Click "Save and Close" at the bottom of the screen to apply your appearance settings.')}
                  </p>
                </div>
              </div>
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t('settings.preferences.title', 'General Preferences')}</h3>
                
                <div className="space-y-6">
                  {/* Currency Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.preferences.defaultCurrency', 'Default Currency')}</label>
                    <select
                      value={localSettings.preferences.defaultCurrency}
                      onChange={(e) => handleChange('preferences', 'defaultCurrency', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} ({currency.symbol}) - {t(`settings.preferences.currencies.${currency.code}`, currency.name)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('settings.preferences.currencyHelp', 'Default currency used for budgeting and expenses.')}
                    </p>
                  </div>
                  
                  {/* Date Format Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.preferences.dateFormat', 'Date Format')}</label>
                    <div className="space-y-2">
                      {dateFormats.map(format => (
                        <label key={format.id} className="flex items-center">
                          <input
                            type="radio"
                            name="dateFormat"
                            value={format.id}
                            checked={localSettings.preferences.dateFormat === format.id}
                            onChange={() => handleChange('preferences', 'dateFormat', format.id)}
                            className="mr-2"
                          />
                          <span>{format.display}</span>
                          <span className="ml-2 text-sm text-gray-500">e.g., {format.example}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Distance Unit Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.preferences.distanceUnit', 'Distance Unit')}</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          localSettings.preferences.distanceUnit === 'miles'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('preferences', 'distanceUnit', 'miles')}
                      >
                        {t('settings.preferences.miles', 'Miles')}
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          localSettings.preferences.distanceUnit === 'kilometers'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('preferences', 'distanceUnit', 'kilometers')}
                      >
                        {t('settings.preferences.kilometers', 'Kilometers')}
                      </button>
                    </div>
                  </div>
                  
                  {/* Temperature Unit Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.preferences.temperatureUnit', 'Temperature Unit')}</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          localSettings.preferences.temperatureUnit === 'fahrenheit'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('preferences', 'temperatureUnit', 'fahrenheit')}
                      >
                        {t('settings.preferences.fahrenheit', 'Fahrenheit (°F)')}
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          localSettings.preferences.temperatureUnit === 'celsius'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('preferences', 'temperatureUnit', 'celsius')}
                      >
                        {t('settings.preferences.celsius', 'Celsius (°C)')}
                      </button>
                    </div>
                  </div>
                  
                  {/* Language Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.preferences.language', 'Language')}</label>
                    <select
                      value={localSettings.preferences.language}
                      onChange={handleLanguageChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {AVAILABLE_LANGUAGES.map(language => (
                        <option key={language.code} value={language.code}>
                          {language.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('settings.preferences.languageHelp', 'Select your preferred language for the application.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t('settings.notifications.title', 'Notification Settings')}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.notifications.tripReminders', 'Trip Reminders')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.notifications.tripRemindersHelp', 'Receive reminders about upcoming trips')}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.notifications.tripReminders}
                          onChange={(e) => handleChange('notifications', 'tripReminders', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.notifications.tripReminders ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.notifications.tripReminders ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.notifications.taskReminders', 'Task Reminders')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.notifications.taskRemindersHelp', 'Receive reminders about upcoming tasks and deadlines')}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.notifications.taskReminders}
                          onChange={(e) => handleChange('notifications', 'taskReminders', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.notifications.taskReminders ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.notifications.taskReminders ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.notifications.budgetAlerts', 'Budget Alerts')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.notifications.budgetAlertsHelp', "Receive alerts when you're approaching your budget limits")}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.notifications.budgetAlerts}
                          onChange={(e) => handleChange('notifications', 'budgetAlerts', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.notifications.budgetAlerts ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.notifications.budgetAlerts ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.notifications.emailNotifications', 'Email Notifications')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.notifications.emailNotificationsHelp', 'Receive notifications via email')}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.notifications.emailNotifications}
                          onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.notifications.emailNotifications ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>

                  {/* Email configuration section (shown when email notifications are enabled) */}
                  {localSettings.notifications.emailNotifications && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium mb-3">{t('settings.notifications.emailConfig', 'Email Configuration')}</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.notifications.emailAddress', 'Email Address')}</label>
                          <input
                            type="email"
                            value={localSettings.notifications.emailAddress || ''}
                            onChange={(e) => handleChange('notifications', 'emailAddress', e.target.value)}
                            placeholder={t('settings.notifications.emailPlaceholder', 'Enter your email address')}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.notifications.frequency', 'Notification Frequency')}</label>
                          <select
                            value={localSettings.notifications.emailFrequency || 'daily'}
                            onChange={(e) => handleChange('notifications', 'emailFrequency', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                          >
                            <option value="instant">{t('settings.notifications.instant', 'Instant')}</option>
                            <option value="daily">{t('settings.notifications.daily', 'Daily Summary')}</option>
                            <option value="weekly">{t('settings.notifications.weekly', 'Weekly Summary')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                  <p className="text-sm text-yellow-700">
                    <strong>{t('settings.notes.note', 'Note')}:</strong> {t('settings.notifications.permissionsNote', "Browser notifications require permission. If you've denied permission, you'll need to update your browser settings.")}
                  </p>
                </div>
              </div>
            )}
            
            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t('settings.privacy.title', 'Privacy Settings')}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.privacy.shareLocation', 'Share Location Data')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.privacy.shareLocationHelp', 'Allow access to your location for better recommendations')}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.privacy.shareLocationData}
                          onChange={(e) => handleChange('privacy', 'shareLocationData', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.privacy.shareLocationData ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.privacy.shareLocationData ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.privacy.analytics', 'Usage Analytics')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.privacy.analyticsHelp', 'Allow anonymous usage data collection to improve the app')}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.privacy.collectAnalytics}
                          onChange={(e) => handleChange('privacy', 'collectAnalytics', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.privacy.collectAnalytics ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.privacy.collectAnalytics ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.privacy.autoSave', 'Auto-Save')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.privacy.autoSaveHelp', 'Automatically save trips and changes')}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.privacy.autoSaveEnabled}
                          onChange={(e) => handleChange('privacy', 'autoSaveEnabled', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.privacy.autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.privacy.autoSaveEnabled ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>

                  {/* Data Retention Settings */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">{t('settings.privacy.dataRetention', 'Data Retention')}</h4>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.privacy.keepHistoryFor', 'Keep trip history for')}</label>
                      <select
                        value={localSettings.privacy.dataRetention || 'forever'}
                        onChange={(e) => handleChange('privacy', 'dataRetention', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="1month">{t('settings.privacy.1month', '1 month')}</option>
                        <option value="3months">{t('settings.privacy.3months', '3 months')}</option>
                        <option value="6months">{t('settings.privacy.6months', '6 months')}</option>
                        <option value="1year">{t('settings.privacy.1year', '1 year')}</option>
                        <option value="forever">{t('settings.privacy.forever', 'Forever')}</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('settings.privacy.dataRetentionHelp', 'Past trips older than this will be automatically deleted.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t('settings.accessibility.title', 'Accessibility Settings')}</h3>
                
                <div className="space-y-4">
                  {accessibilityOptions.map(option => (
                    <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{t(`settings.accessibility.${option.id}`, option.label)}</h4>
                        <p className="text-sm text-gray-500">{t(`settings.accessibility.${option.id}Help`, option.description)}</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={localSettings.accessibility?.[option.id] || false}
                            onChange={(e) => handleChange('accessibility', option.id, e.target.checked)}
                          />
                          <div className={`block w-14 h-8 rounded-full ${localSettings.accessibility?.[option.id] ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.accessibility?.[option.id] ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                      </label>
                    </div>
                  ))}
                  
                  {/* Text Size Adjustment (separate from font size setting) */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">{t('settings.accessibility.textScaling', 'Text Scaling')}</h4>
                    <p className="text-sm text-gray-500 mb-3">{t('settings.accessibility.textScalingHelp', 'Adjust text size independently from the interface size')}</p>
                    
                    <input
                      type="range"
                      min="100"
                      max="200"
                      step="10"
                      value={localSettings.accessibility?.textScaling || 100}
                      onChange={(e) => handleChange('accessibility', 'textScaling', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>100%</span>
                      <span>150%</span>
                      <span>200%</span>
                    </div>
                    <div className="mt-3 text-center">
                      <span className="font-medium">
                        {t('settings.accessibility.current', 'Current')}: {localSettings.accessibility?.textScaling || 100}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Screen Reader Optimization */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('settings.accessibility.screenReader', 'Screen Reader Optimization')}</h4>
                      <p className="text-sm text-gray-500">{t('settings.accessibility.screenReaderHelp', 'Enhanced descriptions for screen readers')}</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={localSettings.accessibility?.screenReaderOptimized || false}
                          onChange={(e) => handleChange('accessibility', 'screenReaderOptimized', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${localSettings.accessibility?.screenReaderOptimized ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localSettings.accessibility?.screenReaderOptimized ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <p className="text-sm text-blue-700">
                    <strong>{t('settings.notes.note', 'Note')}:</strong> {t('settings.accessibility.note', 'These settings help make the application more accessible for all users.')}
                  </p>
                </div>
              </div>
            )}
            
            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t('settings.data.title', 'Data Management')}</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">{t('settings.data.exportData', 'Export Your Data')}</h4>
                    <p className="text-sm mb-3">
                      {t('settings.data.exportHelp', 'Download all your trip data and settings as a backup file. You can import this file later to restore your data.')}
                    </p>
                    <button
                      onClick={handleExportData}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t('settings.data.exportButton', 'Export All Data')}
                    </button>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-700 mb-2">{t('settings.data.importData', 'Import Data')}</h4>
                    <p className="text-sm mb-3">
                      {t('settings.data.importHelp', 'Restore your data from a previously exported backup file.')}
                    </p>
                    
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-green-50 file:text-green-700
                          hover:file:bg-green-100"
                      />
                      
                      {importError && (
                        <p className="text-sm text-red-600">{importError}</p>
                      )}
                      
                      <button
                        onClick={handleImportData}
                        disabled={!importFile}
                        className={`px-4 py-2 rounded ${!importFile ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      >
                        {t('settings.data.importButton', 'Import Data')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-700 mb-2">{t('settings.data.clearData', 'Clear All Data')}</h4>
                    <p className="text-sm mb-3">
                      {t('settings.data.clearHelp', 'This will permanently delete all your trips, templates, and settings. This action cannot be undone.')}
                    </p>
                    <button
                      onClick={handleClearData}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      {t('settings.data.clearButton', 'Clear All Data')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={saveAndClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {settingsChanged ? t('settings.buttons.saveClose', 'Save and Close') : t('settings.buttons.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;