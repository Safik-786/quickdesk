import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import slide1 from '../../../assets/auth/slide1.png';
import slide2 from '../../../assets/auth/slide2.png';
import slide3 from '../../../assets/auth/slide3.png';
import logo from '../../../assets/logos/logo.jpeg';

const slides = [
  {
    id: 1,
    image: slide1,
    title: 'Data-Driven Decisions',
    description: 'Transform your customer support with powerful, real-time analytics.'
  },
  {
    id: 2,
    image: slide2,
    title: 'Seamless Collaboration',
    description: 'Bring your entire team together in one unified, intelligent workspace.'
  },
  {
    id: 3,
    image: slide3,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and advanced RBAC to keep your data safe.'
  }
];

export default function AuthLayout({ children }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen bg-blue-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[100%]">
        
        {/* Left Side: Image Slider (hidden on small screens) */}
        <div className="hidden md:flex md:w-1/2 relative bg-gray-900 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={slides[currentSlide].image} 
                alt="Presentation" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-gray-900/10" />
            </motion.div>
          </AnimatePresence>

          {/* Logo overlay */}
          <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-lg p-1">
              <img src={logo} alt="QuickDesk" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              QuickDesk
            </span>
          </div>

          {/* Text Overlay */}
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-4xl font-bold text-white mb-4">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-lg text-gray-300 max-w-md">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Pagination dots */}
            <div className="flex gap-2 mt-8">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    currentSlide === idx ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col justify-center bg-white relative">
          <div className="w-full max-w-md overflow-auto mx-auto">
            {/* Mobile Logo (visible only on small screens) */}
            <div className="md:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm p-1 bg-blue-50 border border-blue-100">
                <img src={logo} alt="QuickDesk" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold text-blue-900 tracking-tight">
                QuickDesk
              </span>
            </div>

            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
