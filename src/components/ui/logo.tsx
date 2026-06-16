import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'symbol' | 'badge-light' | 'badge-dark';
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size,
  variant = 'full',
  animated = false,
}) => {
  // New brand standard: [Circular Icon] (cropped) + [Wordmark] (15-20% smaller)
  
  // Dynamic styles if size is provided (e.g. for footer or sidebar)
  const iconStyle = size 
    ? { width: size, height: size }
    : {};
    
  const fontStyle = size 
    ? { fontSize: `${Math.round(size * 0.55)}px` }
    : {};

  return (
    <div 
      className={`select-none flex flex-row items-center gap-3 whitespace-nowrap leading-none transition-all duration-300 ${
        animated ? 'animate-pulse' : ''
      } ${className}`}
    >
      {/* Circular Brand Icon (Cropped perfectly by scale-[1.12]) */}
      <div 
        className="relative w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] lg:w-[52px] lg:h-[52px] xl:w-[60px] xl:h-[60px] 2xl:w-[64px] 2xl:h-[64px] flex-shrink-0 rounded-full overflow-hidden border border-yellow-400/20 bg-black"
        style={iconStyle}
      >
        <Image
          src="/images/logo_circular_rebrand.png"
          alt="RAN Fitness Circular Badge"
          fill
          priority
          className="object-cover scale-[1.12] rounded-full"
        />
      </div>

      {/* Horizontal Wordmark (Responsive sizing) */}
      <div 
        className="font-display font-black italic tracking-widest uppercase text-[18px] sm:text-xl md:text-2xl lg:text-[24px] xl:text-[28px] 2xl:text-[34px]"
        style={fontStyle}
      >
        {/* Light mode: RAN (black), - (yellow), FITNESS (black) */}
        {/* Dark mode: RAN (white), - (yellow), FITNESS (white) */}
        <span className="text-zinc-900 dark:text-white">RAN</span>
        <span className="text-yellow-500 dark:text-yellow-400 font-light mx-1 sm:mx-1.5">-</span>
        <span className="text-zinc-900 dark:text-white">FITNESS</span>
      </div>
    </div>
  );
};
