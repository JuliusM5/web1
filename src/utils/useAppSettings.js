import { useSettings } from '../context/SettingsContext';
import { formatCurrency, formatDate, formatTemperature, formatDistance } from '../utils/settingsUtils';

/**
 * Custom hook for accessing and using application settings
 * Provides formatted values based on user preferences
 * 
 * @returns {Object} Utility functions and settings
 */
export const useAppSettings = () => {
  const { settings, updateSettings, resetSettings } = useSettings();

  /**
   * Format currency according to user settings
   * 
   * @param {number} amount Amount to format
   * @returns {string} Formatted currency string
   */
  const currency = (amount) => formatCurrency(amount, settings);
  
  /**
   * Format date according to user settings
   * 
   * @param {string|Date} date Date to format
   * @returns {string} Formatted date string
   */
  const date = (dateValue) => formatDate(dateValue, settings);
  
  /**
   * Format temperature according to user settings
   * 
   * @param {number} celsius Temperature in Celsius
   * @returns {string} Formatted temperature string
   */
  const temperature = (celsius) => formatTemperature(celsius, settings);
  
  /**
   * Format distance according to user settings
   * 
   * @param {number} kilometers Distance in kilometers
   * @returns {string} Formatted distance string
   */
  const distance = (kilometers) => formatDistance(kilometers, settings);
  
  /**
   * Get current color scheme
   * 
   * @returns {string} Current color scheme
   */
  const getColorScheme = () => settings.appearance.colorScheme;
  
  /**
   * Get current font size
   * 
   * @returns {string} Current font size
   */
  const getFontSize = () => settings.appearance.fontSize;
  
  /**
   * Check if dark mode is enabled
   * 
   * @returns {boolean} Whether dark mode is enabled
   */
  const isDarkMode = () => settings.appearance?.darkMode || false;
  
  /**
   * Check if a notification type is enabled
   * 
   * @param {string} type Notification type (tripReminders, taskReminders, budgetAlerts, emailNotifications)
   * @returns {boolean} Whether the notification type is enabled
   */
  const isNotificationEnabled = (type) => {
    if (!settings.notifications) return false;
    return !!settings.notifications[type];
  };
  
  /**
   * Get the email address for notifications
   * 
   * @returns {string} Email address for notifications
   */
  const getNotificationEmail = () => settings.notifications?.emailAddress || '';
  
  /**
   * Get the notification frequency
   * 
   * @returns {string} Notification frequency (instant, daily, weekly)
   */
  const getNotificationFrequency = () => settings.notifications?.emailFrequency || 'daily';
  
  /**
   * Get current language
   * 
   * @returns {string} Current language code
   */
  const getLanguage = () => settings.preferences.language;
  
  /**
   * Check if an accessibility feature is enabled
   * 
   * @param {string} feature Accessibility feature (highContrast, reducedMotion, largerClickTargets, screenReaderOptimized)
   * @returns {boolean} Whether the feature is enabled
   */
  const isAccessibilityFeatureEnabled = (feature) => {
    if (!settings.accessibility) return false;
    return !!settings.accessibility[feature];
  };
  
  /**
   * Get text scaling percentage
   * 
   * @returns {number} Text scaling percentage (100-200)
   */
  const getTextScaling = () => settings.accessibility?.textScaling || 100;
  
  /**
   * Check if location sharing is enabled
   * 
   * @returns {boolean} Whether location sharing is enabled
   */
  const isLocationSharingEnabled = () => settings.privacy?.shareLocationData || false;
  
  /**
   * Check if analytics collection is enabled
   * 
   * @returns {boolean} Whether analytics collection is enabled
   */
  const isAnalyticsEnabled = () => settings.privacy?.collectAnalytics || false;
  
  /**
   * Check if auto-save is enabled
   * 
   * @returns {boolean} Whether auto-save is enabled
   */
  const isAutoSaveEnabled = () => settings.privacy?.autoSaveEnabled || false;
  
  /**
   * Get data retention period
   * 
   * @returns {string} Data retention period (1month, 3months, 6months, 1year, forever)
   */
  const getDataRetention = () => settings.privacy?.dataRetention || 'forever';
  
  return {
    settings,
    updateSettings,
    resetSettings,
    currency,
    date,
    temperature,
    distance,
    getColorScheme,
    getFontSize,
    isDarkMode,
    isNotificationEnabled,
    getNotificationEmail,
    getNotificationFrequency,
    getLanguage,
    isAccessibilityFeatureEnabled,
    getTextScaling,
    isLocationSharingEnabled,
    isAnalyticsEnabled,
    isAutoSaveEnabled,
    getDataRetention
  };
};

export default useAppSettings;