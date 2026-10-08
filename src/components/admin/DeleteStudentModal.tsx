// ============================================
// Modal: Permanently Delete Student Account (Admin)
// ============================================

'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X, AlertOctagon, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

import type { Student } from '@/types/student';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedStudentId: string, studentName: string) => void;
  student: Student | {
    id?: string;
    studentId?: string;
    name: string;
    parentEmail?: string;
    parentPhone?: string;
    instrument?: string;
    course?: string;
  } | null;
}

export default function DeleteStudentModal({
  isOpen,
  onClose,
  onSuccess,
  student,
}: DeleteStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    if (!student.id && !student.studentId) {
      setError('Student ID or document reference is missing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/students/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentDocId: student.id,
          studentId: student.studentId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete student account.');
      }

      onSuccess(student.studentId || '', student.name);
      onClose();
    } catch (err: any) {
      console.error('[Delete Student] Error:', err);
      setError(err.message || 'An error occurred while deleting the student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-navy/80 dark:bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1626] rounded-3xl shadow-2xl border-2 border-red-200 dark:border-red-900/50 p-6 sm:p-7 z-10 my-8 animate-scale-in text-slate-900 dark:text-slate-100">
        {/* Warning Badge Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
                  Permanent Deletion
                </span>
              </div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white mt-0.5">
                Permanently Delete Student?
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Student Identity Card */}
        <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between border-b border-red-200/80 dark:border-red-900/50 pb-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Target Student:</span>
            <strong className="text-sm font-bold text-slate-900 dark:text-white">
              {student.name}
            </strong>
          </div>
          <div className="flex items-center justify-between border-b border-red-200/80 dark:border-red-900/50 pb-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Student ID:</span>
            <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-red-600 text-white shadow-xs">
              {student.studentId}
            </span>
          </div>
          {student.parentEmail && (
            <div className="flex items-center justify-between border-b border-red-200/80 dark:border-red-900/50 pb-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Parent Email:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">
                {student.parentEmail}
              </span>
            </div>
          )}
          {student.instrument && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Instrument / Course:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {student.instrument} {student.course ? `(${student.course})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Double-Entry Safety Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 mb-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">
              Duplicate Entry Safety Notice:
            </p>
            <p className="leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
              Only the account registered under Student ID{' '}
              <strong className="font-mono font-bold underline">{student.studentId}</strong> will be deleted. If there is a duplicate entry of this student with the same name, that other record will remain <strong>completely safe and untouched</strong>.
            </p>
          </div>
        </div>

        {/* Warning Details */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-5 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            What will happen when you confirm:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li>Student ID <span className="font-mono font-bold">{student.studentId}</span> will be permanently purged.</li>
            <li>All associated attendance, fees, schedules, and progress evaluations for {student.studentId} will be permanently removed.</li>
            <li>This action is irreversible and cannot be recovered.</li>
          </ul>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs mb-4 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel / Keep Student
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting {student.studentId}...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete {student.studentId} Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
