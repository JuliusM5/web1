import React from 'react';

/**
 * An accessible text input component
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique ID (required for accessibility)
 * @param {string} props.label - Input label text
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} - Accessible input component
 */
export function AccessibleInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helpText = '',
  disabled = false,
  className = '',
  ...rest
}) {
  // Generate a unique ID for the error message if one exists
  const errorId = error ? `${id}-error` : undefined;
  // Generate a unique ID for the help text if one exists
  const helpTextId = helpText ? `${id}-help` : undefined;
  
  // Combine all the IDs for aria-describedby
  const describedBy = [errorId, helpTextId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`
          w-full p-2 border rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
          ${className}
        `}
        {...rest}
      />
      
      {helpText && (
        <p 
          id={helpTextId} 
          className="mt-1 text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId} 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * An accessible textarea component
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique ID (required for accessibility)
 * @param {string} props.label - Input label text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.rows - Number of rows
 * @returns {React.ReactElement} - Accessible textarea component
 */
export function AccessibleTextarea({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helpText = '',
  disabled = false,
  className = '',
  rows = 4,
  ...rest
}) {
  // Generate a unique ID for the error message if one exists
  const errorId = error ? `${id}-error` : undefined;
  // Generate a unique ID for the help text if one exists
  const helpTextId = helpText ? `${id}-help` : undefined;
  
  // Combine all the IDs for aria-describedby
  const describedBy = [errorId, helpTextId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`
          w-full p-2 border rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
          ${className}
        `}
        {...rest}
      />
      
      {helpText && (
        <p 
          id={helpTextId} 
          className="mt-1 text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId} 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * An accessible select component
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique ID (required for accessibility)
 * @param {string} props.label - Input label text
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Select options
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} - Accessible select component
 */
export function AccessibleSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  required = false,
  error = '',
  helpText = '',
  disabled = false,
  className = '',
  ...rest
}) {
  // Generate a unique ID for the error message if one exists
  const errorId = error ? `${id}-error` : undefined;
  // Generate a unique ID for the help text if one exists
  const helpTextId = helpText ? `${id}-help` : undefined;
  
  // Combine all the IDs for aria-describedby
  const describedBy = [errorId, helpTextId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`
          w-full p-2 border rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
          ${className}
        `}
        {...rest}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {helpText && (
        <p 
          id={helpTextId} 
          className="mt-1 text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId} 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * An accessible checkbox component
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique ID (required for accessibility)
 * @param {string} props.label - Checkbox label text
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} - Accessible checkbox component
 */
export function AccessibleCheckbox({
  id,
  label,
  checked,
  onChange,
  required = false,
  error = '',
  helpText = '',
  disabled = false,
  className = '',
  ...rest
}) {
  // Generate a unique ID for the error message if one exists
  const errorId = error ? `${id}-error` : undefined;
  // Generate a unique ID for the help text if one exists
  const helpTextId = helpText ? `${id}-help` : undefined;
  
  // Combine all the IDs for aria-describedby
  const describedBy = [errorId, helpTextId].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className="mb-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`
              h-4 w-4 rounded border-gray-300 text-blue-600
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
            {...rest}
          />
        </div>
        <div className="ml-3 text-sm">
          <label 
            htmlFor={id}
            className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-700'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {helpText && (
            <p 
              id={helpTextId} 
              className="text-gray-500"
            >
              {helpText}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <p 
          id={errorId} 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * An accessible radio group component
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Radio group name (required)
 * @param {string} props.legend - Group label text
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Radio options
 * @param {boolean} props.required - Whether selection is required
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {boolean} props.disabled - Whether group is disabled
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} - Accessible radio group component
 */
export function AccessibleRadioGroup({
  name,
  legend,
  value,
  onChange,
  options = [],
  required = false,
  error = '',
  helpText = '',
  disabled = false,
  className = '',
  ...rest
}) {
  // Generate a unique ID for the error message if one exists
  const errorId = error ? `${name}-error` : undefined;
  // Generate a unique ID for the help text if one exists
  const helpTextId = helpText ? `${name}-help` : undefined;
  
  return (
    <fieldset className={`mb-4 ${className}`} {...rest}>
      <legend className="text-sm font-medium text-gray-700">
        {legend}
        {required && <span className="text-red-500 ml-1">*</span>}
      </legend>
      
      {helpText && (
        <p 
          id={helpTextId} 
          className="mt-1 text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
      
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={disabled || option.disabled}
              required={required}
              aria-invalid={!!error}
              aria-describedby={errorId}
              className={`
                h-4 w-4 border-gray-300 text-blue-600
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={`ml-3 text-sm font-medium ${
                disabled || option.disabled ? 'text-gray-500' : 'text-gray-700'
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      {error && (
        <p 
          id={errorId} 
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}