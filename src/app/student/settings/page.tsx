// ============================================
// Student Portal: Account Settings & Security
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { updateStudentPassword } from '@/lib/firebase/student-auth';
import {
  Lock,
  ShieldCheck,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function StudentSettingsPage() {
  const router = useRouter();
  const { student, signOut, refreshStudent } = useStudentAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updateStudentPassword(newPassword, student?.id);
      setSuccess('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
      await refreshStudent();
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/student-login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900">
          Account & Security
        </h2>
        <p className="text-xs text-slate-500">
          Manage your Student Portal login password and device session
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Student ID Reference</span>
            <span className="font-bold text-lg text-[#1d4ed8] tracking-wide">
              {student?.studentId || 'ASM101'}
            </span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            Persistent Session Active
          </span>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Lock className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-base text-slate-900">
            Change Portal Password
          </h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Logout Action */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-slate-900">
            Log Out of Session
          </h4>
          <p className="text-xs text-slate-500">
            End this portal session on this browser
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all flex items-center gap-2 active:translate-y-0.5 active:scale-95 cursor-pointer select-none"
        >
          <LogOut className="w-3.5 h-3.5 text-white" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
