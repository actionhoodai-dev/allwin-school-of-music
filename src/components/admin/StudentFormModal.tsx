// ============================================
// Add / Edit Student Modal Component (Admin Simplified)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/admin/ImageUploader';
import { INSTRUMENT_OPTIONS, DEFAULT_COURSE_LEVELS, ALL_GRADES, getLevelForGrade } from '@/lib/constants';
import { getDocuments } from '@/lib/firebase/firestore';
import type { Student, CourseLevel } from '@/types/student';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
  editingStudent?: Student | null;
}

export default function StudentFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingStudent,
}: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    course: 'Western Music',
    instrument: 'Keyboard',
    level: 'Pre Foundation Level',
    grade: 'Initial Grade',
    photo: '',
    initialPassword: '',
    status: 'active',
  });

  const [nextIdPreview, setNextIdPreview] = useState<string>('Loading...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseLevels, setCourseLevels] = useState<CourseLevel[]>([]);
  const [passwordAutoSynced, setPasswordAutoSynced] = useState(true);

  // Load dynamic levels & grades from Firestore
  useEffect(() => {
    async function loadLevels() {
      try {
        const data = await getDocuments<CourseLevel>('courseLevels');
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCourseLevels(data);
      } catch {
        // Fallback to empty — hardcoded options will be used
      }
    }
    if (isOpen) loadLevels();
  }, [isOpen]);

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        parentName: editingStudent.parentName || '',
        parentEmail: editingStudent.parentEmail || '',
        parentPhone: editingStudent.parentPhone || '',
        course: editingStudent.course || 'Western Music',
        instrument: editingStudent.instrument || 'Keyboard',
        level: editingStudent.level || 'Pre Foundation Level',
        grade: editingStudent.grade || 'Initial Grade',
        photo: editingStudent.photo || '',
        initialPassword: '',
        status: editingStudent.status || 'active',
      });
      setNextIdPreview(editingStudent.studentId);
    } else {
      fetch('/api/admin/students/next-id')
        .then((res) => res.json())
        .then((data) => {
          if (data.nextId) setNextIdPreview(data.nextId);
        })
        .catch(() => setNextIdPreview('ASM101'));
    }
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Student name is required.');
      return;
    }
    if (!formData.parentEmail.trim()) {
      setError('Parent email is required for portal authentication & OTP recovery.');
      return;
    }

    setLoading(true);
    try {
      if (editingStudent?.id) {
        // Edit existing student
        const res = await fetch('/api/admin/students/update-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentDocId: editingStudent.id,
            updates: formData,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to update student');
        onSuccess({ ...editingStudent, ...formData } as any);
      } else {
        // Create new student with sequential ID
        const res = await fetch('/api/admin/students/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to create student');
        onSuccess({ id: data.id, studentId: data.studentId, ...formData } as any);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/70 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-surface dark:bg-[#0c1626] rounded-3xl shadow-2xl border border-border dark:border-white/10 p-5 sm:p-7 z-10 my-8 max-h-[90vh] overflow-y-auto animate-scale-in text-text-primary dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border dark:border-white/10 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg sm:text-xl text-text-primary dark:text-white">
                {editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
              </h3>
              <span className="text-xs font-bold tracking-wide px-2.5 py-0.5 rounded-full bg-violet/10 dark:bg-violet-500/20 text-violet dark:text-violet-300 border border-violet/20">
                {nextIdPreview}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Sequential Student ID is automatically generated and reserved
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-text-muted hover:text-text-primary dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-xs text-crimson flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section: Student Name & Photo */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-violet dark:text-violet-300 border-b border-border dark:border-white/5 pb-1">
              1. Student Name
            </h4>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>

              <div>
                <ImageUploader
                  label="Student Profile Picture"
                  folder="allwin_students"
                  currentImageUrl={formData.photo}
                  onUploadSuccess={(res) => setFormData({ ...formData, photo: res.secure_url })}
                />
              </div>
            </div>
          </div>

          {/* Section: Parent Contact */}
          <div className="space-y-3 pt-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-violet dark:text-violet-300 border-b border-border dark:border-white/5 pb-1">
              2. Parent / Guardian Contact (OTP Recovery)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g. Anand Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Parent Email (For OTP Login) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="parent@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => {
                    const phone = e.target.value;
                    const updates: Record<string, string> = { parentPhone: phone };
                    // Auto-fill password with phone number if user hasn't manually edited it
                    if (passwordAutoSynced && !editingStudent) {
                      updates.initialPassword = phone;
                    }
                    setFormData({ ...formData, ...updates });
                  }}
                  placeholder="9489203683"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
            </div>
          </div>

          {/* Section: Course & Instrument */}
          <div className="space-y-3 pt-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-violet dark:text-violet-300 border-b border-border dark:border-white/5 pb-1">
              3. Course, Instrument, Level & Grade
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Instrument
                </label>
                <select
                  value={formData.instrument}
                  onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                >
                  {INSTRUMENT_OPTIONS.map((inst) => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Course
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                >
                  <option value="Western Music">Western Music</option>
                  <option value="Classical Carnatic">Classical Carnatic</option>
                  <option value="Vocal Music">Vocal Music</option>
                  <option value="Bharatham Dance">Bharatham Dance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Level
                </label>
                {(() => {
                  const effectiveLevels = courseLevels.length > 0 ? courseLevels : DEFAULT_COURSE_LEVELS;
                  return (
                    <select
                      value={formData.level}
                      onChange={(e) => {
                        const newLevel = e.target.value;
                        // Auto-select first grade of the new level
                        const matchedLevel = effectiveLevels.find((l) => l.name === newLevel);
                        const firstGrade = matchedLevel?.grades?.sort((a, b) => a.order - b.order)?.[0]?.name || '';
                        setFormData({ ...formData, level: newLevel, grade: firstGrade || formData.grade });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                    >
                      {effectiveLevels.map((lvl) => (
                        <option key={lvl.name} value={lvl.name}>{lvl.name}</option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Grade
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => {
                    const newGrade = e.target.value;
                    setFormData({ ...formData, grade: newGrade });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                >
                  {(() => {
                    const effectiveLevels = courseLevels.length > 0 ? courseLevels : DEFAULT_COURSE_LEVELS;
                    const selectedLevel = effectiveLevels.find((l) => l.name === formData.level);
                    const levelGrades = selectedLevel?.grades?.sort((a, b) => a.order - b.order) || [];
                    const allAvailableGrades = Array.from(
                      new Set([
                        ...levelGrades.map((g) => g.name),
                        ...ALL_GRADES,
                      ])
                    );

                    return allAvailableGrades.map((gName) => (
                      <option key={gName} value={gName}>{gName}</option>
                    ));
                  })()}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Initial Password */}
          {!editingStudent && (
            <div className="space-y-3 pt-2">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-violet dark:text-violet-300 border-b border-border dark:border-white/5 pb-1">
                4. Initial Password
              </h4>

              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Password (Auto-filled with phone number)
                </label>
                <input
                  type="text"
                  value={formData.initialPassword}
                  onChange={(e) => {
                    setPasswordAutoSynced(false);
                    setFormData({ ...formData, initialPassword: e.target.value });
                  }}
                  placeholder={formData.parentPhone || formData.name || 'e.g. 9876543210'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet"
                />
                {passwordAutoSynced && formData.parentPhone && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                    <span>✓</span> Auto-filled with phone number
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Section: Enrollment Status (when editing) */}
          {editingStudent && (
            <div className="space-y-3 pt-2">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-violet dark:text-violet-300 border-b border-border dark:border-white/5 pb-1">
                4. Enrollment Status
              </h4>

              <div>
                <label className="block font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Student Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-violet font-semibold"
                >
                  <option value="active">Active (Enrolled & Attending Classes)</option>
                  <option value="relieved">Relieved (Left Academy — Preserves Past Records)</option>
                  <option value="inactive">Inactive / Discontinued</option>
                  <option value="paused">Paused (Temporary Leave)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Marking as <strong>Relieved</strong> excludes the student from active daily attendance rosters while preserving their past fee receipts and certificates.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-800 dark:text-white text-xs font-bold transition-all shadow-xs active:translate-y-0.5 active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading} size="sm">
              {loading ? 'Saving Student...' : editingStudent ? 'Update Details' : 'Enroll Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
