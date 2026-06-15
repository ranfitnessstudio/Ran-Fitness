"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ChevronRight, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: string;
  source?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialGoal = '',
  source = 'Website Booking Button',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    goal: initialGoal || 'Muscle Gain',
    preferredTime: 'Evening (6:00 PM - 8:00 PM)',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source,
        }),
      });

      if (response.ok) {
        // Trigger "Weight Slam" effect: a rapid modal shake
        setShakeTrigger(true);
        setTimeout(() => setShakeTrigger(false), 500);

        // Play slam sound or visual flash
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FACC15', '#FFFFFF', '#000000'],
        });

        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Failed to submit booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goals = [
    'Fat Loss / Shredding',
    'Muscle Gain / Hypertrophy',
    'CrossFit / Athletic Power',
    'Zumba / Dance Fitness',
    'General Mobility & Cardio',
  ];

  const times = [
    'Early Morning (5:00 AM - 7:00 AM)',
    'Morning Rush (7:00 AM - 9:00 AM)',
    'Mid-Day (11:00 AM - 1:00 PM)',
    'Evening Peak (5:00 PM - 7:00 PM)',
    'Night Strength (7:00 PM - 9:30 PM)',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              // Shake animation on weight slam
              x: shakeTrigger ? [0, -10, 10, -8, 8, -5, 5, 0] : 0,
              y: shakeTrigger ? [0, 10, -10, 5, -5, 2, -2, 0] : 0,
            }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{
              type: 'spring',
              duration: 0.5,
              x: { duration: 0.4 },
              y: { duration: 0.4 },
            }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 text-zinc-900 dark:text-white shadow-2xl transition-colors duration-300"
          >
            {/* Header Yellow Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 animate-pulse" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-black italic tracking-wider uppercase text-yellow-400">
                    CLAIM YOUR SPOT
                  </h3>
                  <p className="text-zinc-550 dark:text-zinc-400 text-sm">
                    Enter details below for an instant follow-up & a free personal trainer assessment session.
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all text-zinc-900 dark:text-white placeholder-zinc-450 dark:placeholder-zinc-605"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all text-zinc-900 dark:text-white placeholder-zinc-450 dark:placeholder-zinc-605"
                  />
                </div>

                {/* Fitness Goal */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">
                    Primary Fitness Goal
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all text-zinc-900 dark:text-white"
                  >
                    {goals.map((g) => (
                      <option key={g} value={g} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Time */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">
                    Preferred Time Slot
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all text-zinc-900 dark:text-white"
                  >
                    {times.map((t) => (
                      <option key={t} value={t} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-yellow-400 py-3.5 text-sm font-black italic uppercase tracking-wider text-black transition-all hover:bg-yellow-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Activity className="animate-spin" size={16} />
                      Locking it in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      SLAP WEIGHTS & BOOK FREE TRIAL
                      <ChevronRight size={16} />
                    </span>
                  )}
                </button>
              </form>
            ) : (
              // Success Screen with Weight Slam details
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center space-y-6"
              >
                {/* Slamming dumbbell effect */}
                <motion.div
                  initial={{ y: -60, scale: 1.5, rotate: -30 }}
                  animate={{ y: 0, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="rounded-full bg-yellow-400 p-5 text-black"
                >
                  <Flame size={40} className="fill-black" />
                </motion.div>

                <div>
                  <h3 className="font-display text-3xl font-black italic tracking-wide text-yellow-400 uppercase">
                    WEIGHTS SLAMMED!
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-300 text-sm max-w-sm">
                    Hey <span className="font-bold text-zinc-900 dark:text-white">{formData.name}</span>, your booking is confirmed!
                    Trainer <span className="text-yellow-500 dark:text-yellow-400 font-bold">Vikram Ran</span> has been notified via Telegram. He will personally call you at <span className="font-bold text-zinc-900 dark:text-white">{formData.phone}</span> to coordinate.
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 w-full text-left space-y-2 text-xs text-zinc-850 dark:text-zinc-200">
                  <div className="text-zinc-400 dark:text-zinc-500 uppercase font-mono">BOOKING IN SUMMARY:</div>
                  <div><strong className="text-yellow-500 dark:text-yellow-400">Goal:</strong> {formData.goal}</div>
                  <div><strong className="text-yellow-500 dark:text-yellow-400">Slot:</strong> {formData.preferredTime}</div>
                  <div><strong className="text-yellow-500 dark:text-yellow-400">Lead Source:</strong> {source}</div>
                </div>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    onClose();
                  }}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-400 bg-transparent py-2.5 text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors"
                >
                  Get Back To Gym
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
