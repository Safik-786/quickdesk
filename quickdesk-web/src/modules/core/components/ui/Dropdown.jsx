import { useState, useRef, useEffect } from 'react';

export default function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  wrapperClassName = '',
  labelClassName = '',
  optionClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`w-full relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className={`bg-blue-50 p-1 rounded-xl ${wrapperClassName}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
          relative w-full bg-white border rounded-lg pl-3.5 pr-10 py-1 text-left cursor-default 
          focus:outline-none cursor-pointer focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-[12px] transition-colors
          ${error ? 'border-red-300 text-red-900 focus:ring-red-500' : 'border-slate-200'}
          ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
          ${buttonClassName}
        `}
        >
          <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
            <svg className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>

      {isOpen && (
        <div className={`absolute z-10 mt-1 border border-slate-200 w-full bg-white shadow max-h-60 rounded-lg py-1 text-base ring-opacity-5 overflow-auto focus:outline-none sm:text-sm ${menuClassName}`}>
          {options.length === 0 ? (
            <div className="text-gray-500 px-4 py-2 text-sm">No options available</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  cursor-pointer select-none relative py-2 pl-3.5 pr-9 hover:bg-blue-50 hover:text-blue-900 transition-colors
                  ${option.value === value ? 'bg-blue-50 font-medium text-blue-900' : 'text-gray-900 font-normal'}
                  ${optionClassName}
                `}
              >
                <span className="block truncate">{option.label}</span>
                {option.value === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
