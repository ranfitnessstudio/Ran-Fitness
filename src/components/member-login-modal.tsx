"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Phone, Eye, EyeOff, ShieldAlert, Sparkles, Key, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'activate'>('login');
  const [phone, setPhone] = useState('');
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (mode === 'activate' && password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/member-login' : '/api/auth/member-activate';
      const payload = mode === 'login' 
        ? { phone, password } 
        : { phone, member_id: memberId, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (mode === 'activate') {
        setSuccess('Account activated successfully! Logging you in...');
        // Auto login after activation
        setTimeout(async () => {
          try {
            const loginRes = await fetch('/api/auth/member-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, password }),
            });
            const loginData = await loginRes.json();
            if (loginRes.ok && loginData.success) {
              // Redirect to dashboard
              onClose();
              router.push('/member-dashboard');
              router.refresh();
            } else {
              setMode('login');
              setSuccess('');
              setError('Account activated. Please enter password to log in.');
              setIsSubmitting(false);
            }
          } catch {
            setMode('login');
            setSuccess('');
            setIsSubmitting(false);
          }
        }, 1500);
      } else {
        // Normal login success
        onClose();
        router.push('/member-dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'A network error occurred. Please try again.';
      setError(errMsg);
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'activate' : 'login');
    setError('');
    setSuccess('');
    setPhone('');
    setMemberId('');
    setPassword('');
    setConfirmPassword('');
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-zinc-900 dark:text-white shadow-2xl transition-colors duration-300"
          >
            {/* Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-yellow-400" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-yellow-400 p-3 text-black">
                {mode === 'login' ? <Lock size={22} /> : <Key size={22} />}
              </div>
              <div>
                <h3 className="font-display text-lg font-black italic tracking-widest text-zinc-900 dark:text-white uppercase">
                  {mode === 'login' ? 'MEMBER LOGIN' : 'ACTIVATE ACCOUNT'}
                </h3>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1 uppercase tracking-wider font-mono">
                  {mode === 'login' ? 'Access your fitness portal' : 'First-time activation setup'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAction} className="mt-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-400">
                  <ShieldAlert size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-950/30 p-3 text-xs text-green-400">
                  <CheckCircle size={14} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1">
                  <Phone size={10} /> Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-400 dark:placeholder-zinc-600"
                />
              </div>

              {/* Member ID (Activation only) */}
              {mode === 'activate' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1">
                    <Sparkles size={10} /> Member ID (from registration receipt)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RF1001"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-400 dark:placeholder-zinc-600"
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">
                  {mode === 'login' ? 'Password' : 'Create Password'}
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Activation only) */}
              {mode === 'activate' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
              >
                {isSubmitting 
                  ? (mode === 'login' ? 'Authorizing...' : 'Activating Account...') 
                  : (mode === 'login' ? 'Access Dashboard' : 'Activate & Login')
                }
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
                className="text-xs text-yellow-600 dark:text-yellow-400 font-bold font-sans hover:underline focus:outline-none"
              >
                {mode === 'login' 
                  ? 'First Time? Activate Gym Account' 
                  : 'Already Activated? Log In Here'
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
