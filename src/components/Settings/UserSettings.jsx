import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { exportUserData, importUserData, clearAllAppData } from '../../utils/settingsUtils';

function UserSettings({ onClose }) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('appearance');
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState('');
  
  // Handle input changes
  const handleChange = (section, setting, value) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [setting]: value
      }
    };
    updateSettings(newSettings);
  };
  
  // Save settings and close
  const saveAndClose = () => {
    onClose();
  };
  
  // Reset to defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      resetSettings();
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
  
  // Language options
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">User Settings</h2>
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
                Appearance
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'preferences' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                Preferences
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'notifications' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'privacy' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                Privacy
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  activeTab === 'data' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('data')}
              >
                Data Management
              </button>
            </nav>
            
            <div className="mt-8">
              <button
                onClick={handleResetToDefaults}
                className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="w-3/4 p-6 overflow-y-auto">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Appearance Settings</h3>
                
                <div className="space-y-6">
                  
                  
                  {/* Font Size Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          settings.appearance.fontSize === 'small'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('appearance', 'fontSize', 'small')}
                      >
                        Small
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          settings.appearance.fontSize === 'medium'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('appearance', 'fontSize', 'medium')}
                      >
                        Medium
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          settings.appearance.fontSize === 'large'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('appearance', 'fontSize', 'large')}
                      >
                        Large
                      </button>
                    </div>
                  </div>
                  
                  {/* Color Scheme Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {colorSchemes.map(scheme => (
                        <button
                          key={scheme.id}
                          className={`p-3 rounded-lg flex items-center space-x-2 ${
                            settings.appearance.colorScheme === scheme.id
                              ? 'ring-2 ring-blue-500 bg-blue-50'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleChange('appearance', 'colorScheme', scheme.id)}
                        >
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: scheme.color }}
                          ></div>
                          <span>{scheme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Some appearance settings may require refreshing the application to fully apply.
                  </p>
                </div>
              </div>
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-medium mb-4">General Preferences</h3>
                
                <div className="space-y-6">
                  {/* Currency Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select
                      value={settings.preferences.defaultCurrency}
                      onChange={(e) => handleChange('preferences', 'defaultCurrency', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} ({currency.symbol}) - {currency.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Default currency used for budgeting and expenses.
                    </p>
                  </div>
                  
                  {/* Date Format Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <div className="space-y-2">
                      {dateFormats.map(format => (
                        <label key={format.id} className="flex items-center">
                          <input
                            type="radio"
                            value={format.id}
                            checked={settings.preferences.dateFormat === format.id}
                            onChange={() => handleChange('preferences', 'dateFormat', format.id)}
                            className="mr-2"
                          />
                          <span>{format.display}</span>
                          <span className="ml-2 text-gray-500">e.g., {format.example}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Distance Unit Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distance Unit</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          settings.preferences.distanceUnit === 'miles'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('preferences', 'distanceUnit', 'miles')}
                      >
                        Miles
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          settings.preferences.distanceUnit === 'kilometers'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('preferences', 'distanceUnit', 'kilometers')}
                      >
                        Kilometers
                      </button>
                    </div>
                  </div>
                  
                  {/* Temperature Unit Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature Unit</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          settings.preferences.temperatureUnit === 'fahrenheit'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('preferences', 'temperatureUnit', 'fahrenheit')}
                      >
                        Fahrenheit (°F)
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          settings.preferences.temperatureUnit === 'celsius'
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleChange('preferences', 'temperatureUnit', 'celsius')}
                      >
                        Celsius (°C)
                      </button>
                    </div>
                  </div>
                  
                  {/* Language Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.preferences.language}
                      onChange={(e) => handleChange('preferences', 'language', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {languages.map(language => (
                        <option key={language.code} value={language.code}>
                          {language.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      The language used throughout the application.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Trip Reminders</h4>
                      <p className="text-sm text-gray-500">Receive reminders about upcoming trips</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.notifications.tripReminders}
                          onChange={(e) => handleChange('notifications', 'tripReminders', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${settings.notifications.tripReminders ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.notifications.tripReminders ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Task Reminders</h4>
                      <p className="text-sm text-gray-500">Receive reminders about upcoming tasks and deadlines</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.notifications.taskReminders}
                          onChange={(e) => handleChange('notifications', 'taskReminders', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${settings.notifications.taskReminders ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.notifications.taskReminders ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Budget Alerts</h4>
                      <p className="text-sm text-gray-500">Receive alerts when you're approaching your budget limits</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.notifications.budgetAlerts}
                          onChange={(e) => handleChange('notifications', 'budgetAlerts', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${settings.notifications.budgetAlerts ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.notifications.budgetAlerts ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${settings.notifications.emailNotifications ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.notifications.emailNotifications ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Browser notifications require permission. If you've denied permission, you'll need to update your browser settings.
                  </p>
                </div>
              </div>
            )}
            
            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Share Location Data</h4>
                      <p className="text-sm text-gray-500">Allow access to your location for better recommendations</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.privacy.shareLocationData}
                          onChange={(e) => handleChange('privacy', 'shareLocationData', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${settings.privacy.shareLocationData ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.privacy.shareLocationData ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Usage Analytics</h4>
                      <p className="text-sm text-gray-500">Allow anonymous usage data collection to improve the app</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.privacy.collectAnalytics}
                          onChange={(e) => handleChange('privacy', 'collectAnalytics', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${settings.privacy.collectAnalytics ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.privacy.collectAnalytics ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Auto-Save</h4>
                      <p className="text-sm text-gray-500">Automatically save trips and changes</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.privacy.autoSaveEnabled}
                          onChange={(e) => handleChange('privacy', 'autoSaveEnabled', e.target.checked)}
                        />
                        <div className={`block w-14 h-8 rounded-full ${settings.privacy.autoSaveEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.privacy.autoSaveEnabled ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Data Management</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">Export Your Data</h4>
                    <p className="text-sm mb-3">
                      Download all your trip data and settings as a backup file. You can import this file later to restore your data.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Export All Data
                    </button>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-700 mb-2">Import Data</h4>
                    <p className="text-sm mb-3">
                      Restore your data from a previously exported backup file.
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
                        Import Data
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-700 mb-2">Clear All Data</h4>
                    <p className="text-sm mb-3">
                      This will permanently delete all your trips, templates, and settings. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleClearData}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Clear All Data
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;