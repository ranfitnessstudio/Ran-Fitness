"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { MembershipPlan } from '@/lib/database';

interface PlansSectionProps {
  plans: MembershipPlan[];
  openBooking: (goal?: string) => void;
}

export default function PlansSection({ plans, openBooking }: PlansSectionProps) {
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < plans.length - 1) {
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
    <section id="plans" className="py-12 lg:py-28 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header block */}
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-16 space-y-3">
          <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">AFFORDABLE RATES</span>
          <h2 className="font-display text-3xl lg:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
            MEMBERSHIP PLANS
          </h2>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm">
            Select your tier and unlock premium access. Hover over cards to load weights.
          </p>
        </div>

        {/* Desktop View (Horizontal 3-column Grid) */}
        <div className="hidden lg:grid grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isHovered = hoveredPlanId === plan.id;
            return (
              <motion.div
                key={plan.id}
                onMouseEnter={() => setHoveredPlanId(plan.id)}
                onMouseLeave={() => setHoveredPlanId(null)}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-xl p-8 border flex flex-col justify-between shadow-lg ${
                  plan.popular_badge 
                    ? 'border-yellow-400 bg-white dark:bg-zinc-900/50 shadow-[0_0_30px_rgba(250,204,21,0.05)]' 
                    : 'border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/20'
                }`}
              >
                {plan.popular_badge && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 rounded bg-yellow-400 text-black px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest">
                    MOST POPULAR
                  </span>
                )}

                <div className="space-y-4 text-left">
                  <h3 className="font-display text-xl font-black italic uppercase text-zinc-900 dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-black italic text-yellow-500 dark:text-yellow-400">₹{plan.price}</span>
                    <span className="text-zinc-500 text-xs">/ {plan.duration}</span>
                  </div>
                  
                  <hr className="border-zinc-150 dark:border-zinc-900" />
                  
                  <ul className="space-y-3 pt-2">
                    {plan.benefits.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs text-zinc-755 dark:text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400 mt-1.5 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="h-12 flex items-center justify-center">
                    {isHovered ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 font-mono text-[9px] uppercase tracking-wider"
                      >
                        <Dumbbell className="animate-bounce" size={14} />
                        BARBELL LOADING...
                      </motion.div>
                    ) : (
                      <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-900" />
                    )}
                  </div>

                  <button
                    onClick={() => openBooking(`Plan: ${plan.name}`)}
                    className={`w-full text-center rounded-lg py-3 text-xs font-black italic uppercase tracking-widest transition-all cursor-pointer ${
                      plan.popular_badge 
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-md' 
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-800'
                    }`}
                  >
                    SELECT PLAN
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View (Swipeable Carousel - 1 Card Visible) */}
        <div className="lg:hidden flex flex-col items-center space-y-6 relative pb-8">
          {plans.length > 0 ? (
            <div className="w-full relative overflow-hidden flex items-center justify-between min-h-[440px] touch-pan-y">
              {/* Chevron Left */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-1 z-10 p-2 bg-black/60 dark:bg-zinc-900/60 text-white rounded-full disabled:opacity-30 disabled:pointer-events-none hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Slider Window */}
              <div className="w-full max-w-[280px] sm:max-w-xs mx-auto overflow-visible relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={plans[currentIndex].id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.25 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className="w-full select-none"
                  >
                    <div
                      className={`relative rounded-xl p-6 border flex flex-col justify-between shadow-lg min-h-[400px] text-left ${
                        plans[currentIndex].popular_badge 
                          ? 'border-yellow-400 bg-white dark:bg-zinc-900/50 shadow-[0_0_30px_rgba(250,204,21,0.05)]' 
                          : 'border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/25'
                      }`}
                    >
                      {plans[currentIndex].popular_badge && (
                        <span className="absolute top-0 right-6 -translate-y-1/2 rounded bg-yellow-400 text-black px-3 py-0.5 text-[9px] font-extrabold uppercase tracking-widest">
                          MOST POPULAR
                        </span>
                      )}

                      <div className="space-y-4">
                        <h3 className="font-display text-lg font-black italic uppercase text-zinc-900 dark:text-white">
                          {plans[currentIndex].name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-3xl font-black italic text-yellow-500 dark:text-yellow-400">
                            ₹{plans[currentIndex].price}
                          </span>
                          <span className="text-zinc-500 text-[10px]">/ {plans[currentIndex].duration}</span>
                        </div>
                        
                        <hr className="border-zinc-150 dark:border-zinc-900" />
                        
                        <ul className="space-y-2.5 pt-2">
                          {plans[currentIndex].benefits.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400 mt-1.5 flex-shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 space-y-4">
                        <button
                          onClick={() => openBooking(`Plan: ${plans[currentIndex].name}`)}
                          className={`w-full text-center rounded-lg py-2.5 text-xs font-black italic uppercase tracking-widest transition-all cursor-pointer ${
                            plans[currentIndex].popular_badge 
                              ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-md' 
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-800'
                          }`}
                        >
                          SELECT PLAN
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Chevron Right */}
              <button
                onClick={handleNext}
                disabled={currentIndex === plans.length - 1}
                className="absolute right-1 z-10 p-2 bg-black/60 dark:bg-zinc-900/60 text-white rounded-full disabled:opacity-30 disabled:pointer-events-none hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-550 font-mono text-xs">
              No plans registered.
            </div>
          )}

          {/* Pagination Indicators */}
          <div className="flex gap-1.5 justify-center mt-2">
            {plans.map((_, idx) => (
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
