/**
 * Accessibility Checker
 * 
 * Provides utilities for checking accessibility issues in the application.
 * This is intended for development use and can be disabled in production.
 */

/**
 * Run all accessibility checks on the page
 * 
 * @param {Object} options Options for the accessibility check
 * @returns {Array} Array of accessibility issues found
 */
export const runAccessibilityChecks = (options = {}) => {
    const {
      rootElement = document.body,
      checkImages = true,
      checkHeadings = true,
      checkForms = true,
      checkLinks = true,
      checkAria = true,
      checkContrast = true,
      verbose = false
    } = options;
    
    let issues = [];
    
    if (checkImages) {
      issues = [...issues, ...checkImagesAccessibility(rootElement)];
    }
    
    if (checkHeadings) {
      issues = [...issues, ...checkHeadingsStructure(rootElement)];
    }
    
    if (checkForms) {
      issues = [...issues, ...checkFormsAccessibility(rootElement)];
    }
    
    if (checkLinks) {
      issues = [...issues, ...checkLinksAccessibility(rootElement)];
    }
    
    if (checkAria) {
      issues = [...issues, ...checkAriaAttributes(rootElement)];
    }
    
    if (checkContrast && typeof window !== 'undefined') {
      issues = [...issues, ...checkColorContrast(rootElement)];
    }
    
    // Log issues if verbose
    if (verbose && issues.length > 0) {
      console.group('Accessibility Issues:');
      issues.forEach(issue => {
        console.warn(`${issue.type}: ${issue.message}`, issue.element);
      });
      console.groupEnd();
    }
    
    return issues;
  };
  
  /**
   * Check image accessibility issues
   * 
   * @param {HTMLElement} rootElement Root element to check from
   * @returns {Array} Array of accessibility issues found
   */
  const checkImagesAccessibility = (rootElement) => {
    const issues = [];
    const images = rootElement.querySelectorAll('img');
    
    images.forEach(img => {
      // Check for missing alt attribute
      if (!img.hasAttribute('alt')) {
        issues.push({
          element: img,
          type: 'Image',
          message: 'Image is missing alt attribute',
          severity: 'error',
          wcag: '1.1.1'
        });
      }
      
      // Check for empty alt on non-decorative images
      if (img.hasAttribute('alt') && img.alt === '' && !img.hasAttribute('role') && !img.hasAttribute('aria-hidden')) {
        // Check if image looks decorative
        const width = img.width || img.offsetWidth;
        const height = img.height || img.offsetHeight;
        const src = img.src || '';
        
        // Simple heuristic for potentially non-decorative images
        if ((width > 50 || height > 50) && !src.includes('decoration') && !src.includes('background')) {
          issues.push({
            element: img,
            type: 'Image',
            message: 'Image has empty alt attribute but might not be decorative',
            severity: 'warning',
            wcag: '1.1.1'
          });
        }
      }
      
      // Check for excessively long alt text
      if (img.alt && img.alt.length > 125) {
        issues.push({
          element: img,
          type: 'Image',
          message: 'Alt text is too long (> 125 characters)',
          severity: 'warning',
          wcag: '1.1.1'
        });
      }
    });
    
    return issues;
  };
  
  /**
   * Check heading structure for accessibility issues
   * 
   * @param {HTMLElement} rootElement Root element to check from
   * @returns {Array} Array of accessibility issues found
   */
  const checkHeadingsStructure = (rootElement) => {
    const issues = [];
    const headings = rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Check if there are any headings
    if (headings.length === 0) {
      // Only flag if the root element is substantial
      if (rootElement.textContent.length > 500) {
        issues.push({
          element: rootElement,
          type: 'Heading',
          message: 'No headings found in content',
          severity: 'warning',
          wcag: '1.3.1, 2.4.6'
        });
      }
      return issues;
    }
    
    // Check for h1 presence
    const hasH1 = rootElement.querySelector('h1');
    if (!hasH1 && rootElement === document.body) {
      issues.push({
        element: rootElement,
        type: 'Heading',
        message: 'Page does not contain an h1 heading',
        severity: 'error',
        wcag: '1.3.1, 2.4.6'
      });
    }
    
    // Check for heading level skipping
    let lastLevel = 0;
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.substring(1), 10);
      
      // Check for empty headings
      if (!heading.textContent.trim()) {
        issues.push({
          element: heading,
          type: 'Heading',
          message: 'Heading has no content',
          severity: 'error',
          wcag: '1.3.1, 2.4.6'
        });
      }
      
      // Check for skipped heading levels
      if (lastLevel !== 0 && currentLevel > lastLevel + 1) {
        issues.push({
          element: heading,
          type: 'Heading',
          message: `Heading level skipped from h${lastLevel} to h${currentLevel}`,
          severity: 'warning',
          wcag: '1.3.1, 2.4.6'
        });
      }
      
      lastLevel = currentLevel;
    });
    
    return issues;
  };
  
  /**
   * Check form elements for accessibility issues
   * 
   * @param {HTMLElement} rootElement Root element to check from
   * @returns {Array} Array of accessibility issues found
   */
  const checkFormsAccessibility = (rootElement) => {
    const issues = [];
    
    // Check for inputs without associated labels
    const inputs = rootElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      // Skip inputs of type hidden, submit, reset, or button
      if (input.type === 'hidden' || input.type === 'submit' || input.type === 'reset' || input.type === 'button') {
        return;
      }
      
      // Skip if input has aria-hidden="true"
      if (input.getAttribute('aria-hidden') === 'true') {
        return;
      }
      
      // Check if input has an associated label
      const inputId = input.id;
      let hasLabel = false;
      
      if (inputId) {
        // Check for explicit label
        const label = rootElement.querySelector(`label[for="${inputId}"]`);
        hasLabel = !!label;
      }
      
      // Check for implicit label (input is a child of label)
      if (!hasLabel) {
        const parentLabel = input.closest('label');
        hasLabel = !!parentLabel;
      }
      
      // Check for aria-label or aria-labelledby
      const hasAriaLabel = input.hasAttribute('aria-label') && input.getAttribute('aria-label').trim() !== '';
      const hasAriaLabelledBy = input.hasAttribute('aria-labelledby') && input.getAttribute('aria-labelledby').trim() !== '';
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push({
          element: input,
          type: 'Form',
          message: 'Form control has no associated label',
          severity: 'error',
          wcag: '1.3.1, 3.3.2, 4.1.2'
        });
      }
    });
    
    // Check for required inputs without indication
    const requiredInputs = rootElement.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
      // Check if the required state is visually indicated
      const inputId = input.id;
      let hasVisualIndication = false;
      
      if (inputId) {
        const label = rootElement.querySelector(`label[for="${inputId}"]`);
        if (label) {
          // Check for * or "required" text in label
          const labelText = label.textContent.toLowerCase();
          hasVisualIndication = labelText.includes('*') || labelText.includes('required');
        }
      }
      
      // Check for placeholder or aria-label indicating requirement
      if (!hasVisualIndication) {
        const placeholder = input.getAttribute('placeholder') || '';
        const ariaLabel = input.getAttribute('aria-label') || '';
        
        hasVisualIndication = 
          placeholder.toLowerCase().includes('required') || 
          ariaLabel.toLowerCase().includes('required') ||
          placeholder.includes('*') ||
          ariaLabel.includes('*');
      }
      
      // Check for aria-required
      const hasAriaRequired = input.getAttribute('aria-required') === 'true';
      
      if (!hasVisualIndication && !hasAriaRequired) {
        issues.push({
          element: input,
          type: 'Form',
          message: 'Required input is not visually indicated as required',
          severity: 'warning',
          wcag: '3.3.2'
        });
      }
    });
    
    return issues;
  };
  
  /**
   * Check links for accessibility issues
   * 
   * @param {HTMLElement} rootElement Root element to check from
   * @returns {Array} Array of accessibility issues found
   */
  const checkLinksAccessibility = (rootElement) => {
    const issues = [];
    const links = rootElement.querySelectorAll('a');
    
    links.forEach(link => {
      // Skip links with aria-hidden="true"
      if (link.getAttribute('aria-hidden') === 'true') {
        return;
      }
      
      // Check for empty links
      if (!link.textContent.trim() && !link.querySelector('img[alt]') && !link.getAttribute('aria-label')) {
        issues.push({
          element: link,
          type: 'Link',
          message: 'Link has no text content',
          severity: 'error',
          wcag: '2.4.4, 4.1.2'
        });
      }
      
      // Check for generic link text
      const linkText = link.textContent.trim().toLowerCase();
      const genericTexts = ['click here', 'read more', 'more', 'learn more', 'details', 'link', 'here'];
      
      if (genericTexts.includes(linkText) && !link.getAttribute('aria-label') && !link.getAttribute('aria-labelledby')) {
        issues.push({
          element: link,
          type: 'Link',
          message: `Link text "${linkText}" is too generic`,
          severity: 'warning',
          wcag: '2.4.4, 2.4.9'
        });
      }
      
      // Check for links that open in new tab without warning
      if (link.getAttribute('target') === '_blank' && 
          !link.getAttribute('rel')?.includes('noopener') && 
          !linkText.toLowerCase().includes('new tab') && 
          !linkText.toLowerCase().includes('new window') && 
          !link.getAttribute('aria-label')?.toLowerCase().includes('new tab') &&
          !link.getAttribute('aria-label')?.toLowerCase().includes('new window')) {
        issues.push({
          element: link,
          type: 'Link',
          message: 'Link opens in new tab but does not indicate this to the user',
          severity: 'warning',
          wcag: '3.2.1, 3.2.2'
        });
      }
    });
    
    return issues;
  };
  
  /**
   * Check ARIA attributes for accessibility issues
   * 
   * @param {HTMLElement} rootElement Root element to check from
   * @returns {Array} Array of accessibility issues found
   */
  const checkAriaAttributes = (rootElement) => {
    const issues = [];
    
    // List of elements to check
    const elements = rootElement.querySelectorAll('[role], [aria-*]');
    
    elements.forEach(element => {
      // Check for proper use of ARIA roles
      const role = element.getAttribute('role');
      if (role) {
        // Check for valid roles
        const validRoles = [
          'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox', 
          'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog', 
          'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 
          'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu', 
          'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 
          'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 
          'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton', 
          'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 
          'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
        ];
        
        if (!validRoles.includes(role)) {
          issues.push({
            element: element,
            type: 'ARIA',
            message: `Invalid ARIA role: ${role}`,
            severity: 'error',
            wcag: '4.1.2'
          });
        }
        
        // Check for conflicting semantics
        const nodeName = element.nodeName.toLowerCase();
        
        if (nodeName === 'button' && role !== 'button' && role !== 'presentation' && role !== 'none') {
          issues.push({
            element: element,
            type: 'ARIA',
            message: `Button element has conflicting role: ${role}`,
            severity: 'warning',
            wcag: '4.1.2'
          });
        }
        
        if (nodeName === 'a' && role !== 'link' && role !== 'button' && role !== 'presentation' && role !== 'none' && element.hasAttribute('href')) {
          issues.push({
            element: element,
            type: 'ARIA',
            message: `Anchor element has conflicting role: ${role}`,
            severity: 'warning',
            wcag: '4.1.2'
          });
        }
      }
      
      // Check required ARIA attributes for roles
      if (role === 'checkbox' || role === 'switch' || role === 'radio') {
        if (!element.hasAttribute('aria-checked')) {
          issues.push({
            element: element,
            type: 'ARIA',
            message: `Role ${role} requires aria-checked attribute`,
            severity: 'error',
            wcag: '4.1.2'
          });
        }
      }
      
      if (role === 'combobox' || role === 'listbox') {
        if (!element.hasAttribute('aria-expanded')) {
          issues.push({
            element: element,
            type: 'ARIA',
            message: `Role ${role} requires aria-expanded attribute`,
            severity: 'error',
            wcag: '4.1.2'
          });
        }
      }
      
      // Check aria-labelledby references exist
      if (element.hasAttribute('aria-labelledby')) {
        const ids = element.getAttribute('aria-labelledby').split(/\s+/);
        ids.forEach(id => {
          if (!rootElement.querySelector(`#${id}`)) {
            issues.push({
              element: element,
              type: 'ARIA',
              message: `aria-labelledby references non-existent ID: ${id}`,
              severity: 'error',
              wcag: '4.1.2'
            });
          }
        });
      }
      
      // Check aria-controls references exist
      if (element.hasAttribute('aria-controls')) {
        const ids = element.getAttribute('aria-controls').split(/\s+/);
        ids.forEach(id => {
          if (!rootElement.querySelector(`#${id}`)) {
            issues.push({
              element: element,
              type: 'ARIA',
              message: `aria-controls references non-existent ID: ${id}`,
              severity: 'error',
              wcag: '4.1.2'
            });
          }
        });
      }
    });
    
    return issues;
  };
  
  /**
   * Check color contrast for accessibility issues
   * 
   * @param {HTMLElement} rootElement Root element to check from
   * @returns {Array} Array of accessibility issues found
   */
  const checkColorContrast = (rootElement) => {
    // This is a simplified version of contrast checking
    // A comprehensive check would require more complex calculations and analysis of CSS
    
    const issues = [];
    
    // Helper to extract color value
    const getColorValue = (element, property) => {
      const style = window.getComputedStyle(element);
      return style.getPropertyValue(property);
    };
    
    // Helper to calculate relative luminance
    const getLuminance = (color) => {
      // Parse color value
      let r, g, b;
      
      // Handle color in rgb/rgba format
      if (color.startsWith('rgb')) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (match) {
          [, r, g, b] = match.map(Number);
        }
      }
      // Handle color in hex format
      else if (color.startsWith('#')) {
        if (color.length === 4) {
          r = parseInt(color[1] + color[1], 16);
          g = parseInt(color[2] + color[2], 16);
          b = parseInt(color[3] + color[3], 16);
        } else {
          r = parseInt(color.substring(1, 3), 16);
          g = parseInt(color.substring(3, 5), 16);
          b = parseInt(color.substring(5, 7), 16);
        }
      }
      
      // If color parsing failed, return null
      if (r === undefined || g === undefined || b === undefined) {
        return null;
      }
      
      // Calculate luminance
      const sRGB = [r / 255, g / 255, b / 255];
      const RGB = sRGB.map(val => 
        val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      );
      
      return 0.2126 * RGB[0] + 0.7152 * RGB[1] + 0.0722 * RGB[2];
    };
    
    // Helper to calculate contrast ratio
    const getContrastRatio = (luminance1, luminance2) => {
      const lighter = Math.max(luminance1, luminance2);
      const darker = Math.min(luminance1, luminance2);
      return (lighter + 0.05) / (darker + 0.05);
    };
    
    // Check text elements
    const textElements = rootElement.querySelectorAll(
      'p, h1, h2, h3, h4, h5, h6, span, a, button, label, input, select, textarea'
    );
    
    textElements.forEach(element => {
      // Skip hidden elements
      if (element.offsetHeight === 0 || element.offsetWidth === 0) {
        return;
      }
      
      const textColor = getColorValue(element, 'color');
      const bgColor = getColorValue(element, 'background-color');
      
      // Skip if colors can't be determined
      if (!textColor || !bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
        return;
      }
      
      const textLuminance = getLuminance(textColor);
      const bgLuminance = getLuminance(bgColor);
      
      // Skip if luminance couldn't be calculated
      if (textLuminance === null || bgLuminance === null) {
        return;
      }
      
      const contrastRatio = getContrastRatio(textLuminance, bgLuminance);
      
      // Check if the element has large text
      const style = window.getComputedStyle(element);
      const fontSize = parseFloat(style.getPropertyValue('font-size'));
      const isBold = parseInt(style.getPropertyValue('font-weight'), 10) >= 700;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
      
      // WCAG 2.0 Level AA requires a contrast ratio of at least 4.5:1 for normal text
      // and 3:1 for large text
      const minContrast = isLargeText ? 3 : 4.5;
      
      if (contrastRatio < minContrast) {
        issues.push({
          element: element,
          type: 'Contrast',
          message: `Text has insufficient contrast ratio (${contrastRatio.toFixed(2)}:1, required: ${minContrast}:1)`,
          severity: 'warning',
          wcag: '1.4.3'
        });
      }
    });
    
    return issues;
  };
  
  /**
   * Export individual check functions for specific use cases
   */
  export const accessibilityChecks = {
    checkImagesAccessibility,
    checkHeadingsStructure,
    checkFormsAccessibility,
    checkLinksAccessibility,
    checkAriaAttributes,
    checkColorContrast
  };
  
  /**
   * Initialize accessibility checking tools
   * 
   * @param {Object} options Configuration options
   */
  export const initAccessibilityChecker = (options = {}) => {
    const {
      autoCheckOnLoad = false,
      appendResultsPanel = false,
      checkInterval = null, // Set to a number (ms) to enable periodic checking
      ignoredSelectors = [],
      reportCallback = null
    } = options;
    
    // Create a function to run the checks and handle results
    const runChecks = () => {
      const issues = runAccessibilityChecks({
        ...options,
        verbose: true
      });
      
      // Filter out issues for ignored selectors
      const filteredIssues = issues.filter(issue => {
        if (!issue.element) return true;
        
        return !ignoredSelectors.some(selector => {
          if (typeof selector === 'string') {
            return issue.element.matches(selector);
          }
          return false;
        });
      });
      
      // Call the report callback if provided
      if (typeof reportCallback === 'function') {
        reportCallback(filteredIssues);
      }
      
      // Append results panel if enabled
      if (appendResultsPanel) {
        displayAccessibilityPanel(filteredIssues);
      }
      
      return filteredIssues;
    };
    
    // Run checks on page load if enabled
    if (autoCheckOnLoad) {
      // Wait for page to be fully loaded
      if (document.readyState === 'complete') {
        runChecks();
      } else {
        window.addEventListener('load', runChecks);
      }
    }
    
    // Set up interval checking if enabled
    let intervalId = null;
    if (checkInterval && typeof checkInterval === 'number') {
      intervalId = setInterval(runChecks, checkInterval);
    }
    
    // Return control functions
    return {
      runChecks,
      stopChecking: () => {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };
  };
  
  /**
   * Display accessibility issues in a panel
   * 
   * @param {Array} issues Accessibility issues to display
   */
  const displayAccessibilityPanel = (issues) => {
    // Remove existing panel if present
    const existingPanel = document.getElementById('accessibility-issues-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Create panel
    const panel = document.createElement('div');
    panel.id = 'accessibility-issues-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 350px;
      max-height: 400px;
      overflow-y: auto;
      background: white;
      border: 1px solid #ccc;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: sans-serif;
      font-size: 14px;
      padding: 10px;
    `;
    
    // Add header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 10px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = `Accessibility Issues (${issues.length})`;
    title.style.margin = '0';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      margin: 0;
    `;
    closeButton.addEventListener('click', () => panel.remove());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    panel.appendChild(header);
    
    // Add issues
    if (issues.length === 0) {
      const noIssues = document.createElement('p');
      noIssues.textContent = 'No accessibility issues found!';
      noIssues.style.color = 'green';
      panel.appendChild(noIssues);
    } else {
      const issuesList = document.createElement('div');
      
      issues.forEach((issue, index) => {
        const issueItem = document.createElement('div');
        issueItem.style.cssText = `
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
          ${index === issues.length - 1 ? 'border-bottom: none;' : ''}
        `;
        
        const issueTitle = document.createElement('div');
        issueTitle.style.cssText = `
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          color: ${issue.severity === 'error' ? '#d32f2f' : '#f57c00'};
        `;
        
        const issueName = document.createElement('span');
        issueName.textContent = `${issue.type}: ${issue.message}`;
        
        const issueWcag = document.createElement('span');
        issueWcag.textContent = `WCAG ${issue.wcag}`;
        issueWcag.style.fontSize = '12px';
        
        issueTitle.appendChild(issueName);
        issueTitle.appendChild(issueWcag);
        issueItem.appendChild(issueTitle);
        
        if (issue.element) {
          const elementInfo = document.createElement('code');
          elementInfo.style.cssText = `
            display: block;
            margin-top: 5px;
            padding: 5px;
            background: #f5f5f5;
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `;
          
          // Create element summary (tag name and some attributes)
          const tag = issue.element.tagName.toLowerCase();
          const id = issue.element.id ? `id="${issue.element.id}"` : '';
          const className = issue.element.className ? `class="${issue.element.className}"` : '';
          
          // For images, show src
          const src = issue.element.tagName.toLowerCase() === 'img' && issue.element.src
            ? `src="${issue.element.src.substring(0, 30)}${issue.element.src.length > 30 ? '...' : ''}"`
            : '';
            
          elementInfo.textContent = `<${tag} ${id} ${className} ${src}>`;
          
          // Add click to highlight functionality
          elementInfo.style.cursor = 'pointer';
          elementInfo.title = 'Click to highlight element on page';
          elementInfo.addEventListener('click', () => {
            // Remove any existing highlights
            const existing = document.querySelector('.accessibility-highlight');
            if (existing) {
              existing.classList.remove('accessibility-highlight');
              existing.style.outline = null;
            }
            
            // Add highlight to current element
            issue.element.classList.add('accessibility-highlight');
            const originalOutline = issue.element.style.outline;
            issue.element.style.outline = '3px solid red';
            
            // Scroll to element
            issue.element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            
            // Remove highlight after a few seconds
            setTimeout(() => {
              issue.element.classList.remove('accessibility-highlight');
              issue.element.style.outline = originalOutline;
            }, 3000);
          });
          
          issueItem.appendChild(elementInfo);
        }
        
        issuesList.appendChild(issueItem);
      });
      
      panel.appendChild(issuesList);
    }
    
    // Add footer with actions
    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #eee;
    `;
    
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh';
    refreshButton.style.cssText = `
      background: #2196f3;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    `;
    refreshButton.addEventListener('click', () => {
      const newIssues = runAccessibilityChecks({ verbose: true });
      panel.remove();
      displayAccessibilityPanel(newIssues);
    });
    
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Results';
    exportButton.style.cssText = `
      background: #4caf50;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    `;
    exportButton.addEventListener('click', () => {
      // Create a formatted export of the issues
      const exportData = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        issues: issues.map(issue => ({
          type: issue.type,
          message: issue.message,
          severity: issue.severity,
          wcag: issue.wcag,
          element: issue.element ? {
            tagName: issue.element.tagName,
            id: issue.element.id,
            className: issue.element.className,
            textContent: issue.element.textContent ? issue.element.textContent.substring(0, 100) : ''
          } : null
        }))
      };
      
      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `accessibility-report-${new Date().toISOString().substring(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      a.remove();
    });
    
    footer.appendChild(refreshButton);
    footer.appendChild(exportButton);
    panel.appendChild(footer);
    
    // Add to document
    document.body.appendChild(panel);
    
    return panel;
  };