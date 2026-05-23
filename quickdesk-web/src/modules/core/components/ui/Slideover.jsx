import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import logoSrc from '../../../../assets/logos/logo.jpeg';

export default function Slideover({ 
  isOpen, 
  onClose, 
  title, 
  children,
  primaryBtnText,
  onPrimaryClick,
  primaryBtnLoading = false,
  primaryBtnType = 'button',
  secondaryBtnText,
  onSecondaryClick
}) {
  const panelRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    // Add event listener with a slight delay to prevent immediate firing
    // if the button that opened it also triggers this
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Slideover Panel */}
          <motion.div 
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-screen md:w-[40vw] flex h-full flex-col bg-white shadow-2xl pointer-events-auto border-l border-gray-200"
          >
              {/* Header */}
              <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center space-x-3">
                  {/* Logo Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {title}
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 px-6 py-6 overflow-y-auto custom-scrollbar">
                {children}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur flex justify-end gap-3 z-10">
                {secondaryBtnText && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onSecondaryClick || onClose}
                  >
                    {secondaryBtnText}
                  </Button>
                )}
                {primaryBtnText && (
                  <Button
                    type={primaryBtnType}
                    isLoading={primaryBtnLoading}
                    onClick={onPrimaryClick}
                  >
                    {primaryBtnText}
                  </Button>
                )}
              </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
