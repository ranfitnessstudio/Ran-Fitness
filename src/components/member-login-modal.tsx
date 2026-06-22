"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Phone, ShieldAlert, Sparkles, Key, CheckCircle, RefreshCw, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginTab, setLoginTab] = useState<'email' | 'phone'>('email');
  
  // Recovery / Verification Steps
  // 1: Input details (email/phone/registration)
  // 2: Enter OTP Code
  // 3: Success Setup
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timers
  const [expiryTimer, setExpiryTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const router = useRouter();

  // Expiry Timer Ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (expiryTimer > 0) {
      interval = setInterval(() => {
        setExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [expiryTimer]);

  // Resend Cooldown Timer Ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Format time (seconds -> MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const isRegister = mode === 'register';
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/send-otp';
      
      const payload: any = {};
      if (isRegister) {
        payload.name = fullName;
        payload.email = email;
        payload.phone = phone;
      } else {
        payload.purpose = 'LOGIN';
        if (loginTab === 'email') {
          payload.email = email;
        } else {
          payload.phone = phone;
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to dispatch OTP. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // If phone login, capture registered email resolved by backend
      if (!isRegister && loginTab === 'phone') {
        setEmail(data.email);
      }

      setSuccess('Verification OTP code dispatched!');
      setExpiryTimer(300); // 5 minutes
      setResendTimer(60);  // 60s cooldown
      setAttemptsRemaining(5);

      setTimeout(() => {
        setSuccess('');
        setStep(2);
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: mode === 'register' ? 'REGISTER' : 'LOGIN' })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Resend failed.');
        setIsSubmitting(false);
        return;
      }

      setSuccess('A new verification code has been dispatched.');
      setExpiryTimer(300); // Reset to 5 mins
      setResendTimer(60);  // Reset resend cooldown
      setOtpCode('');
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const payload: any = {
        email,
        otp: otpCode,
        purpose: mode === 'register' ? 'REGISTER' : 'LOGIN'
      };

      if (mode === 'register') {
        payload.registrationData = {
          name: fullName,
          phone
        };
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Verification failed.');
        // Parse attempts left from standard error structure
        if (data.error && data.error.includes('attempts remaining')) {
          const match = data.error.match(/(\d+) attempts/);
          if (match) {
            setAttemptsRemaining(parseInt(match[1]));
          }
        } else if (data.error && data.error.includes('invalidated')) {
          setAttemptsRemaining(0);
        }
        setIsSubmitting(false);
        return;
      }

      setSuccess(mode === 'register' ? 'Account created successfully!' : 'Verification successful!');
      setTimeout(() => {
        setSuccess('');
        setStep(3);
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleSuccessRedirect = () => {
    onClose();
    router.push('/member-dashboard');
    router.refresh();
  };

  const handleBackToLogin = () => {
    setMode('login');
    setStep(1);
    setError('');
    setSuccess('');
    setEmail('');
    setPhone('');
    setFullName('');
    setOtpCode('');
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl transition-colors duration-300"
          >
            {/* Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-yellow-400" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Step-by-Step Title & Icons */}
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-yellow-400 p-3 text-black">
                {step === 3 ? (
                  <CheckCircle size={22} />
                ) : step === 2 ? (
                  <Key size={22} />
                ) : mode === 'register' ? (
                  <Sparkles size={22} />
                ) : (
                  <Lock size={22} />
                )}
              </div>
              <div>
                <h3 className="font-display text-lg font-black italic tracking-widest text-white uppercase">
                  {step === 3 
                    ? 'WELCOME TO RAN FITNESS' 
                    : step === 2 
                      ? 'VERIFY OTP' 
                      : mode === 'register' 
                        ? 'CREATE ACCOUNT' 
                        : 'MEMBER LOGIN'
                  }
                </h3>
                <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider font-mono">
                  {step === 3 
                    ? 'Account Setup Complete' 
                    : step === 2 
                      ? 'Verification step' 
                      : mode === 'register' 
                        ? 'Register a new membership' 
                        : 'Access your portal'
                  }
                </p>
              </div>
            </div>

            {/* Error and Success Banners */}
            <div className="mt-4 empty:hidden">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-400 animate-in fade-in duration-200">
                  <ShieldAlert size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-950/30 p-3 text-xs text-green-400 animate-in fade-in duration-200">
                  <CheckCircle size={14} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="mt-5">
              {/* STEP 1: LOGIN DETAILS INPUT */}
              {step === 1 && (
                <>
                  {mode === 'login' ? (
                    <div className="space-y-4">
                      {/* Tabs selector */}
                      <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-bold uppercase tracking-wider font-mono">
                        <button
                          type="button"
                          onClick={() => { setLoginTab('email'); setError(''); }}
                          className={`py-2 rounded-md transition-all duration-200 ${loginTab === 'email' ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}
                        >
                          Continue with Email
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLoginTab('phone'); setError(''); }}
                          className={`py-2 rounded-md transition-all duration-200 ${loginTab === 'phone' ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}
                        >
                          Continue with Phone
                        </button>
                      </div>

                      <form onSubmit={handleSendOtp} className="space-y-4">
                        {loginTab === 'email' ? (
                          <div className="space-y-1.5 animate-in fade-in duration-150">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                              <Mail size={10} /> Email Address
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-600"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1.5 animate-in fade-in duration-150">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                              <Phone size={10} /> Phone Number
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. 9876543210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-600"
                            />
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                        >
                          {isSubmitting ? 'Processing...' : 'Send OTP'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Registration form view */
                    <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                          <User size={10} /> Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                          <Mail size={10} /> Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                          <Phone size={10} /> Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? 'Sending...' : 'Create Account'}
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* STEP 2: OTP VERIFICATION WIZARD */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                      Enter 6-digit OTP code sent to registered email
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full text-center tracking-widest font-mono text-base rounded-lg border border-zinc-800 bg-zinc-900 py-3.5 text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-650"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono px-1">
                    <span className="text-zinc-500">
                      Code expires: <span className="font-bold text-zinc-350">{formatTime(expiryTimer)}</span>
                    </span>
                    {resendTimer > 0 ? (
                      <span className="text-zinc-500 italic">Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-yellow-400 hover:text-yellow-300 font-bold hover:underline transition-colors"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="text-[10px] text-zinc-500 font-mono text-center pt-1 flex items-center justify-center gap-1">
                    Attempts remaining: <strong className={attemptsRemaining <= 2 ? 'text-red-500' : 'text-zinc-300'}>{attemptsRemaining}</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || expiryTimer <= 0 || attemptsRemaining <= 0}
                    className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}

              {/* STEP 3: SUCCESS WELCOME SCREEN */}
              {step === 3 && (
                <div className="space-y-4 text-center mt-2">
                  <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                    {mode === 'register' 
                      ? 'Your account setup has completed successfully and email is verified.'
                      : 'Verification successful! You are now logged in.'
                    }
                  </p>
                  <button
                    onClick={handleSuccessRedirect}
                    className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 transition-colors"
                  >
                    ACCESS DASHBOARD
                  </button>
                </div>
              )}
            </div>

            {/* Toggle Modes Footer */}
            <div className="mt-6 text-center space-y-2 border-t border-zinc-900 pt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-xs text-yellow-400 font-bold font-sans hover:underline focus:outline-none"
                >
                  Back to Login
                </button>
              )}
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                    setSuccess('');
                    setEmail('');
                    setPhone('');
                    setFullName('');
                  }}
                  className="text-xs text-yellow-400 font-bold font-sans hover:underline focus:outline-none"
                >
                  {mode === 'login' 
                    ? 'First Time? Activate Gym Account' 
                    : 'Already Activated? Log In Here'
                  }
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
