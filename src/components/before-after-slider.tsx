"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After Transformation',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 cursor-ew-resize @container"
    >
      {/* Before Image (Full Width background) */}
      <img
        src={beforeImage}
        alt="Before Fitness"
        className="absolute inset-0 h-full w-full object-cover grayscale"
        draggable={false}
      />
      {/* Before Label */}
      <span className="absolute bottom-4 left-4 rounded-md bg-black/60 px-3 py-1 text-xs uppercase tracking-widest text-zinc-400 font-bold border border-zinc-800">
        {beforeLabel}
      </span>

      {/* After Image (Overlaid, width clipped by sliderPosition) */}
      <div
        className="absolute inset-0 h-full overflow-hidden transition-all duration-75"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={afterImage}
          alt="After Fitness"
          className="absolute inset-0 h-full object-cover"
          style={{ width: '100cqw', height: '100%' }}
          draggable={false}
        />
        {/* After Label */}
        <span className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-md bg-yellow-400/90 px-3 py-1 text-xs uppercase tracking-widest text-black font-extrabold border border-yellow-500">
          <Sparkles size={12} className="fill-black" />
          {afterLabel}
        </span>
      </div>

      {/* Slider Bar & Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 w-[3px] -ml-[1.5px] bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Central Drag handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-yellow-400 bg-white dark:bg-zinc-950 shadow-lg text-yellow-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};
