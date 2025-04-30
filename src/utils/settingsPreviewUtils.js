/**
 * Utilities for previewing settings changes
 */
import translations from './translations';

// Map of preview elements for different settings
const previewElements = {};

/**
 * Create or update a preview element for settings previews
 * 
 * @param {string} id Unique identifier for the preview
 * @param {Object} settings Settings to preview
 * @param {string} type Type of preview (appearance, currency, date, accessibility, darkMode)
 * @param {string} language Current language code
 * @returns {HTMLElement} The preview element
 */
export const createSettingsPreview = (id, settings, type, language = 'en-US') => {
  // Create a translate function for the current language
  const t = createTranslateFunction(language);
  
  // Check if we already have a preview element for this ID
  let previewElement = previewElements[id];
  
  if (!previewElement) {
    // Create a new preview element
    previewElement = document.createElement('div');
    previewElement.id = `settings-preview-${id}`;
    previewElement.style.position = 'fixed';
    previewElement.style.bottom = '20px';
    previewElement.style.right = '20px';
    previewElement.style.padding = '10px';
    previewElement.style.borderRadius = '6px';
    previewElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    previewElement.style.zIndex = '9999';
    previewElement.style.transition = 'all 0.3s ease';
    
    // Add to document
    document.body.appendChild(previewElement);
    
    // Store for future use
    previewElements[id] = previewElement;
  }
  
  // Update the preview based on type
  if (type === 'appearance') {
    updateAppearancePreview(previewElement, settings.appearance, t);
  } else if (type === 'currency') {
    updateCurrencyPreview(previewElement, settings.preferences, t);
  } else if (type === 'date') {
    updateDatePreview(previewElement, settings.preferences, t);
  } else if (type === 'accessibility') {
    updateAccessibilityPreview(previewElement, settings.accessibility, t);
  } else if (type === 'darkMode') {
    updateDarkModePreview(previewElement, settings.appearance, t);
  }
  
  // Show the preview
  previewElement.style.display = 'block';
  
  // Return the element
  return previewElement;
};

/**
 * Create a translation function for the specified language
 * 
 * @param {string} language Language code (e.g., 'en-US', 'es-ES')
 * @returns {Function} Translation function
 */
const createTranslateFunction = (language) => {
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

/**
 * Hide a preview element
 * 
 * @param {string} id Unique identifier for the preview
 */
export const hideSettingsPreview = (id) => {
  const previewElement = previewElements[id];
  
  if (previewElement) {
    previewElement.style.display = 'none';
  }
};

/**
 * Update appearance preview
 * 
 * @param {HTMLElement} element Preview element
 * @param {Object} appearance Appearance settings
 * @param {Function} t Translation function
 */
const updateAppearancePreview = (element, appearance, t) => {
  // Set background color based on color scheme
  const colorMap = {
    'blue': '#3b82f6',
    'purple': '#8b5cf6',
    'green': '#10b981',
    'red': '#ef4444',
    'amber': '#f59e0b',
    'indigo': '#6366f1'
  };
  
  // Set font size based on setting
  const fontSizeMap = {
    'small': '14px',
    'medium': '16px',
    'large': '18px'
  };
  
  // Get dark mode status
  const isDarkMode = appearance.darkMode || false;
  
  // Update preview styles based on dark mode
  if (isDarkMode) {
    element.style.backgroundColor = '#1e1e1e';
    element.style.color = 'white';
    element.style.borderLeft = `4px solid ${colorMap[appearance.colorScheme] || '#3b82f6'}`;
  } else {
    element.style.backgroundColor = 'white';
    element.style.color = '#333';
    element.style.borderLeft = `4px solid ${colorMap[appearance.colorScheme] || '#3b82f6'}`;
  }
  
  element.style.fontSize = fontSizeMap[appearance.fontSize] || '16px';
  
  // Update content
  element.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${t('settings.preview.theme')}</div>
    <div>${t('settings.preview.color')}: ${t(`settings.colors.${appearance.colorScheme}`)}</div>
    <div>${t('settings.preview.fontSize')}: ${t(`settings.fontSizes.${appearance.fontSize}`)}</div>
    <div>${t('settings.preview.darkMode')}: ${isDarkMode ? t('settings.preview.on') : t('settings.preview.off')}</div>
    <div style="margin-top: 8px; text-align: center; font-size: 12px;">${t('settings.preview.changesWillApply')}</div>
  `;
};

/**
 * Update dark mode preview
 * 
 * @param {HTMLElement} element Preview element
 * @param {Object} appearance Appearance settings
 * @param {Function} t Translation function
 */
const updateDarkModePreview = (element, appearance, t) => {
  const isDarkMode = appearance.darkMode || false;
  
  // Style the preview element
  if (isDarkMode) {
    element.style.backgroundColor = '#1e1e1e';
    element.style.color = '#e0e0e0';
    element.style.border = '1px solid #444';
  } else {
    element.style.backgroundColor = 'white';
    element.style.color = '#333';
    element.style.border = '1px solid #d1d5db';
  }
  
  // Sample content to demonstrate dark mode
  element.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${t('settings.preview.darkModeTitle')}</div>
    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
      <div style="width: 60px; height: 30px; background-color: ${isDarkMode ? '#333' : '#f3f4f6'}; border: 1px solid ${isDarkMode ? '#555' : '#d1d5db'}; display: flex; align-items: center; justify-content: center; font-size: 12px;">${t('form.button')}</div>
      <div style="width: 60px; height: 30px; background-color: ${isDarkMode ? '#3b82f6' : '#3b82f6'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">${t('form.primary')}</div>
    </div>
    <div style="padding: 8px; background-color: ${isDarkMode ? '#333' : '#f9fafb'}; border-radius: 4px; margin-bottom: 10px; font-size: 12px;">
      ${t('settings.preview.cardsAppearance', { mode: isDarkMode ? t('settings.preview.dark') : t('settings.preview.light') })}
    </div>
    <div style="margin-top: 8px; text-align: center; font-size: 12px;">${t('settings.preview.changesWillApply')}</div>
  `;
};

/**
 * Update currency preview
 * 
 * @param {HTMLElement} element Preview element
 * @param {Object} preferences Preference settings
 * @param {Function} t Translation function
 */
const updateCurrencyPreview = (element, preferences, t) => {
  const currencyCode = preferences.defaultCurrency || 'USD';
  
  // Currency symbol mapping
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'CA$',
    'AUD': 'AU$',
    'CNY': '¥',
    'INR': '₹'
  };
  
  const symbol = currencySymbols[currencyCode] || currencyCode;
  
  // Sample amount
  const sampleAmount = 1234.56;
  
  // Format the amount
  let formattedAmount;
  if (currencyCode === 'JPY' || currencyCode === 'CNY') {
    formattedAmount = Math.round(sampleAmount).toLocaleString();
  } else {
    formattedAmount = sampleAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
  
  // Update preview element
  element.style.backgroundColor = '#f0f9ff';
  element.style.color = '#0369a1';
  element.style.border = '1px solid #bae6fd';
  
  // Update content
  element.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${t('settings.preview.currencyTitle')}</div>
    <div style="font-size: 18px; margin-bottom: 5px;">${symbol}${formattedAmount}</div>
    <div style="font-size: 12px;">${t('settings.preview.currency')}: ${currencyCode}</div>
    <div style="margin-top: 8px; text-align: center; font-size: 12px;">${t('settings.preview.changesWillApply')}</div>
  `;
};

/**
 * Update date preview
 * 
 * @param {HTMLElement} element Preview element
 * @param {Object} preferences Preference settings
 * @param {Function} t Translation function
 */
const updateDatePreview = (element, preferences, t) => {
  const format = preferences.dateFormat || 'MM/DD/YYYY';
  
  // Current date
  const now = new Date();
  
  // Format the date based on the selected format
  let formattedDate;
  switch (format) {
    case 'DD/MM/YYYY':
      formattedDate = `${padZero(now.getDate())}/${padZero(now.getMonth() + 1)}/${now.getFullYear()}`;
      break;
    case 'YYYY-MM-DD':
      formattedDate = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
      break;
    case 'MMMM D, YYYY':
      formattedDate = `${getMonthName(now.getMonth(), t)} ${now.getDate()}, ${now.getFullYear()}`;
      break;
    case 'D MMMM YYYY':
      formattedDate = `${now.getDate()} ${getMonthName(now.getMonth(), t)} ${now.getFullYear()}`;
      break;
    case 'MM/DD/YYYY':
    default:
      formattedDate = `${padZero(now.getMonth() + 1)}/${padZero(now.getDate())}/${now.getFullYear()}`;
      break;
  }
  
  // Update preview element
  element.style.backgroundColor = '#f0fdf4';
  element.style.color = '#166534';
  element.style.border = '1px solid #86efac';
  
  // Update content
  element.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${t('settings.preview.dateFormatTitle')}</div>
    <div style="font-size: 18px; margin-bottom: 5px;">${formattedDate}</div>
    <div style="font-size: 12px;">${t('settings.preview.format')}: ${format}</div>
    <div style="margin-top: 8px; text-align: center; font-size: 12px;">${t('settings.preview.changesWillApply')}</div>
  `;
};

/**
 * Update accessibility preview
 * 
 * @param {HTMLElement} element Preview element
 * @param {Object} accessibility Accessibility settings
 * @param {Function} t Translation function
 */
const updateAccessibilityPreview = (element, accessibility, t) => {
  const highContrast = accessibility.highContrast || false;
  const largerClickTargets = accessibility.largerClickTargets || false;
  const textScaling = accessibility.textScaling || 100;
  
  // Style the preview element
  if (highContrast) {
    element.style.backgroundColor = 'black';
    element.style.color = 'white';
    element.style.border = '2px solid white';
  } else {
    element.style.backgroundColor = '#f3f4f6';
    element.style.color = '#1f2937';
    element.style.border = '1px solid #d1d5db';
  }
  
  // Apply text scaling
  const scaleFactor = textScaling / 100;
  
  // Update content
  element.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px; font-size: ${16 * scaleFactor}px;">${t('settings.preview.accessibilityTitle')}</div>
    <div style="margin-bottom: 10px; font-size: ${14 * scaleFactor}px;">
      <div>${t('settings.preview.highContrast')}: ${highContrast ? t('settings.preview.on') : t('settings.preview.off')}</div>
      <div>${t('settings.preview.largerTargets')}: ${largerClickTargets ? t('settings.preview.on') : t('settings.preview.off')}</div>
      <div>${t('settings.preview.textScale')}: ${textScaling}%</div>
    </div>
    <div style="display: flex; gap: 5px; margin-bottom: 5px;">
      <button style="
        padding: ${largerClickTargets ? '12px' : '6px'} ${largerClickTargets ? '16px' : '8px'};
        background-color: ${highContrast ? 'black' : '#e5e7eb'};
        color: ${highContrast ? 'yellow' : '#374151'};
        border: ${highContrast ? '2px solid white' : '1px solid #d1d5db'};
        font-size: ${12 * scaleFactor}px;
      ">${t('form.button')}</button>
      <button style="
        padding: ${largerClickTargets ? '12px' : '6px'} ${largerClickTargets ? '16px' : '8px'};
        background-color: ${highContrast ? 'yellow' : '#3b82f6'};
        color: ${highContrast ? 'black' : 'white'};
        border: none;
        font-size: ${12 * scaleFactor}px;
      ">${t('form.primary')}</button>
    </div>
    <div style="margin-top: 8px; text-align: center; font-size: ${12 * scaleFactor}px;">
      ${t('settings.preview.changesWillApply')}
    </div>
  `;
};

// Helper functions
const padZero = (num) => {
  return num.toString().padStart(2, '0');
};

const getMonthName = (monthIndex, t) => {
  return t(`date.month.${monthIndex}`);
};