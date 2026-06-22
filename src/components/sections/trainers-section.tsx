"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Trainer } from '@/lib/database';

interface TrainersSectionProps {
  trainers: Trainer[];
  setSelectedTrainer: (t: Trainer) => void;
  trackEvent: (evt: string) => void;
}

export default function TrainersSection({ trainers, setSelectedTrainer, trackEvent }: TrainersSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine actual trainers with coming soon placeholders into a single roster
  const combinedRoster = [
    ...trainers.map(t => ({ type: 'trainer' as const, data: t, id: t.id })),
    ...Array.from({ length: 3 }).map((_, idx) => ({ 
      type: 'coming_soon' as const, 
      id: `placeholder-${idx}`,
      data: null
    }))
  ];

  const handleNext = () => {
    if (currentIndex < combinedRoster.length - 1) {
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
    <section id="trainers" className="py-12 lg:py-28 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-16 space-y-3">
          <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">COACH SPOTLIGHT</span>
          <h2 className="font-display text-3xl lg:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
            MEET YOUR COACHES
          </h2>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm">
            Push your limits alongside our elite certified training crew. Hover cards to reveal tilt glow.
          </p>
        </div>

        {/* Desktop View (Grid Layout) */}
        <div className="hidden lg:grid grid-cols-3 gap-10 max-w-5xl mx-auto justify-items-center">
          {trainers.map((trainer, idx) => (
            <motion.div
              key={trainer.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              viewport={{ once: true }}
              onClick={() => { setSelectedTrainer(trainer); trackEvent('trainer_card_click'); }}
              className="relative rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden cursor-pointer group hover:border-yellow-400/40 dark:hover:border-yellow-400/40 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between w-full"
            >
              {/* Picture */}
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={trainer.image_url}
                  alt={trainer.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                {/* Designation overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] text-yellow-400 font-mono uppercase tracking-widest font-extrabold bg-zinc-950/80 px-2 py-1 rounded border border-zinc-900">
                    {trainer.experience}
                  </span>
                  <h4 className="font-display text-lg font-black italic text-white uppercase mt-2">{trainer.name}</h4>
                  <p className="text-zinc-300 text-xs">{trainer.designation}</p>
                </div>
              </div>

              {/* Achievements */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-150 dark:border-zinc-900 flex flex-wrap gap-1.5 min-h-[44px]">
                {trainer.badges && trainer.badges.map((badge, bIdx) => (
                  <span 
                    key={bIdx}
                    className="bg-yellow-400/10 text-yellow-500 dark:text-yellow-400 border border-yellow-400/20 rounded-full px-2 py-0.5 text-[8px] font-mono uppercase font-bold tracking-wider"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Placeholders */}
          {trainers.length < 3 && Array.from({ length: 3 - trainers.length }).map((_, idx) => (
            <motion.div
              key={`placeholder-${idx}`}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (trainers.length + idx) * 0.12 }}
              viewport={{ once: true }}
              className="relative rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/20 overflow-hidden flex flex-col justify-center items-center min-h-[380px] w-full"
            >
              <div className="text-center space-y-3 p-6">
                <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto">
                  <Plus size={24} className="text-yellow-400" />
                </div>
                <h4 className="font-display text-lg font-black italic text-zinc-400 dark:text-zinc-600 uppercase">Coming Soon</h4>
                <p className="text-zinc-400 dark:text-zinc-600 text-xs">New coach joining the team</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View (Swipeable Carousel) */}
        <div className="lg:hidden flex flex-col items-center space-y-6 relative pb-8">
          <div className="w-full relative overflow-hidden flex items-center justify-between min-h-[440px] touch-pan-y">
            
            {/* Prev Chevron */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-1 z-10 p-2 bg-black/60 dark:bg-zinc-900/60 text-white rounded-full disabled:opacity-30 disabled:pointer-events-none hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Slider window */}
            <div className="w-full max-w-[280px] sm:max-w-xs mx-auto overflow-visible relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={combinedRoster[currentIndex].id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.25 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                  className="w-full select-none"
                >
                  {combinedRoster[currentIndex].type === 'trainer' ? (
                    <div
                      onClick={() => {
                        const t = combinedRoster[currentIndex].data!;
                        setSelectedTrainer(t);
                        trackEvent('trainer_card_click');
                      }}
                      className="relative rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden cursor-pointer flex flex-col justify-between shadow-xl w-full min-h-[400px]"
                    >
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <img
                          src={combinedRoster[currentIndex].data!.image_url}
                          alt={combinedRoster[currentIndex].data!.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="text-[10px] text-yellow-400 font-mono uppercase tracking-widest font-extrabold bg-zinc-950/80 px-2 py-1 rounded border border-zinc-900">
                            {combinedRoster[currentIndex].data!.experience}
                          </span>
                          <h4 className="font-display text-base font-black italic text-white uppercase mt-2">
                            {combinedRoster[currentIndex].data!.name}
                          </h4>
                          <p className="text-zinc-300 text-xs">{combinedRoster[currentIndex].data!.designation}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-150 dark:border-zinc-900 flex flex-wrap gap-1.5 min-h-[44px]">
                        {combinedRoster[currentIndex].data!.badges && combinedRoster[currentIndex].data!.badges.map((badge, bIdx) => (
                          <span 
                            key={bIdx}
                            className="bg-yellow-400/10 text-yellow-500 dark:text-yellow-400 border border-yellow-400/20 rounded-full px-2 py-0.5 text-[8px] font-mono uppercase font-bold tracking-wider"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/20 overflow-hidden flex flex-col justify-center items-center min-h-[400px] w-full">
                      <div className="text-center space-y-3 p-6">
                        <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto">
                          <Plus size={24} className="text-yellow-400" />
                        </div>
                        <h4 className="font-display text-lg font-black italic text-zinc-400 dark:text-zinc-650 uppercase">Coming Soon</h4>
                        <p className="text-zinc-500 dark:text-zinc-600 text-xs">New coach joining the team</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Chevron */}
            <button
              onClick={handleNext}
              disabled={currentIndex === combinedRoster.length - 1}
              className="absolute right-1 z-10 p-2 bg-black/60 dark:bg-zinc-900/60 text-white rounded-full disabled:opacity-30 disabled:pointer-events-none hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>

          </div>

          {/* Pagination Indicators */}
          <div className="flex gap-1.5 justify-center mt-2">
            {combinedRoster.map((_, idx) => (
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
        </div>

      </div>
    </section>
  );
}
