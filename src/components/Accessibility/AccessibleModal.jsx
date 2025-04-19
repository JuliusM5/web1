import React, { useEffect, useRef } from 'react';
import { createFocusTrap, generateUniqueId } from '../../utils/accessibilityUtils';
import AccessibleButton from './AccessibleButton';

/**
 * Accessible modal component with focus management and keyboard navigation
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal should close
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size ('small', 'medium', 'large', 'full')
 * @param {boolean} props.showCloseButton - Whether to show the close button
 * @param {boolean} props.closeOnBackdropClick - Whether clicking outside should close the modal
 * @param {boolean} props.closeOnEscape - Whether pressing Escape should close the modal
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement|null} - Modal component or null if closed
 */
function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) {
  const modalRef = useRef(null);
  const headingId = useRef(generateUniqueId('modal-title')).current;
  const descriptionId = useRef(generateUniqueId('modal-desc')).current;
  
  // Setup focus trap when modal is opened
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    // Save previous active element to restore focus later
    const previousActiveElement = document.activeElement;
    
    // Create the focus trap
    const removeFocusTrap = createFocusTrap(modalRef.current);
    
    // Handle escape key
    const handleKeyDown = (event) => {
      if (closeOnEscape && event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    
    // Add event listener for escape key
    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent scrolling on body while modal is open
    document.body.style.overflow = 'hidden';
    
    // Clean up function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      removeFocusTrap();
      
      // Restore focus to the element that was focused before the modal opened
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, closeOnEscape, onClose]);
  
  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  
  // Don't render anything if the modal is closed
  if (!isOpen) return null;
  
  // Determine the size class
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      {/* Modal content */}
      <div className="flex min-h-screen items-end justify-center p-4 sm:items-center sm:p-0">
        <div
          ref={modalRef}
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all ${sizeClass} w-full ${className}`}
        >
          {/* Modal header */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h2 id={headingId} className="text-lg font-medium text-gray-900">
              {title}
            </h2>
            
            {showCloseButton && (
              <AccessibleButton
                onClick={onClose}
                variant="secondary"
                size="small"
                ariaLabel="Close modal"
                className="!p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </AccessibleButton>
            )}
          </div>
          
          {/* Modal body */}
          <div id={descriptionId} className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessibleModal;