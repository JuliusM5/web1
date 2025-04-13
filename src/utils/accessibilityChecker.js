/**
 * Accessibility Checker Tool
 * Runs checks against a component/DOM element to identify potential accessibility issues
 */

/**
 * Check if an element has alt text (for images)
 * @param {HTMLElement} element - The element to check
 * @returns {Object} - Result of the check
 */
const checkAltText = (element) => {
    if (element.tagName.toLowerCase() !== 'img') {
      return { passed: true, message: 'Not an image element' };
    }
    
    if (!element.hasAttribute('alt')) {
      return {
        passed: false,
        message: 'Image is missing alt text',
        element,
        severity: 'error',
        wcag: '1.1.1'
      };
    }
    
    // Check if alt is empty (decorative image)
    if (element.getAttribute('alt').trim() === '') {
      // Check if role="presentation" is present for decorative images
      if (!element.hasAttribute('role') || element.getAttribute('role') !== 'presentation') {
        return {
          passed: false,
          message: 'Decorative image should have role="presentation" or role="none"',
          element,
          severity: 'warning',
          wcag: '1.1.1'
        };
      }
      return { passed: true, message: 'Decorative image with empty alt text and correct role' };
    }
    
    return { passed: true, message: 'Image has alt text' };
  };
  
  /**
   * Check if form elements have associated labels
   * @param {HTMLElement} element - The element to check
   * @returns {Object} - Result of the check
   */
  const checkFormLabels = (element) => {
    const formElements = ['input', 'textarea', 'select'];
    const elementTag = element.tagName.toLowerCase();
    
    if (!formElements.includes(elementTag)) {
      return { passed: true, message: 'Not a form element' };
    }
    
    // Skip hidden and submit/button inputs
    if (elementTag === 'input') {
      const inputType = element.getAttribute('type')?.toLowerCase();
      if (inputType === 'hidden' || inputType === 'submit' || inputType === 'button') {
        return { passed: true, message: 'Input type does not require a label' };
      }
    }
    
    // Check for explicit label
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        return { passed: true, message: 'Element has an associated label' };
      }
    }
    
    // Check for implicit label (element wrapped in label)
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return { passed: true, message: 'Element is wrapped in a label' };
    }
    
    // Check for aria-label or aria-labelledby
    if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
      return { passed: true, message: 'Element has aria-label or aria-labelledby' };
    }
    
    return {
      passed: false,
      message: 'Form element is missing a label',
      element,
      severity: 'error',
      wcag: '3.3.2'
    };
  };
  
  /**
   * Check for proper heading structure
   * @param {HTMLElement} rootElement - The root element to check
   * @returns {Array<Object>} - Results of the check
   */
  const checkHeadingStructure = (rootElement) => {
    const headings = rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const results = [];
    
    let previousLevel = 0;
    
    // Check if document has an h1
    const hasH1 = rootElement.querySelector('h1');
    if (!hasH1) {
      results.push({
        passed: false,
        message: 'Document does not have a main heading (h1)',
        element: rootElement,
        severity: 'error',
        wcag: '1.3.1'
      });
    }
    
    // Check for heading level skips
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1), 10);
      
      if (previousLevel > 0 && level - previousLevel > 1) {
        results.push({
          passed: false,
          message: `Heading level skip from h${previousLevel} to h${level}`,
          element: heading,
          severity: 'warning',
          wcag: '1.3.1'
        });
      }
      
      previousLevel = level;
    });
    
    if (results.length === 0) {
      results.push({ passed: true, message: 'Heading structure is correct' });
    }
    
    return results;
  };
  
  /**
   * Check color contrast
   * @param {HTMLElement} element - The element to check
   * @returns {Object} - Result of the check
   */
  const checkColorContrast = (element) => {
    // This is a simplified check - in a real implementation,
    // you would use a library like axe-core or custom color analysis
    // as getting computed styles can be complex
    
    const hasContrastIssue = element.classList.contains('text-gray-400') || 
                             element.classList.contains('text-gray-300') ||
                             element.classList.contains('text-white bg-yellow-300');
    
    if (hasContrastIssue) {
      return {
        passed: false,
        message: 'Element may have insufficient color contrast',
        element,
        severity: 'warning',
        wcag: '1.4.3'
      };
    }
    
    return { passed: true, message: 'Color contrast appears sufficient' };
  };
  
  /**
   * Check for keyboard focus indicators
   * @param {HTMLElement} element - The element to check
   * @returns {Object} - Result of the check
   */
  const checkFocusIndicators = (element) => {
    const focusableElements = [
      'a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]:not([tabindex="-1"])'
    ];
    
    const selector = focusableElements.join(', ');
    if (!element.matches(selector)) {
      return { passed: true, message: 'Element is not focusable' };
    }
    
    // Check for elements that may have focus outline removed
    const hasFocusOutlineRemoved = element.classList.contains('focus:outline-none') && 
                                  !element.classList.contains('focus:ring') &&
                                  !element.classList.contains('focus:border');
    
    if (hasFocusOutlineRemoved) {
      return {
        passed: false,
        message: 'Focusable element has focus outline removed without alternative',
        element,
        severity: 'error',
        wcag: '2.4.7'
      };
    }
    
    return { passed: true, message: 'Focus indicator appears to be present' };
  };
  
  /**
   * Check for proper ARIA usage
   * @param {HTMLElement} element - The element to check
   * @returns {Array<Object>} - Results of the check
   */
  const checkAriaAttributes = (element) => {
    const results = [];
    
    // Check for invalid ARIA roles
    if (element.hasAttribute('role')) {
      const validRoles = [
        'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
        'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
        'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
        'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
        'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none',
        'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row',
        'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider',
        'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
        'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
      ];
      
      const role = element.getAttribute('role');
      if (!validRoles.includes(role)) {
        results.push({
          passed: false,
          message: `Invalid ARIA role: ${role}`,
          element,
          severity: 'error',
          wcag: '4.1.2'
        });
      }
    }
    
    // Check for aria-hidden on focusable elements
    if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') {
      const focusable = element.querySelector('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        results.push({
          passed: false,
          message: 'aria-hidden="true" element contains focusable elements',
          element,
          severity: 'error',
          wcag: '4.1.2'
        });
      }
    }
    
    // More ARIA checks could be added here
    
    if (results.length === 0) {
      results.push({ passed: true, message: 'ARIA attributes appear to be valid' });
    }
    
    return results;
  };
  
  /**
   * Check for proper button implementation
   * @param {HTMLElement} element - The element to check
   * @returns {Object} - Result of the check
   */
  const checkButtonImplementation = (element) => {
    // Check if a div, span or a is being used as a button
    if ((element.tagName.toLowerCase() === 'div' || 
         element.tagName.toLowerCase() === 'span' ||
         (element.tagName.toLowerCase() === 'a' && !element.hasAttribute('href'))) && 
        (element.getAttribute('role') === 'button' || 
         element.onclick || 
         element.addEventListener)) {
      
      // Check if it has keyboard support
      const hasKeyboardHandler = element.onkeydown || element.onkeyup || element.onkeypress;
      
      if (!hasKeyboardHandler) {
        return {
          passed: false,
          message: `${element.tagName.toLowerCase()} is being used as a button but lacks keyboard support`,
          element,
          severity: 'error',
          wcag: '2.1.1'
        };
      }
    }
    
    return { passed: true, message: 'Button implementation appears correct' };
  };
  
  /**
   * Run all accessibility checks on an element
   * @param {HTMLElement} element - The element to check
   * @returns {Array<Object>} - Results of all checks
   */
  export const runAccessibilityChecks = (element) => {
    // List of checks to run
    const checks = [
      checkAltText,
      checkFormLabels,
      checkColorContrast,
      checkFocusIndicators,
      checkButtonImplementation
    ];
    
    // Run each check and collect results
    const results = [];
    
    checks.forEach(check => {
      const checkResult = check(element);
      
      // Handle checks that return arrays
      if (Array.isArray(checkResult)) {
        results.push(...checkResult);
      } else {
        results.push(checkResult);
      }
    });
    
    // Add heading structure check (works on the whole document/component)
    results.push(...checkHeadingStructure(element));
    
    // Add ARIA checks (may return multiple results)
    results.push(...checkAriaAttributes(element));
    
    return results;
  };
  
  /**
   * Run accessibility checks on the entire page or a specific component
   * @param {HTMLElement} rootElement - The root element to check (defaults to document.body)
   * @returns {Array<Object>} - Results of all checks
   */
  export const auditAccessibility = (rootElement = document.body) => {
    const allResults = [];
    
    // Run checks on the root element itself
    allResults.push(...runAccessibilityChecks(rootElement));
    
    // Run checks on all child elements
    const allElements = rootElement.querySelectorAll('*');
    allElements.forEach(element => {
      allResults.push(...runAccessibilityChecks(element));
    });
    
    // Filter out passing results for a cleaner output
    const issues = allResults.filter(result => !result.passed);
    
    return issues;
  };
  
  /**
   * Log accessibility issues to the console
   * @param {Array<Object>} issues - Accessibility issues found
   */
  export const logAccessibilityIssues = (issues) => {
    if (issues.length === 0) {
      console.log('%c✓ No accessibility issues found', 'color: green; font-weight: bold;');
      return;
    }
    
    console.group(`🔍 Found ${issues.length} accessibility issues`);
    
    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    const warningCount = issues.filter(issue => issue.severity === 'warning').length;
    
    console.log(`Errors: ${errorCount}, Warnings: ${warningCount}`);
    
    issues.forEach(issue => {
      const logStyle = issue.severity === 'error' 
        ? 'color: red; font-weight: bold;' 
        : 'color: orange;';
      
      console.groupCollapsed(`%c${issue.severity.toUpperCase()}: ${issue.message}`, logStyle);
      console.log('Element:', issue.element);
      console.log('WCAG Criterion:', issue.wcag);
      console.groupEnd();
    });
    
    console.groupEnd();
  };