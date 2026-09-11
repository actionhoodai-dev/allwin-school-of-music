// ============================================
// Admin: School Announcements & Notices Manager
// ============================================

'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  X,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import ImageUploader from '@/components/admin/ImageUploader';
import Button from '@/components/ui/Button';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { SchoolAnnouncement } from '@/types/student';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SchoolAnnouncement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    attachmentUrl: '',
    published: true,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function loadAnnouncements() {
    try {
      const snap = await getDocs(collection(db, 'announcements'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SchoolAnnouncement[];
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setAnnouncements(list);
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load announcements.' });
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      // Push a notification visible to ALL students so badges light up
      await addDoc(collection(db, 'notifications'), {
        studentId: 'ALL',
        title: 'New Academy Announcement',
        message: formData.title,
        type: 'announcement',
        read: false,
        link: '/student/announcements',
        createdAt: serverTimestamp(),
      });

      setAnnouncements((prev) => [{ id: docRef.id, ...formData }, ...prev]);
      setShowModal(false);
      setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        priority: 'normal',
        attachmentUrl: '',
        published: true,
      });
      setToast({ type: 'success', message: 'Announcement published successfully!' });
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to create announcement.' });
    }
  };

  const handleDelete = async (ann: SchoolAnnouncement) => {
    if (!ann.id) return;
    setDeletingId(ann.id);
    try {
      await deleteDoc(doc(db, 'announcements', ann.id));
      setAnnouncements((prev) => prev.filter((x) => x.id !== ann.id));
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Announcement deleted successfully.' });
    } catch (err: any) {
      console.error('Delete error:', err);
      setToast({ type: 'error', message: 'Error deleting announcement. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1f3f6] min-h-screen">
      <AdminHeader title="School Announcements" />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce-in max-w-sm">
          <div
            className={`p-3.5 rounded-2xl shadow-lg border flex items-center gap-3 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="p-4 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-5 h-5 text-[#2874f0]" />
              <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
                Academy Circulars & Notices
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Broadcast circulars to student portals and manage published announcements
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Announcement</span>
          </button>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-lg text-slate-900">
                  New Academy Circular
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Trinity Grade Exam Schedule Announcement"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] outline-none font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2874f0] outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2874f0] outline-none font-medium"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Notice details, instructions for students..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2874f0] outline-none font-medium"
                  />
                </div>
                <div>
                  <ImageUploader
                    label="Notice Circular / Image Attachment (Optional)"
                    folder="allwin_announcements"
                    currentImageUrl={formData.attachmentUrl}
                    onUploadSuccess={(res) => setFormData({ ...formData, attachmentUrl: res.secure_url })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs border border-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">
                    Publish Notice
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !deletingId && setDeleteTarget(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 z-10 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Delete Announcement?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <p className="font-bold text-slate-900">{deleteTarget.title}</p>
                <p className="text-slate-500 mt-1 line-clamp-2">{deleteTarget.content}</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={Boolean(deletingId)}
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={Boolean(deletingId)}
                  onClick={() => handleDelete(deleteTarget)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  {deletingId ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Notice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List of Announcements */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">
              Loading notices...
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-base text-slate-900">
                No Announcements Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No announcements have been published. Tap &ldquo;+ Create Announcement&rdquo; to notify students and parents.
              </p>
            </div>
          ) : (
            announcements.map((ann) => {
              const isUrgent = ann.priority === 'urgent';
              const isImportant = ann.priority === 'important';

              return (
                <div
                  key={ann.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:border-slate-300"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isUrgent
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isImportant
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {ann.priority || 'normal'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {ann.date}
                      </span>
                      {ann.attachmentUrl && (
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Attachment
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-slate-900">
                      {ann.title}
                    </h4>

                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {ann.content}
                    </p>

                    {ann.attachmentUrl && (
                      <div className="pt-2">
                        <a
                          href={ann.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#2874f0] font-semibold hover:underline"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>View attached notice</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Button: Touch friendly for mobile */}
                  <div className="flex sm:flex-col items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(ann)}
                      className="w-full sm:w-auto px-3.5 py-2 sm:p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all flex items-center justify-center gap-1.5 active:scale-95 text-xs font-bold"
                      aria-label={`Delete announcement: ${ann.title}`}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span className="sm:hidden">Delete Notice</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
