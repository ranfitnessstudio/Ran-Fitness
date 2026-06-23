"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Phone, ShieldAlert, Sparkles, Key, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [step, setStep] = useState<number>(1);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timers (used ONLY for forgot password OTP flow)
  const [expiryTimer, setExpiryTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [resendCount, setResendCount] = useState(0);

  const router = useRouter();

  // Expiry Timer Ticker (forgot password only)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (expiryTimer > 0) {
      interval = setInterval(() => {
        setExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [expiryTimer]);

  // Resend Cooldown Timer Ticker (forgot password only)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // ── LOGIN HANDLER ──────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/member-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials or login failed.');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Logged in successfully! Redirecting...');
      setTimeout(() => {
        onClose();
        router.push('/member-dashboard');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  // ── DIRECT ACTIVATION HANDLER (NO OTP) ─────────────────────
  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, password, confirmPassword })
      });

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`Server returned invalid response: ${text.substring(0, 200)}`);
      }
      if (!res.ok || !data.success) {
        setError(data.error || 'Activation failed.');
        setIsSubmitting(false);
        return;
      }

      // Activation successful — auto-login session cookie already set by server
      setSuccess('Account activated successfully!');
      setTimeout(() => {
        setSuccess('');
        setStep(2); // Show success screen
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  // ── FORGOT PASSWORD HANDLERS (UNTOUCHED) ───────────────────
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to request recovery code.');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Verification OTP sent to your email!');
      setExpiryTimer(300); // 5 minutes
      setResendTimer(60);  // 60s cooldown
      setAttemptsRemaining(5);
      setResendCount(0);

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

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, purpose: 'FORGOT_PASSWORD' })
      });

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`Server returned invalid response: ${text.substring(0, 200)}`);
      }
      if (!res.ok || !data.success) {
        setError(data.error || 'Verification failed.');
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

      setSuccess('Verification successful!');
      setResetToken(data.resetToken);
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

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, password, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Resetting password failed.');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Password updated successfully!');
      setTimeout(() => {
        setSuccess('');
        setStep(4);
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

    if (resendCount >= 3) {
      setError('Maximum resend limit reached. Please start over.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          purpose: 'FORGOT_PASSWORD'
        })
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
      setResendCount((prev) => prev + 1);
      setOtpCode('');
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setMode('login');
    setStep(1);
    setError('');
    setSuccess('');
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setPhone('');
    setOtpCode('');
    setResetToken('');
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
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-yellow-400" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Title / Icons */}
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-yellow-400 p-3 text-black">
                {mode === 'login' && <Lock size={22} />}
                {mode === 'register' && (step === 2 ? <CheckCircle size={22} /> : <Sparkles size={22} />)}
                {mode === 'forgot' && (step === 4 ? <CheckCircle size={22} /> : <Key size={22} />)}
              </div>
              <div>
                <h3 className="font-display text-lg font-black italic tracking-widest text-white uppercase">
                  {mode === 'login' && 'MEMBER LOGIN'}
                  {mode === 'register' && (step === 2 ? 'ACCOUNT ACTIVATED' : 'ACTIVATE ACCOUNT')}
                  {mode === 'forgot' && (step === 4 ? 'PASSWORD UPDATED' : 'FORGOT PASSWORD')}
                </h3>
                <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider font-mono">
                  {mode === 'login' && 'Access your portal'}
                  {mode === 'register' && (step === 2 ? 'Setup Complete' : 'First Time Activation')}
                  {mode === 'forgot' && (step === 4 ? 'Reset Successful' : `Step ${step} of 4`)}
                </p>
              </div>
            </div>

            {/* Status Messages */}
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

            <div className="mt-5">
              {/* ═══ FLOW 1: LOGIN ═══ */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                      <Mail size={10} /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-600"
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                      <Lock size={10} /> Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-650"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 bottom-2.5 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Accessing...' : 'ACCESS DASHBOARD'}
                  </button>
                </form>
              )}

              {/* ═══ FLOW 2: FORGOT PASSWORD (UNTOUCHED) ═══ */}
              {mode === 'forgot' && (
                <>
                  {step === 1 && (
                    <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                          <Mail size={10} /> Registered Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none placeholder-zinc-600"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? 'Generating OTP...' : 'Send Recovery OTP'}
                      </button>
                    </form>
                  )}

                  {step === 2 && (
                    <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                          Enter 6-digit OTP sent to registered email
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
                          Expires: <span className="font-bold text-zinc-300">{formatTime(expiryTimer)}</span>
                        </span>
                        {resendTimer > 0 ? (
                          <span className="text-zinc-500 italic">Resend in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-yellow-400 hover:text-yellow-300 font-bold hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <div className="text-[10px] text-zinc-500 font-mono text-center flex items-center justify-center gap-1">
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

                  {step === 3 && (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                          <Lock size={10} /> New Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none placeholder-zinc-650"
                        />
                      </div>

                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                          <Lock size={10} /> Confirm Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none placeholder-zinc-650"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  )}

                  {step === 4 && (
                    <div className="space-y-4 text-center mt-2">
                      <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                        Password updated successfully! You can now log in with your new credentials.
                      </p>
                      <button
                        onClick={handleBackToLogin}
                        className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 transition-colors"
                      >
                        Return To Login
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ═══ FLOW 3: FIRST TIME ACCOUNT ACTIVATION (DIRECT — NO OTP) ═══ */}
              {mode === 'register' && (
                <>
                  {step === 1 && (
                    <form onSubmit={handleActivationSubmit} className="space-y-3">
                      <div className="space-y-1">
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

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                          <Phone size={10} /> Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="10-digit Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                            Password
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors mt-2"
                      >
                        {isSubmitting ? 'Activating...' : 'ACTIVATE ACCOUNT'}
                      </button>
                    </form>
                  )}

                  {step === 2 && (
                    <div className="space-y-4 text-center mt-2">
                      <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                        Your account has been activated successfully! You are now logged in.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          router.push('/member-dashboard');
                          router.refresh();
                        }}
                        className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 transition-colors"
                      >
                        ACCESS DASHBOARD
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Options */}
            <div className="mt-6 text-center space-y-2 border-t border-zinc-900 pt-4">
              {mode === 'forgot' && step === 2 && (
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-xs text-yellow-400 font-bold font-sans hover:underline focus:outline-none block w-full text-center"
                >
                  Back to Login
                </button>
              )}

              {mode === 'login' && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setStep(1);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs text-yellow-400 font-bold font-sans hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setStep(1);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs text-yellow-400 font-bold font-sans hover:underline focus:outline-none"
                  >
                    First Time? Activate Gym Account
                  </button>
                </div>
              )}

              {mode !== 'login' && step === 1 && (
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-xs text-yellow-400 font-bold font-sans hover:underline focus:outline-none block w-full text-center"
                >
                  Already Activated? Log In Here
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
