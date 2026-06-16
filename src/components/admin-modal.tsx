"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('ran_fitness_admin_session', JSON.stringify({
            token: data.token,
            username: username,
            expiresAt: Date.now() + 3600000 * 2 // 2 hours
          }));
        }
        setIsSubmitting(false);
        onClose();
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid username or password credentials.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

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
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-zinc-900 dark:text-white shadow-2xl transition-colors duration-300"
          >
            {/* Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-yellow-400" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-yellow-400 p-3 text-black">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-black italic tracking-widest text-zinc-900 dark:text-white uppercase">
                  ADMIN LOGIN
                </h3>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1 uppercase tracking-wider font-mono">
                  Ran Fitness CMS Control
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-400">
                  <ShieldAlert size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-400 dark:placeholder-zinc-650"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-3.5 pr-10 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Verifying Credentials...' : 'Access Dashboard'}
              </button>
            </form>

            <div className="mt-6 text-center text-[10px] text-zinc-500 font-mono">
              Demo access: <strong className="text-zinc-600 dark:text-zinc-500">admin / RanFitness2026!</strong> (Changeable via Security Panel)
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
