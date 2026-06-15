"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface LoaderProps {
  onComplete?: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress counting up
    const duration = 2400; // 2.4s loading
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 400); // Small delay before fading out
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] text-white"
        >
          {/* Logo & Animated Rings Container */}
          <div className="relative mb-6 flex items-center justify-center h-48 w-full select-none">
            {/* Pulsing Outer Glow Circle */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                borderColor: ['rgba(250, 204, 21, 0.2)', 'rgba(250, 204, 21, 0.6)', 'rgba(250, 204, 21, 0.2)'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute h-40 w-40 rounded-full border border-yellow-400/30"
            />
            
            {/* Center ONLY the horizontal RAN-FITNESS wordmark */}
            <motion.div
              animate={{
                scale: [0.95, 1, 0.95],
              }}
              transition={{
                duration: 2.0,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative z-10 flex items-center justify-center font-display font-black italic tracking-widest uppercase text-center select-none
                         w-[180px] sm:w-[220px] md:w-[300px] text-2xl sm:text-3xl md:text-4xl"
            >
              <span className="text-white">RAN</span>
              <span className="text-yellow-400 font-light mx-1 sm:mx-1.5">-</span>
              <span className="text-white">FITNESS</span>
            </motion.div>
          </div>

          {/* Loader Text / Official Full Logo */}
          <div className="text-center">
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-2 text-xs font-mono uppercase tracking-widest text-yellow-400"
            >
              Loading Power ({Math.round(progress)}%)
            </motion.p>
          </div>

          {/* Progress Bar Container */}
          <div className="mt-8 h-[2px] w-48 overflow-hidden rounded bg-zinc-800">
            <motion.div
              className="h-full bg-yellow-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
