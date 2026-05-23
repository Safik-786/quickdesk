import { motion } from 'framer-motion';

export default function PageHeader({ title, description, className = '' }) {
  return (
    <div className={`mb-8 ${className}`}>
      <motion.h1 
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-900 via-gray-700 to-gray-900 tracking-tight"
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p 
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="text-gray-500 mt-2 text-xs font-medium max-w-2xl leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
