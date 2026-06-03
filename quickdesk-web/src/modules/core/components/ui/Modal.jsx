import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
  showCloseIcon = true
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`relative flex flex-col max-h-[90vh] bg-white rounded-2xl shadow-xl w-full ${maxWidth} transform transition-all overflow-hidden scale-100 opacity-100`}
      >
        {/* Fixed Header */}
        {(title || showCloseIcon) && (
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10 bg-white">
            {title && <h3 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h3>}
            {showCloseIcon && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl z-10">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
