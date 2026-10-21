import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Stage 1: Icon entrance (0s - 0.8s)
    // Stage 2: Brand text reveal (0.8s - 2.2s)
    // Stage 3: Fade out / complete (2.2s - 2.6s)
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => onFinish(), 2600)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0B1224] flex flex-col items-center justify-center overflow-hidden">
      {/* Soft Background Blobs matching the reference style */}
      <div className="absolute top-[-20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#FEF3C7]/40 dark:bg-[#FEF3C7]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#E0E7FF]/40 dark:bg-[#E0E7FF]/5 blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col items-center">
        {/* Animated App Logo Wrapper */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            type: 'spring',
            damping: 15,
            stiffness: 120,
            duration: 0.9 
          }}
          className="relative mb-6"
        >
          {/* Outer Ring Ambient Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-emerald-500/20 rounded-[32px] blur-md -z-10"
          />
          
          {/* Logo container */}
          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[28px] shadow-medium flex items-center justify-center p-4 border border-[#E8EDF4] dark:border-slate-700">
            <img 
              src="/logo.png" 
              alt="Willow Wallet Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Brand Typography Entrance */}
        <div className="h-16 text-center overflow-hidden flex flex-col justify-start items-center">
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -25, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col items-center"
              >
                <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-slate-100 flex items-center gap-1.5">
                  WillowWallet <span className="text-[#10B981] text-xs font-bold px-1.5 py-0.5 rounded-full bg-[#10B981]/15">v2</span>
                </h1>
                <p className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 mt-1 uppercase tracking-widest">
                  Kelola Keuangan dengan Bijak
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading Micro-Indicator */}
        <div className="absolute bottom-16 flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  backgroundColor: ['#E5E7EB', '#10B981', '#E5E7EB']
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
                className="w-2.5 h-2.5 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
