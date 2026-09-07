// ============================================
// Force Password Change Dialog (Clean White Theme)
// ============================================

'use client';

import { useState } from 'react';
import { Lock, Check, AlertCircle } from 'lucide-react';
import { updateStudentPassword } from '@/lib/firebase/student-auth';
import { useStudentAuth } from '@/context/StudentAuthContext';
import Button from '@/components/ui/Button';

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForcePasswordChangeModal({ isOpen, onClose }: ForcePasswordChangeModalProps) {
  const { student, refreshStudent } = useStudentAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      setSuccess(true);
      await refreshStudent();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 animate-scale-in text-slate-900">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl text-slate-900">Set New Password</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
            Welcome to Allwin Student Portal! For your account security, please create a personal password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-emerald-700">
              Password updated successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:bg-white transition-all text-slate-900"
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
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:bg-white transition-all text-slate-900"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Saving Password...' : 'Save New Password'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
