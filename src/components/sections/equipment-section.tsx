"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Equipment } from '@/lib/database';
import { EquipmentSvg } from '@/components/ui/equipment-svgs';

interface EquipmentSectionProps {
  equipment: Equipment[];
}

export default function EquipmentSection({ equipment }: EquipmentSectionProps) {
  const [equipmentFilter, setEquipmentFilter] = useState<'All' | 'Strength' | 'Cardio' | 'Functional'>('All');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter equipment based on category
  const filteredEquipment = equipment.filter(eq => {
    if (equipmentFilter === 'All') return true;
    return eq.category.toLowerCase() === equipmentFilter.toLowerCase();
  });

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [equipmentFilter]);

  const handleNext = () => {
    if (currentIndex < filteredEquipment.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  return (
    <section id="equipment" className="py-12 lg:py-28 bg-zinc-100/50 dark:bg-zinc-950/20 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header and Filter Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 lg:mb-16 gap-6">
          <div className="text-center md:text-left">
            <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">THE ECOSYSTEM</span>
            <h2 className="font-display text-3xl lg:text-5xl font-black italic uppercase text-zinc-900 dark:text-white mt-1">
              AEROFIT GYM ECOSYSTEM
            </h2>
            <p className="text-zinc-650 dark:text-zinc-500 text-xs uppercase tracking-widest font-bold mt-2">
              ⚡ Powered by Aerofit Equipment Systems
            </p>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {(['All', 'Strength', 'Cardio', 'Functional'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setEquipmentFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  equipmentFilter === cat 
                    ? 'bg-yellow-400 text-black shadow-md' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop View (Grid Layout) */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {filteredEquipment.map((eq) => (
            <EquipmentCard key={eq.id} eq={eq} />
          ))}
        </div>

        {/* Mobile View (Swipeable Carousel - 1 Card Visible) */}
        <div className="lg:hidden flex flex-col items-center space-y-6 relative pb-8">
          {filteredEquipment.length > 0 ? (
            <div className="w-full relative overflow-hidden flex items-center justify-center min-h-[360px] touch-pan-y">
              {/* Chevron Left */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-1 z-10 p-2 bg-black/60 dark:bg-zinc-900/60 text-white rounded-full disabled:opacity-30 disabled:pointer-events-none hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Card Container with Swipe Drag */}
              <div className="w-full max-w-[280px] sm:max-w-xs mx-auto overflow-visible relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${equipmentFilter}-${currentIndex}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.25 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className="w-full select-none"
                  >
                    <EquipmentCard eq={filteredEquipment[currentIndex]} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Chevron Right */}
              <button
                onClick={handleNext}
                disabled={currentIndex === filteredEquipment.length - 1}
                className="absolute right-1 z-10 p-2 bg-black/60 dark:bg-zinc-900/60 text-white rounded-full disabled:opacity-30 disabled:pointer-events-none hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-550 font-mono text-xs">
              No equipment found in this category.
            </div>
          )}

          {/* Pagination Indicators */}
          {filteredEquipment.length > 1 && (
            <div className="flex gap-1.5 justify-center mt-2">
              {filteredEquipment.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx 
                      ? 'bg-yellow-400 w-3' 
                      : 'bg-zinc-300 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// EQUIPMENT CARD HELPER COMPONENT (Framer Motion tilt effect wrapper)
// ---------------------------------------------------------------------------
const EquipmentCard: React.FC<{ eq: Equipment }> = ({ eq }) => {
  const [hovered, setHovered] = useState(false);

  const getIconName = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('dumbbell')) return 'dumbbell';
    if (n.includes('barbell')) return 'barbell';
    if (n.includes('plate')) return 'weightplate';
    if (n.includes('smith')) return 'smithmachine';
    if (n.includes('bench')) return 'benchpress';
    if (n.includes('cable') || n.includes('crossover')) return 'cablecrossover';
    if (n.includes('treadmill')) return 'treadmill';
    if (n.includes('cross trainer') || n.includes('elliptical')) return 'crosstrainer';
    if (n.includes('bike') || n.includes('cycle')) return 'exercisebike';
    if (n.includes('stair') || n.includes('climber')) return 'stairclimber';
    if (n.includes('rope')) return 'battleropes';
    if (n.includes('kettlebell')) return 'kettlebell';
    if (n.includes('squat') || n.includes('rack')) return 'squatrack';
    if (n.includes('leg press')) return 'legpress';
    if (n.includes('lat pulldown') || n.includes('low row')) return 'latpulldown';
    if (n.includes('slam ball')) return 'slamball';
    if (n.includes('plyo') || n.includes('box')) return 'plyobox';
    if (n.includes('band')) return 'resistancebands';
    return 'generic';
  };

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/10 p-6 flex flex-col justify-between hover:border-yellow-400/30 dark:hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all duration-300 group shadow-lg min-h-[340px] w-full"
    >
      {/* Premium glass reflection overlay */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      <div className="space-y-4">
        <div className="h-28 flex items-center justify-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900/50 group-hover:border-yellow-400/10 transition-colors relative overflow-hidden">
          <motion.div
            animate={hovered ? { y: [0, -4, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 flex items-center justify-center"
          >
            <EquipmentSvg name={getIconName(eq.name)} className="w-full h-full text-zinc-400 dark:text-zinc-600 group-hover:text-yellow-400 transition-colors" isHovered={hovered} />
          </motion.div>
        </div>

        <div>
          <span className="text-[9px] text-yellow-500 dark:text-yellow-400 font-mono uppercase tracking-widest font-extrabold">
            {eq.category} • {eq.brand}
          </span>
          <h3 className="font-display text-base font-bold italic text-zinc-900 dark:text-white uppercase mt-1 group-hover:text-yellow-400 transition-colors">
            {eq.name}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-500 text-xs mt-2 leading-relaxed line-clamp-2">
            {eq.description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-150 dark:border-zinc-900/50 flex justify-between items-center text-[10px] font-mono">
        <span className="text-zinc-500 dark:text-zinc-600 uppercase font-semibold">Specs:</span>
        <span className="text-zinc-700 dark:text-zinc-400 truncate max-w-[70%]" title={eq.spec_details}>
          {eq.spec_details}
        </span>
      </div>
    </motion.div>
  );
};
