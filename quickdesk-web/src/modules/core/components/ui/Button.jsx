import { forwardRef } from 'react';

const variantClasses = {
  primary: 'bg-white hover:bg-blue-50 text-blue-800 border-transparent shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700  shadow',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  className = '', 
  iconLeft, 
  iconRight, 
  ...props 
}, ref) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        inline-flex items-center active:scale-98 hover:scale-102 justify-center font-medium rounded-lg transition-all duration-300 
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!isLoading && iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {!isLoading && iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
