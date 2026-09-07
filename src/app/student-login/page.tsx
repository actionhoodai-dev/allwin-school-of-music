// ============================================
// Student Portal Login & OTP Recovery Page (Clean White Theme — Flipkart / Amazon Style)
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import Button from '@/components/ui/Button';

export default function StudentLoginPage() {
  const router = useRouter();
  const { signIn } = useStudentAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password / OTP state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [resolvedStudentId, setResolvedStudentId] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  // Direct login submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your Student ID (e.g. ASM101) or email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(identifier.trim(), password);
      router.push('/student');
    } catch (err: any) {
      console.error('Student login error:', err);
      setError(
        err.message || 'Login failed. Please check your Student ID and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpMessage('');

    if (!otpIdentifier.trim()) {
      setOtpError('Please enter your Student ID or registered parent email.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch('/api/student/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: otpIdentifier.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        setOtpError(data.error || 'Failed to send OTP code.');
        return;
      }

      setOtpMessage(data.message || '6-digit OTP sent to registered email.');
      setResolvedStudentId(data.studentId || '');
      if (data.devSimulated) {
        setDevOtpCode(data.devSimulated);
      }
      setOtpStep('verify');
    } catch (err: any) {
      setOtpError(err.message || 'Error sending OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and reset password
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpMessage('');

    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code.');
      return;
    }

    if (newPassword.length < 6) {
      setOtpError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setOtpError('Passwords do not match.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch('/api/student/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: otpIdentifier.trim(),
          otp: otpCode.trim(),
          newPassword,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setOtpError(data.error || 'Invalid or expired OTP code.');
        return;
      }

      setOtpMessage('Password updated successfully! You can now log in.');
      setTimeout(() => {
        setOtpModalOpen(false);
        setOtpStep('request');
        setIdentifier(resolvedStudentId || otpIdentifier);
        setPassword(newPassword);
      }, 1500);
    } catch (err: any) {
      setOtpError(err.message || 'Error updating password.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between text-slate-900 select-none relative overflow-hidden">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-md w-full mx-auto z-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Website</span>
        </Link>
        <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#fff7e6] border border-[#ffd591] text-[#b78103]">
          <Sparkles className="w-3 h-3 text-[#fb641b]" />
          <span>Parent & Student Portal</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto px-4 py-4 z-10 my-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="relative inline-block">
              <Image
                src="/logo.png"
                alt="Allwin School of Music"
                width={70}
                height={70}
                className="rounded-full shadow-sm ring-4 ring-blue-100 mx-auto"
                priority
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <h1 className="font-bold text-2xl tracking-tight text-slate-900">
              Allwin Student Portal
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
              Sign in with your Student ID (e.g. ASM101) or registered email to view attendance, reports & fees.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Student ID or Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ASM101 or parent@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:bg-white transition-all font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOtpModalOpen(true);
                    setOtpIdentifier(identifier);
                  }}
                  className="text-xs text-[#1d4ed8] hover:underline transition-colors font-bold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={loading}
              className="mt-2 text-sm font-bold bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-md shadow-blue-600/25 active:translate-y-0.5 active:scale-[0.97] transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Security & Offline indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 text-center font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Persistent session • Secured by Firebase Authentication</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 z-10 font-medium">
        <p>© {new Date().getFullYear()} Allwin School of Music & Musicals</p>
        <p className="text-[11px] mt-0.5">Need assistance? Call +91 94892 03683</p>
      </footer>

      {/* Forgot Password / OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setOtpModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 z-10 animate-slide-in-right sm:animate-scale-in text-slate-900 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2874f0] border border-blue-100 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">
                {otpStep === 'request' ? 'Password Recovery' : 'Verify 6-Digit OTP'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {otpStep === 'request'
                  ? 'Enter your Student ID or registered parent email to receive a 6-digit code.'
                  : 'Enter the 6-digit verification code sent to your registered email.'}
              </p>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {otpMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{otpMessage}</span>
              </div>
            )}

            {devOtpCode && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                <strong>Simulated Dev OTP:</strong> {devOtpCode} (Resend active)
              </div>
            )}

            {otpStep === 'request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student ID or Parent Email
                  </label>
                  <input
                    type="text"
                    required
                    value={otpIdentifier}
                    onChange={(e) => setOtpIdentifier(e.target.value)}
                    placeholder="e.g. ASM101"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={otpLoading} className="flex-1 text-xs">
                    {otpLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center tracking-[0.3em] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep('request')}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <Button type="submit" disabled={otpLoading} className="flex-1 text-xs">
                    {otpLoading ? 'Verifying...' : 'Set Password'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
