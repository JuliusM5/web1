/**
 * Accessibility Utilities
 * 
 * Provides utilities for improving accessibility in the application,
 * including keyboard navigation, screen reader support, and more.
 */

// Constants
const FOCUS_SELECTORS = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

/**
 * Generate a unique ID with an optional prefix
 * 
 * @param {string} prefix Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateUniqueId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create a focus trap for modals and other UI elements
 * 
 * @param {HTMLElement} container Element to trap focus within
 * @returns {Function} Function to remove the focus trap
 */
export const createFocusTrap = (container) => {
  if (!container) return () => {};
  
  // Find all focusable elements in the container
  const focusableElements = Array.from(container.querySelectorAll(FOCUS_SELECTORS))
    .filter(el => !el.disabled && !el.getAttribute('aria-hidden'));
  
  // If no focusable elements, return empty function
  if (focusableElements.length === 0) return () => {};
  
  // Focus the first element
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Set focus to the first element
  setTimeout(() => {
    firstElement.focus();
  }, 50);
  
  // Handle keydown events to trap focus
  const handleKeyDown = (event) => {
    // If not Tab key, ignore
    if (event.key !== 'Tab') return;
    
    // If Shift+Tab and focus is on first element, move to last element
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    
    // If Tab and focus is on last element, move to first element
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
  
  // Add event listener
  container.addEventListener('keydown', handleKeyDown);
  
  // Return function to remove focus trap
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Get props for a skip link component
 * 
 * @param {Object} options Options for the skip link
 * @param {string} options.target ID of the target element to skip to
 * @param {string} options.label Label for the skip link
 * @returns {Object} Props for the skip link component
 */
export const getSkipLinkProps = ({ target, label = 'Skip to main content' }) => {
  if (!target) {
    console.warn('No target specified for skip link');
    return {};
  }
  
  return {
    href: `#${target}`,
    className: `
      absolute top-0 left-0 -translate-y-full focus:translate-y-0 z-50
      bg-white text-blue-600 px-4 py-2 border-b border-r border-gray-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform
    `,
    children: label,
    onKeyDown: (e) => {
      // If Enter or Space is pressed, focus the target element
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const targetElement = document.getElementById(target);
        if (targetElement) {
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus();
          // Remove tabindex after focus
          setTimeout(() => {
            targetElement.removeAttribute('tabindex');
          }, 100);
        }
      }
    }
  };
};

/**
 * Announce a message to screen readers using an ARIA live region
 * 
 * @param {string} message Message to announce
 * @param {string} priority Priority of the announcement ('polite' or 'assertive')
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  // Validate priority
  if (priority !== 'polite' && priority !== 'assertive') {
    console.warn(`Invalid priority: ${priority}. Using 'polite' instead.`);
    priority = 'polite';
  }
  
  // Find or create the announcer element
  let announcer = document.getElementById(`sr-announcer-${priority}`);
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = `sr-announcer-${priority}`;
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  
  // Update the announcer with the message
  // We use a timeout to ensure the message is announced even if it hasn't changed
  setTimeout(() => {
    announcer.textContent = '';
    // Another timeout to ensure the empty string is registered
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  }, 50);
};

/**
 * Check if high contrast mode is enabled
 * 
 * @returns {boolean} True if high contrast mode is enabled
 */
export const isHighContrastMode = () => {
  // Check for Windows high contrast mode
  if (window.matchMedia('(-ms-high-contrast: active)').matches) {
    return true;
  }
  
  // Check for forced colors mode (newer browsers)
  if (window.matchMedia('(forced-colors: active)').matches) {
    return true;
  }
  
  return false;
};

/**
 * Check if reduced motion preference is enabled
 * 
 * @returns {boolean} True if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get ARIA attributes for an element based on its state
 * 
 * @param {Object} options Options for generating ARIA attributes
 * @returns {Object} ARIA attributes
 */
export const getAriaAttributes = (options = {}) => {
  const {
    isRequired,
    hasError,
    errorMessage,
    isDisabled,
    isExpanded,
    hasPopup,
    isPressed,
    isSelected,
    controls,
    describedBy,
    labelledBy,
    current
  } = options;
  
  const attributes = {};
  
  if (isRequired) attributes['aria-required'] = 'true';
  if (hasError) attributes['aria-invalid'] = 'true';
  if (errorMessage) attributes['aria-errormessage'] = errorMessage;
  if (isDisabled) attributes['aria-disabled'] = 'true';
  if (isExpanded !== undefined) attributes['aria-expanded'] = isExpanded ? 'true' : 'false';
  if (hasPopup) attributes['aria-haspopup'] = 'true';
  if (isPressed !== undefined) attributes['aria-pressed'] = isPressed ? 'true' : 'false';
  if (isSelected !== undefined) attributes['aria-selected'] = isSelected ? 'true' : 'false';
  if (controls) attributes['aria-controls'] = controls;
  if (describedBy) attributes['aria-describedby'] = describedBy;
  if (labelledBy) attributes['aria-labelledby'] = labelledBy;
  if (current) attributes['aria-current'] = current;
  
  return attributes;
};

/**
 * Get the heading level based on context
 * 
 * @param {number} baseLevel Base heading level
 * @param {number} contextLevel Context heading level
 * @returns {number} Appropriate heading level (1-6)
 */
export const getHeadingLevel = (baseLevel = 1, contextLevel = 0) => {
  const level = baseLevel + contextLevel;
  return Math.max(1, Math.min(6, level));
};

/**
 * Ensure a string is safe for use as an HTML ID
 * 
 * @param {string} str String to sanitize
 * @returns {string} Sanitized string safe for use as an ID
 */
export const sanitizeId = (str) => {
  if (!str) return '';
  
  return str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')   // Remove non-word characters
    .replace(/\-\-+/g, '-')     // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')         // Trim hyphens from start
    .replace(/-+$/, '');        // Trim hyphens from end
};

/**
 * Check if an element is currently visible in the viewport
 * 
 * @param {HTMLElement} element Element to check
 * @param {Object} options Options for the check
 * @returns {boolean} True if the element is visible
 */
export const isElementInViewport = (element, options = {}) => {
  if (!element) return false;
  
  const {
    fully = false,   // Whether the element needs to be fully visible
    offset = 0       // Offset from the viewport edges
  } = options;
  
  const rect = element.getBoundingClientRect();
  
  if (fully) {
    return (
      rect.top >= offset &&
      rect.left >= offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) - offset
    );
  }
  
  return (
    rect.bottom >= offset &&
    rect.right >= offset &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) - offset
  );
};