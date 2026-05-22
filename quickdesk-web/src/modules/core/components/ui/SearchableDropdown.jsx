import { useState, useRef, useEffect, useMemo } from 'react';

export default function SearchableDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Search...',
  label,
  error,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listboxRef = useRef(null);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index when search changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(-1);
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const selectOption = (option) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listboxRef.current) {
      const activeElement = listboxRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`w-full relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div 
        className="relative"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`
            w-full bg-white border rounded-lg pl-9 pr-10 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors
            ${error ? 'border-red-300 placeholder-red-300' : 'border-gray-300 placeholder-gray-400'}
          `}
          placeholder={selectedOption && !isOpen ? selectedOption.label : placeholder}
          value={isOpen ? searchTerm : ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (!isOpen) inputRef.current?.focus();
        }}>
          <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div 
          ref={listboxRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          {filteredOptions.length === 0 ? (
            <div className="text-gray-500 px-4 py-3 text-sm text-center">No matches found</div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`
                  cursor-pointer select-none relative py-2 pl-3.5 pr-9 transition-colors
                  ${activeIndex === index ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'}
                  ${option.value === value ? 'font-medium' : 'font-normal'}
                `}
              >
                <span className="block truncate">{option.label}</span>
                {option.value === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
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
