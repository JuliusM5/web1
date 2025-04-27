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
   * Check if a notification type is enabled
   * 
   * @param {string} type Notification type
   * @returns {boolean} Whether the notification type is enabled
   */
  const isNotificationEnabled = (type) => {
    if (!settings.notifications) return false;
    return !!settings.notifications[type];
  };
  
  /**
   * Get current language
   * 
   * @returns {string} Current language code
   */
  const getLanguage = () => settings.preferences.language;
  
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
    isNotificationEnabled,
    getLanguage
  };
};

export default useAppSettings;