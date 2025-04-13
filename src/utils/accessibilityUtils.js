/**
 * Generate a unique ID for use with accessibility attributes
 * @param {string} prefix - ID prefix
 * @returns {string} - Unique ID
 */
export const generateUniqueId = (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  };
  
  /**
   * Handle keyboard navigation for interactive elements like menus and dropdowns
   * @param {KeyboardEvent} event - The keyboard event
   * @param {Object} options - Options for keyboard navigation
   * @param {number} options.currentIndex - Current focused index
   * @param {number} options.maxIndex - Maximum index (length - 1)
   * @param {Function} options.onSelect - Function to call when an item is selected
   * @param {Function} options.onClose - Function to call when menu should close
   * @param {Function} options.setFocusedIndex - Function to update focused index
   * @returns {void}
   */
  export const handleKeyboardNavigation = (event, {
    currentIndex,
    maxIndex,
    onSelect,
    onClose,
    setFocusedIndex
  }) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(currentIndex < maxIndex ? currentIndex + 1 : 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(currentIndex > 0 ? currentIndex - 1 : maxIndex);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(maxIndex);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect(currentIndex);
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      default:
        // Optional: Add typeahead functionality here
        break;
    }
  };
  
  /**
   * Check if a contrast ratio between two colors meets WCAG standards
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @param {string} level - 'AA' or 'AAA'
   * @param {boolean} isLargeText - Whether the text is large
   * @returns {boolean} - Whether the contrast ratio meets the standard
   */
  export const hasAdequateContrast = (foreground, background, level = 'AA', isLargeText = false) => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    // Calculate luminance
    const luminance = (r, g, b) => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };
    
    const rgb1 = hexToRgb(foreground);
    const rgb2 = hexToRgb(background);
    
    if (!rgb1 || !rgb2) return false;
    
    const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    // WCAG 2.1 standards
    if (level === 'AAA') {
      return isLargeText ? ratio >= 4.5 : ratio >= 7;
    }
    
    // AA standard
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  };
  
  /**
   * Focus trap for modals and dialogs - keeps focus inside a container
   * @param {HTMLElement} container - The container element to trap focus within
   * @returns {Function} - Function to remove the focus trap
   */
  export const createFocusTrap = (container) => {
    if (!container) return () => {};
    
    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return () => {};
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Auto-focus the first element
    firstElement.focus();
    
    // Handle keydown events
    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      
      // Shift + Tab: wrap from first to last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab: wrap from last to first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    
    // Add event listener
    container.addEventListener('keydown', handleKeyDown);
    
    // Return function to remove trap
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };
  
  /**
   * Screen reader only utility class name
   * Makes content visually hidden but available to screen readers
   * @returns {string} - CSS class name
   */
  export const srOnly = 'sr-only';
  
  /**
   * Announcement for screen readers (using aria-live)
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  export const announceToScreenReader = (message, priority = 'polite') => {
    // Check if announcement container exists
    let container = document.getElementById('sr-announcements');
    
    // Create container if it doesn't exist
    if (!container) {
      container = document.createElement('div');
      container.id = 'sr-announcements';
      container.setAttribute('aria-live', priority);
      container.setAttribute('role', 'status');
      container.setAttribute('aria-atomic', 'true');
      container.style.position = 'absolute';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.margin = '-1px';
      container.style.padding = '0';
      container.style.overflow = 'hidden';
      container.style.clip = 'rect(0, 0, 0, 0)';
      container.style.whiteSpace = 'nowrap';
      container.style.border = '0';
      document.body.appendChild(container);
    }
    
    // Set the priority (could change between announcements)
    container.setAttribute('aria-live', priority);
    
    // Announce the message
    // First clear it, then set it after a timeout for better screen reader support
    container.textContent = '';
    setTimeout(() => {
      container.textContent = message;
    }, 50);
  };
  
  /**
   * SkipLink component props
   * @typedef {Object} SkipLinkProps
   * @property {string} target - Target element ID to skip to
   * @property {string} [label] - Skip link label text
   */
  
  /**
   * Get props for a skip-to-content link
   * @param {SkipLinkProps} props - Skip link props
   * @returns {Object} - Props for the skip link
   */
  export const getSkipLinkProps = ({ target, label = 'Skip to main content' }) => {
    if (!target) {
      console.error('Skip link target is required');
      return {};
    }
    
    return {
      href: `#${target}`,
      className: 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-white text-blue-700 p-3 z-50',
      children: label,
    };
  };