import { useEffect } from 'react';
import logoSrc from '../../../assets/logos/logo.jpeg';

export default function SlideOver({
  isOpen,
  onClose,
  title,
  children,
  footerButtons = [],
}) {
  // Prevent body scroll when SlideOver is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* SlideOver */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-xl flex flex-col bg-white transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
              <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white flex items-center justify-end gap-3">
          {footerButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                btn.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
