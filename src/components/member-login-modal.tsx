"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Phone, Eye, EyeOff, ShieldAlert, Sparkles, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'activate' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [phone, setPhone] = useState('');
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  // Password Policy Live Validation State
  const [passValidations, setPassValidations] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Calculate live validations
  useEffect(() => {
    setPassValidations({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Request failed. Please try again.');
        setIsSubmitting(false);
        return;
      }
      setSuccess('OTP verification code has been sent!');
      setResendTimer(60);
      setTimeout(() => {
        setSuccess('');
        setForgotStep(2);
        setIsSubmitting(false);
      }, 1000);
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
      const res = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Verification failed.');
        setIsSubmitting(false);
        return;
      }
      setResetToken(data.resetToken);
      setSuccess('OTP verified successfully!');
      setTimeout(() => {
        setSuccess('');
        setForgotStep(3);
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    const isComplex = Object.values(passValidations).every(Boolean);
    if (!isComplex) {
      setError('Password does not meet complexity requirements.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Reset failed.');
        setIsSubmitting(false);
        return;
      }
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        setSuccess('');
        setForgotStep(4);
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleLoginOrActivate = async (e: React.FormEvent) => {
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
        setTimeout(async () => {
          try {
            const loginRes = await fetch('/api/auth/member-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, password }),
            });
            const loginData = await loginRes.json();
            if (loginRes.ok && loginData.success) {
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
    setForgotStep(1);
    setError('');
    setSuccess('');
    setPhone('');
    setMemberId('');
    setPassword('');
    setConfirmPassword('');
    setOtpCode('');
  };

  const activePoints = Object.values(passValidations).filter(Boolean).length;
  const strengthColor = activePoints <= 2 ? 'bg-red-500' : activePoints <= 4 ? 'bg-yellow-500' : 'bg-green-500';

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
                {mode === 'login' ? (
                  <Lock size={22} />
                ) : mode === 'activate' ? (
                  <Sparkles size={22} />
                ) : forgotStep === 4 ? (
                  <CheckCircle size={22} />
                ) : (
                  <Key size={22} />
                )}
              </div>
              <div>
                <h3 className="font-display text-lg font-black italic tracking-widest text-white uppercase">
                  {mode === 'login' 
                    ? 'MEMBER LOGIN' 
                    : mode === 'activate' 
                      ? 'ACTIVATE ACCOUNT' 
                      : forgotStep === 1 
                        ? 'FORGOT PASSWORD' 
                        : forgotStep === 2 
                          ? 'VERIFY OTP' 
                          : forgotStep === 3 
                            ? 'RESET PASSWORD' 
                            : 'PASSWORD RESET SUCCESSFUL'
                  }
                </h3>
                <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider font-mono">
                  {mode === 'login' 
                    ? 'Access your fitness portal' 
                    : mode === 'activate' 
                      ? 'First-time activation setup' 
                      : forgotStep === 4 
                        ? 'Setup complete' 
                        : `Recovery Stage ${forgotStep} of 3`
                  }
                </p>
              </div>
            </div>

            {/* Info description for steps */}
            {mode === 'forgot' && forgotStep === 1 && (
              <p className="text-xs text-zinc-400 text-center mt-3 font-medium">
                Enter your registered phone number.
              </p>
            )}

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

            {/* Dynamic Step Forms */}
            {mode === 'forgot' ? (
              <div className="mt-4">
                {/* Step 1: Phone verification */}
                {forgotStep === 1 && (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
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
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-650"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? 'Sending...' : 'Send OTP'}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP Validation */}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                        6-digit OTP
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
                        {resendTimer > 0 ? `Code expires in ${resendTimer}s` : 'Code expired'}
                      </span>
                      <button
                        type="button"
                        disabled={resendTimer > 0}
                        onClick={() => handleRequestOtp()}
                        className="text-yellow-400 hover:text-yellow-300 font-bold disabled:text-zinc-600 disabled:no-underline hover:underline transition-colors"
                      >
                        Resend OTP
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </form>
                )}

                {/* Step 3: Password Update Form */}
                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-3.5 pr-10 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-600"
                      />
                    </div>

                    {/* Password Strength Meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-zinc-400 font-bold px-0.5">
                        <span>Strength</span>
                        <span>{activePoints === 0 ? 'Empty' : activePoints <= 2 ? 'Weak' : activePoints <= 4 ? 'Medium' : 'Strong'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                          className={`h-full transition-all duration-300 ${strengthColor}`} 
                          style={{ width: `${(activePoints / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Password Rules Checklist */}
                    <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3 text-[10px] space-y-1 text-zinc-400">
                      <div className="font-bold uppercase tracking-wider text-[8px] mb-1.5 text-zinc-500">Complexity requirements:</div>
                      <div className="flex items-center gap-1.5">
                        <span className={passValidations.minLength ? 'text-green-400 font-bold' : 'text-red-400'}>
                          {passValidations.minLength ? '✓' : '✗'}
                        </span>
                        <span>Min 8 characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={passValidations.hasUpper ? 'text-green-400 font-bold' : 'text-red-400'}>
                          {passValidations.hasUpper ? '✓' : '✗'}
                        </span>
                        <span>Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={passValidations.hasLower ? 'text-green-400 font-bold' : 'text-red-400'}>
                          {passValidations.hasLower ? '✓' : '✗'}
                        </span>
                        <span>Lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={passValidations.hasNumber ? 'text-green-400 font-bold' : 'text-red-400'}>
                          {passValidations.hasNumber ? '✓' : '✗'}
                        </span>
                        <span>At least one number</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={passValidations.hasSpecial ? 'text-green-400 font-bold' : 'text-red-400'}>
                          {passValidations.hasSpecial ? '✓' : '✗'}
                        </span>
                        <span>Special character (!@#$%^&*)</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? 'Updating...' : 'Reset Password'}
                    </button>
                  </form>
                )}

                {/* Step 4: Success Screen */}
                {forgotStep === 4 && (
                  <div className="space-y-4 mt-2">
                    <p className="text-sm text-zinc-300 text-center font-medium leading-relaxed">
                      Your password has been updated successfully.
                    </p>
                    <button
                      onClick={() => {
                        setMode('login');
                        setForgotStep(1);
                        setError('');
                        setSuccess('');
                        setPhone('');
                        setPassword('');
                        setConfirmPassword('');
                        setOtpCode('');
                      }}
                      className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleLoginOrActivate} className="mt-6 space-y-4">
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
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-600"
                  />
                </div>

                {mode === 'activate' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                      <Sparkles size={10} /> Member ID (from receipt)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RF1001"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-650"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex justify-between">
                    <span>{mode === 'login' ? 'Password' : 'Create Password'}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-3.5 pr-10 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Forgot Password Link directly below password input, aligned right */}
                  {mode === 'login' && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setForgotStep(1);
                          setError('');
                          setSuccess('');
                        }}
                        className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded px-1"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {mode === 'activate' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder-zinc-650"
                    />
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-lg bg-yellow-400 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting 
                    ? 'Processing...' 
                    : mode === 'login' ? 'ACCESS DASHBOARD' : 'ACTIVATE & LOGIN'
                  }
                </button>
              </form>
            )}

            {/* Toggle Modes Footer */}
            <div className="mt-6 text-center space-y-2 border-t border-zinc-900 pt-4">
              {mode === 'forgot' ? (
                <button
                  onClick={() => {
                    setMode('login');
                    setForgotStep(1);
                    setError('');
                    setSuccess('');
                    setPhone('');
                    setPassword('');
                    setConfirmPassword('');
                    setOtpCode('');
                  }}
                  className="text-xs text-yellow-400 font-bold font-sans hover:underline focus:outline-none"
                >
                  Back to Login
                </button>
              ) : (
                <button
                  onClick={toggleMode}
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
