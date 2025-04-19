import React from 'react';

/**
 * An accessible button component that enforces good practices
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - Button style variant
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.ariaLabel - Accessible label
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type
 * @param {Object} props.rest - Other props to spread
 * @returns {React.ReactElement} - Accessible button component
 */
function AccessibleButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  ariaLabel,
  className = '',
  type = 'button',
  ...rest
}) {
  // Base classes for all buttons
  const baseClasses = 'rounded focus:outline-none focus:ring-2 transition-colors';
  
  // Variant-specific classes
  const variantClasses = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    secondary: `bg-gray-200 hover:bg-gray-300 text-gray-800 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    danger: `bg-red-600 hover:bg-red-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    success: `bg-green-600 hover:bg-green-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    warning: `bg-yellow-500 hover:bg-yellow-600 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    outline: `bg-transparent border border-current hover:bg-gray-100 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    link: `bg-transparent text-blue-600 hover:text-blue-800 hover:underline p-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  };
  
  // Size classes - default is medium
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };
  
  // Default to medium size unless specified in className
  const size = rest.size || 'medium';
  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClass} ${className}`;
  
  // Focus ring color based on variant
  const ringColorClasses = {
    primary: 'focus:ring-blue-300',
    secondary: 'focus:ring-gray-300',
    danger: 'focus:ring-red-300',
    success: 'focus:ring-green-300',
    warning: 'focus:ring-yellow-300',
    outline: 'focus:ring-gray-300',
    link: 'focus:ring-blue-300'
  };
  
  const finalClasses = `${buttonClasses} ${ringColorClasses[variant] || ringColorClasses.primary}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClasses}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </button>
  );
}

export default AccessibleButton;