"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { Transformation } from '@/lib/database';
import { BeforeAfterSlider } from '@/components/before-after-slider';

interface TransformationsSectionProps {
  transformations: Transformation[];
  googleReviews: Array<{
    name: string;
    rating: number;
    relativeTime: string;
    text: string;
    avatar: string;
  }>;
}

export default function TransformationsSection({ transformations, googleReviews }: TransformationsSectionProps) {
  return (
    <>
      <section id="transformations" className="py-12 lg:py-28 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-100/50 dark:bg-zinc-950/40 relative overflow-hidden transition-colors duration-300">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] dark:opacity-[0.09] mix-blend-luminosity grayscale bg-cover bg-center" style={{ backgroundImage: `url('/images/vascular_gym_muscles.png')` }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-16 space-y-3">
            <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">COMMUNITY STRENGTH</span>
            <h2 className="font-display text-3xl lg:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
              TRANSFORMATION WALL
            </h2>
            <p className="text-zinc-650 dark:text-zinc-400 text-sm">
              Drag the center line on our slider to visualize the fitness results achieved by our members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {transformations.map((trans) => (
              <div key={trans.id} className="space-y-4">
                <BeforeAfterSlider 
                  beforeImage={trans.before_image} 
                  afterImage={trans.after_image}
                  beforeLabel="Start Form"
                  afterLabel={trans.weight_lost || 'Transformed'}
                />
                <div className="p-4 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-xl space-y-2 shadow-md">
                  <h4 className="font-display font-black text-lg italic text-zinc-900 dark:text-white uppercase">{trans.member_name}</h4>
                  <p className="text-zinc-650 dark:text-zinc-450 text-xs leading-relaxed">{trans.story}</p>
                  <div className="flex gap-4 text-[10px] font-mono text-yellow-500 dark:text-yellow-400 uppercase tracking-wider font-extrabold">
                    {trans.weight_lost && <span>💥 {trans.weight_lost}</span>}
                    {trans.muscle_gained && <span>💪 {trans.muscle_gained}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Trusted by Our Members (Google Reviews test) */}
      <section className="py-12 lg:py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 lg:mb-16 gap-6">
            <div className="text-center md:text-left">
              <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">SOCIAL PROOF</span>
              <h2 className="font-display text-3xl lg:text-5xl font-black italic uppercase text-zinc-900 dark:text-white mt-1">
                TRUSTED BY OUR MEMBERS
              </h2>
              <p className="text-zinc-650 dark:text-zinc-400 text-sm mt-2">
                Honest feedback from local Habsiguda gym members. (Connected to Maps API)
              </p>
            </div>

            {/* Rating badge */}
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-lg">
              <div className="text-3xl font-black italic font-display text-yellow-500 dark:text-yellow-400">4.9</div>
              <div className="text-xs text-left">
                <div className="flex text-yellow-500 dark:text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-yellow-500 dark:fill-yellow-400" />
                  ))}
                </div>
                <div className="text-zinc-550 dark:text-zinc-400 font-mono text-[9px] uppercase tracking-wider font-bold mt-1">
                  342 Reviews on Google
                </div>
              </div>
            </div>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {googleReviews.map((rev, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-xl relative flex flex-col justify-between space-y-4 shadow-md">
                <div className="space-y-3">
                  <div className="flex text-yellow-500 dark:text-yellow-400 justify-start">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className="fill-yellow-500 dark:fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed text-left">"{rev.text}"</p>
                </div>
                
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-900/50">
                  <div className="h-8 w-8 rounded-full bg-yellow-400 text-black font-extrabold text-xs flex items-center justify-center">
                    {rev.avatar}
                  </div>
                  <div className="text-left">
                    <strong className="text-zinc-900 dark:text-white text-xs block">{rev.name}</strong>
                    <span className="text-zinc-500 text-[10px] font-mono">{rev.relativeTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
