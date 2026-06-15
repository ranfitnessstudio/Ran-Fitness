"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface EquipmentSvgProps {
  name: string;
  className?: string;
  isHovered?: boolean;
}

export const EquipmentSvg: React.FC<EquipmentSvgProps> = ({ name, className = '', isHovered = false }) => {
  const yellow = '#FACC15';
  const darkGray = '#18181B';
  const lightGray = '#71717A';
  const white = '#FFFFFF';

  // Dumbbell SVG
  if (name === 'dumbbell') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        <motion.g
          animate={isHovered ? { rotate: [0, -15, 15, 0], y: [0, -5, 0] } : {}}
          transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 50%" }}
        >
          {/* Bar */}
          <rect x="25" y="47.5" width="50" height="5" rx="1" fill={lightGray} />
          {/* Weights Left */}
          <rect x="35" y="35" width="4" height="30" rx="1" fill={yellow} />
          <rect x="30" y="38" width="4" height="24" rx="1" fill="#CA8A04" />
          <rect x="25" y="41" width="4" height="18" rx="1" fill={lightGray} />
          {/* Weights Right */}
          <rect x="61" y="35" width="4" height="30" rx="1" fill={yellow} />
          <rect x="66" y="38" width="4" height="24" rx="1" fill="#CA8A04" />
          <rect x="71" y="41" width="4" height="18" rx="1" fill={lightGray} />
          {/* Collars */}
          <rect x="39" y="45" width="2" height="10" rx="0.5" fill={white} />
          <rect x="59" y="45" width="2" height="10" rx="0.5" fill={white} />
        </motion.g>
      </svg>
    );
  }

  // Barbell SVG
  if (name === 'barbell') {
    return (
      <svg viewBox="0 0 120 100" className={`w-full h-full ${className}`}>
        <motion.g
          animate={isHovered ? { y: [0, -10, 0] } : {}}
          transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
          style={{ transformOrigin: "60% 50%" }}
        >
          {/* Long Bar */}
          <rect x="10" y="48.5" width="100" height="3" fill={lightGray} />
          {/* Sleeves */}
          <rect x="15" y="47" width="12" height="6" fill={white} />
          <rect x="93" y="47" width="12" height="6" fill={white} />
          {/* Inner Collars */}
          <circle cx="27" cy="50" r="6" fill={yellow} />
          <circle cx="93" cy="50" r="6" fill={yellow} />
          {/* Plate Stacks Left */}
          <rect x="29" y="25" width="4" height="50" rx="1" fill={yellow} />
          <rect x="34" y="28" width="3" height="44" rx="1" fill={lightGray} />
          <rect x="38" y="32" width="3" height="36" rx="1" fill={darkGray} />
          {/* Plate Stacks Right */}
          <rect x="87" y="25" width="4" height="50" rx="1" fill={yellow} />
          <rect x="83" y="28" width="3" height="44" rx="1" fill={lightGray} />
          <rect x="79" y="32" width="3" height="36" rx="1" fill={darkGray} />
        </motion.g>
      </svg>
    );
  }

  // Weight Plate SVG
  if (name === 'weightplate') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        <motion.g
          animate={isHovered ? { rotate: 360 } : {}}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50% 50%" }}
        >
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="42" fill={darkGray} stroke={yellow} strokeWidth="2" />
          <circle cx="50" cy="50" r="36" fill="none" stroke={lightGray} strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Ridges */}
          <path d="M50 8 L50 14 M50 86 L50 92 M8 50 L14 50 M86 50 L92 50" stroke={lightGray} strokeWidth="2" />
          
          {/* Center Ring */}
          <circle cx="50" cy="50" r="12" fill="#27272A" />
          <circle cx="50" cy="50" r="8" fill="#52525B" />
          <circle cx="50" cy="50" r="5" fill="#09090B" />
          
          {/* Text labels */}
          <text x="50" y="28" fill={white} fontSize="8" fontWeight="bold" textAnchor="middle">25</text>
          <text x="50" y="78" fill={white} fontSize="8" fontWeight="bold" textAnchor="middle">KG</text>
        </motion.g>
      </svg>
    );
  }

  // Smith Machine SVG
  if (name === 'smithmachine') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Frame */}
        <rect x="20" y="15" width="6" height="75" fill={darkGray} />
        <rect x="74" y="15" width="6" height="75" fill={darkGray} />
        <rect x="20" y="15" width="60" height="6" fill={darkGray} />
        <rect x="15" y="85" width="70" height="5" fill={lightGray} />
        
        {/* Guide Rails */}
        <line x1="28" y1="20" x2="28" y2="85" stroke={white} strokeWidth="1.5" />
        <line x1="72" y1="20" x2="72" y2="85" stroke={white} strokeWidth="1.5" />
        
        {/* Guided Barbell */}
        <motion.g
          animate={isHovered ? { y: [0, 45, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Bar */}
          <rect x="12" y="32" width="76" height="2" fill={white} />
          {/* Guide sliders */}
          <rect x="26" y="29" width="4" height="8" fill={yellow} />
          <rect x="70" y="29" width="4" height="8" fill={yellow} />
          {/* Weights */}
          <rect x="15" y="26" width="6" height="14" rx="0.5" fill={yellow} />
          <rect x="79" y="26" width="6" height="14" rx="0.5" fill={yellow} />
        </motion.g>
      </svg>
    );
  }

  // Bench Press SVG
  if (name === 'benchpress') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Upright Racks */}
        <rect x="35" y="35" width="4" height="50" fill={darkGray} />
        <rect x="61" y="35" width="4" height="50" fill={darkGray} />
        <path d="M30 35 H44 M56 35 H70" stroke={lightGray} strokeWidth="3" />
        
        {/* Flat Bench */}
        <rect x="15" y="60" width="70" height="5" rx="1" fill={yellow} />
        <rect x="22" y="65" width="4" height="20" fill={darkGray} />
        <rect x="74" y="65" width="4" height="20" fill={darkGray} />
        <rect x="15" y="82" width="70" height="3" fill={lightGray} />

        {/* Barbell sitting on racks */}
        <motion.g
          animate={isHovered ? { y: [0, -15, 0], x: [0, 2, 0] } : {}}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Bar */}
          <rect x="22" y="29" width="56" height="2" fill={white} />
          {/* Weights */}
          <rect x="27" y="23" width="4" height="14" rx="0.5" fill={yellow} />
          <rect x="69" y="23" width="4" height="14" rx="0.5" fill={yellow} />
        </motion.g>
      </svg>
    );
  }

  // Cable Crossover SVG
  if (name === 'cablecrossover') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Frame */}
        <path d="M15 85 V15 H85 V85" fill="none" stroke={darkGray} strokeWidth="6" strokeLinecap="round" />
        <rect x="10" y="85" width="80" height="5" fill={lightGray} />

        {/* Weights stacks inside columns */}
        <rect x="17" y="55" width="6" height="25" fill="#27272A" />
        <rect x="77" y="55" width="6" height="25" fill="#27272A" />

        {/* Pull Pulleys */}
        <circle cx="20" cy="30" r="3" fill={yellow} />
        <circle cx="80" cy="30" r="3" fill={yellow} />

        {/* Cables and Handles */}
        <motion.g
          animate={isHovered ? { y: [0, 15, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Left Cable */}
          <line x1="20" y1="30" x2="32" y2="45" stroke={white} strokeWidth="1" />
          <circle cx="32" cy="45" r="2" fill={white} />
          <path d="M 29 48 Q 32 46 35 48" fill="none" stroke={yellow} strokeWidth="1.5" />
          
          {/* Right Cable */}
          <line x1="80" y1="30" x2="68" y2="45" stroke={white} strokeWidth="1" />
          <circle cx="68" cy="45" r="2" fill={white} />
          <path d="M 65 48 Q 68 46 71 48" fill="none" stroke={yellow} strokeWidth="1.5" />
        </motion.g>
      </svg>
    );
  }

  // Treadmill SVG
  if (name === 'treadmill') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Frame / Base */}
        <polygon points="15,80 85,80 75,70 15,70" fill={darkGray} />
        
        {/* Running Belt */}
        <rect x="20" y="72" width="50" height="6" fill="#09090B" />
        {/* Moving arrows on belt */}
        <motion.g
          animate={isHovered ? { x: [-10, 10] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        >
          <path d="M25 75 L30 75 M40 75 L45 75 M55 75 L60 75" stroke={yellow} strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* Columns & Console */}
        <path d="M20 70 L35 35 H45" fill="none" stroke={lightGray} strokeWidth="4" strokeLinecap="round" />
        <rect x="42" y="28" width="12" height="8" rx="1" fill={darkGray} stroke={yellow} strokeWidth="1" />
        <rect x="44" y="30" width="8" height="4" fill="#1e1e1e" />

        {/* Handrails */}
        <line x1="32" y1="42" x2="52" y2="42" stroke={darkGray} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Cross Trainer (Elliptical) SVG
  if (name === 'crosstrainer') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Base */}
        <rect x="15" y="80" width="70" height="5" rx="1" fill={darkGray} />
        {/* Flywheel cover */}
        <circle cx="70" cy="70" r="12" fill={darkGray} stroke={lightGray} strokeWidth="2" />
        
        {/* Animated Pedals & Arms */}
        <motion.g
          animate={isHovered ? { rotate: 360 } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "70% 70%" }}
        >
          {/* Connecting Crank */}
          <line x1="70" y1="70" x2="60" y2="62" stroke={white} strokeWidth="3" />
          <circle cx="60" cy="62" r="3" fill={yellow} />
        </motion.g>

        {/* Static Columns & Screen */}
        <path d="M45 80 L50 30 H55" fill="none" stroke={lightGray} strokeWidth="3" />
        <rect x="52" y="24" width="8" height="7" fill={darkGray} stroke={yellow} strokeWidth="1" />

        {/* Foot pedal linkages */}
        <motion.g
          animate={isHovered ? { y: [-4, 4, -4], x: [-2, 2, -2] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="25" y="72" width="25" height="4" rx="1" fill={yellow} />
          {/* Vertical handlebar linked */}
          <line x1="45" y1="72" x2="35" y2="20" stroke={darkGray} strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>
      </svg>
    );
  }

  // Exercise Bike SVG
  if (name === 'exercisebike') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Base frame */}
        <path d="M25 80 H75 M35 80 L45 45 L65 70 M55 80 L45 45 M65 80 L65 70" stroke={darkGray} strokeWidth="4" strokeLinecap="round" />
        
        {/* Flywheel front */}
        <motion.g
          animate={isHovered ? { rotate: 360 } : {}}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "30% 70%" }}
        >
          <circle cx="30" cy="70" r="12" fill={darkGray} stroke={yellow} strokeWidth="2" />
          <line x1="30" y1="58" x2="30" y2="82" stroke={white} strokeWidth="1" />
          <line x1="18" y1="70" x2="42" y2="70" stroke={white} strokeWidth="1" />
        </motion.g>

        {/* Seat post & Seat */}
        <line x1="60" y1="70" x2="68" y2="40" stroke={darkGray} strokeWidth="3" />
        <polygon points="63,38 75,38 72,42 63,42" fill={yellow} />

        {/* Handlebars */}
        <path d="M45 45 L42 28 H36" fill="none" stroke={lightGray} strokeWidth="3" strokeLinecap="round" />
        <circle cx="45" cy="45" r="4" fill={darkGray} />

        {/* Pedals */}
        <motion.g
          animate={isHovered ? { rotate: -360 } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "52% 58%" }}
        >
          <line x1="52" y1="58" x2="52" y2="46" stroke={white} strokeWidth="2.5" />
          <rect x="48" y="44" width="8" height="3" fill={yellow} />
          
          <line x1="52" y1="58" x2="52" y2="70" stroke={white} strokeWidth="2.5" />
          <rect x="48" y="69" width="8" height="3" fill={yellow} />
        </motion.g>
      </svg>
    );
  }

  // Stair Climber SVG
  if (name === 'stairclimber') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Base frame side profile */}
        <polygon points="20,85 80,85 75,35 60,35" fill={darkGray} />
        
        {/* Steps */}
        <motion.g
          animate={isHovered ? { y: [0, 8, 0], x: [0, -6, 0] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        >
          {/* Stair 1 */}
          <path d="M 35 75 H 47 V 67 H 59 V 59 H 71 V 51 H 80" fill="none" stroke={yellow} strokeWidth="3" />
        </motion.g>

        {/* Handrails */}
        <path d="M 25 80 L 55 25 H 68" fill="none" stroke={lightGray} strokeWidth="3" strokeLinecap="round" />
        {/* Console screen */}
        <rect x="64" y="18" width="10" height="8" rx="1" fill={darkGray} stroke={yellow} strokeWidth="1" />
      </svg>
    );
  }

  // Battle Ropes SVG
  if (name === 'battleropes') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Anchor point */}
        <circle cx="10" cy="50" r="5" fill={darkGray} />
        <circle cx="10" cy="50" r="2" fill={yellow} />

        {/* Wavy Ropes */}
        <motion.path
          d="M 10 50 Q 30 25 50 50 T 90 50"
          fill="none"
          stroke={yellow}
          strokeWidth="3.5"
          strokeLinecap="round"
          animate={isHovered ? {
            d: [
              "M 10 50 Q 30 25 50 50 T 90 50",
              "M 10 50 Q 30 75 50 50 T 90 50",
              "M 10 50 Q 30 25 50 50 T 90 50"
            ]
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.path
          d="M 10 50 Q 30 65 50 50 T 90 60"
          fill="none"
          stroke={lightGray}
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={isHovered ? {
            d: [
              "M 10 50 Q 30 65 50 50 T 90 60",
              "M 10 50 Q 30 15 50 50 T 90 40",
              "M 10 50 Q 30 65 50 50 T 90 60"
            ]
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        
        {/* Hand grips */}
        <rect x="88" y="47" width="6" height="6" rx="1" fill={white} />
        <rect x="88" y="57" width="6" height="6" rx="1" fill={white} />
      </svg>
    );
  }

  // Kettlebell SVG
  if (name === 'kettlebell') {
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        <motion.g
          animate={isHovered ? { rotate: [0, -10, 10, -10, 0], y: [0, -8, 0] } : {}}
          transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 30%" }}
        >
          {/* Kettlebell Bell (round bottom) */}
          <circle cx="50" cy="62" r="26" fill={darkGray} stroke={yellow} strokeWidth="3" />
          {/* Text inside */}
          <text x="50" y="68" fill={white} fontSize="14" fontWeight="black" textAnchor="middle">24</text>
          
          {/* Kettlebell Handle (arched top) */}
          <path d="M32 46 C32 24 68 24 68 46" fill="none" stroke={darkGray} strokeWidth="8" strokeLinecap="round" />
          <path d="M32 46 C32 26 68 26 68 46" fill="none" stroke={lightGray} strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </svg>
    );
  }

  // Default fallback (Simple generic icon)
  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
      <circle cx="50" cy="50" r="40" fill={darkGray} stroke={yellow} strokeWidth="2" />
      <path d="M35 50 H65 M50 35 V65" stroke={white} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};
