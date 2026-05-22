import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  iconLeft,
  iconRight,
  helperText,
  id,
  className = '',
  rows,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);
  const isTextarea = rows != null;
  const fieldClassName = `
    block w-full rounded-lg text-sm transition-colors border
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${iconLeft && !isTextarea ? 'pl-10' : 'pl-3.5'}
    ${iconRight && !isTextarea ? 'pr-10' : 'pr-3.5'}
    ${isTextarea ? 'py-3' : 'py-2.5'}
    ${error
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 placeholder-red-300'
      : 'border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 bg-white'
    }
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && !isTextarea && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {iconLeft}
          </div>
        )}
        {isTextarea ? (
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            className={fieldClassName}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            className={fieldClassName}
            {...props}
          />
        )}
        {iconRight && !isTextarea && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            {iconRight}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
