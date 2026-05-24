import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Analyzing ticket context…',
  'Scanning knowledge base…',
  'Reading conversation history…',
  'Crafting the perfect reply…',
  'Polishing the draft…',
];

// Neural network node component
function NeuralNode({ x, y, delay, size = 4 }) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill="url(#nodeGradient)"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.6, 1, 0],
        scale: [0, 1.2, 0.8, 1, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Neural connection line
function NeuralConnection({ x1, y1, x2, y2, delay }) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="url(#lineGradient)"
      strokeWidth={1.5}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: [0, 1, 1, 0],
        opacity: [0, 0.7, 0.7, 0],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Orbiting particle
function OrbitingParticle({ radius, duration, delay, size = 3, color }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      // Position using a wrapper that offsets by the radius
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          boxShadow: `0 0 ${size * 3}px ${color}`,
          top: -radius,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </motion.div>
  );
}

// Sparkle component
function Sparkle({ delay, x, y }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z"
          fill="url(#sparkleGrad)"
        />
        <defs>
          <linearGradient id="sparkleGrad" x1="0" y1="0" x2="12" y2="12">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

export default function AIDraftLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 relative overflow-hidden select-none">
      
      {/* Background ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Sparkles scattered around */}
      <Sparkle delay={0} x="15%" y="20%" />
      <Sparkle delay={0.8} x="80%" y="15%" />
      <Sparkle delay={1.6} x="10%" y="75%" />
      <Sparkle delay={2.2} x="85%" y="70%" />
      <Sparkle delay={0.4} x="50%" y="10%" />
      <Sparkle delay={1.2} x="25%" y="85%" />

      {/* Main orb container */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-6">
        
        {/* Outer ring pulse */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-300/30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-300/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 2.5,
            delay: 0.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        {/* Orbiting particles ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 
                  ? 'linear-gradient(135deg, #818cf8, #6366f1)' 
                  : 'linear-gradient(135deg, #c084fc, #a855f7)',
                boxShadow: i % 2 === 0 
                  ? '0 0 8px rgba(99,102,241,0.6)' 
                  : '0 0 8px rgba(168,85,247,0.6)',
                top: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
                left: `${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [0.8, 1.4, 0.8],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Second orbit ring (opposite direction) */}
        <motion.div
          className="absolute inset-2 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          {[30, 150, 270].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #a5b4fc, #e9d5ff)',
                boxShadow: '0 0 6px rgba(165,180,252,0.5)',
                top: `${50 + 38 * Math.sin((angle * Math.PI) / 180)}%`,
                left: `${50 + 38 * Math.cos((angle * Math.PI) / 180)}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Inner glowing orb */}
        <motion.div
          className="absolute w-20 h-20 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(165,180,252,0.4), rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(165,180,252,0.2)',
          }}
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              '0 0 20px rgba(99,102,241,0.15), inset 0 0 20px rgba(165,180,252,0.1)',
              '0 0 40px rgba(99,102,241,0.3), inset 0 0 30px rgba(165,180,252,0.2)',
              '0 0 20px rgba(99,102,241,0.15), inset 0 0 20px rgba(165,180,252,0.1)',
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Neural network SVG inside the orb */}
        <motion.div
          className="relative z-10"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
            <defs>
              <linearGradient id="nodeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#818cf8" stopOpacity="0.6" />
                <stop offset="1" stopColor="#c084fc" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Connections */}
            <NeuralConnection x1={30} y1={10} x2={15} y2={30} delay={0} />
            <NeuralConnection x1={30} y1={10} x2={45} y2={30} delay={0.3} />
            <NeuralConnection x1={15} y1={30} x2={30} y2={50} delay={0.6} />
            <NeuralConnection x1={45} y1={30} x2={30} y2={50} delay={0.9} />
            <NeuralConnection x1={15} y1={30} x2={45} y2={30} delay={0.2} />
            <NeuralConnection x1={30} y1={10} x2={30} y2={50} delay={1.2} />

            {/* Nodes */}
            <NeuralNode x={30} y={10} delay={0} size={5} />
            <NeuralNode x={15} y={30} delay={0.4} size={4} />
            <NeuralNode x={45} y={30} delay={0.8} size={4} />
            <NeuralNode x={30} y={50} delay={1.2} size={5} />
          </svg>
        </motion.div>
      </div>

      {/* Animated text */}
      <div className="relative h-14 flex flex-col items-center gap-2">
        <motion.h3
          className="text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
          style={{ backgroundSize: '200% 100%' }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          AI is thinking
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            …
          </motion.span>
        </motion.h3>

        {/* Cycling status messages */}
        <div className="h-5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="text-xs text-gray-400 font-medium absolute whitespace-nowrap"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="w-48 h-1 bg-gray-100 rounded-full mt-5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #818cf8, #a855f7, #818cf8)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            width: ['0%', '70%', '40%', '90%', '60%', '100%'],
            backgroundPosition: ['0% 50%', '100% 50%'],
          }}
          transition={{
            width: { duration: 12, ease: 'easeInOut' },
            backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
          }}
        />
      </div>

      {/* Typing indicator dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            animate={{
              y: [0, -6, 0],
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
