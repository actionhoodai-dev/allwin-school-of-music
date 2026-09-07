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
  FileText,
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
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'normal' as any,
    attachmentUrl: '',
    published: true,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const snap = await getDocs(collection(db, 'announcements'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SchoolAnnouncement[];
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setAnnouncements(list);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f1f3f6] dark:bg-[#070d18] min-h-screen">
      <AdminHeader title="School Announcements" />

      <main className="p-6 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
              Academy Circulars & Notices
            </h2>
            <p className="text-xs text-slate-500">
              Broadcast circulars to all student portals and notification centers
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Announcement</span>
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-navy/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 z-10 shadow-2xl border border-border space-y-4">
              <h3 className="font-heading font-bold text-lg text-navy">New Academy Circular</h3>
              <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Trinity Grade Exam Schedule Announcement"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-border"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Notice details, instructions for students..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-border"
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
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm">Publish Notice</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-text-muted">Loading notices...</div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-border space-y-2">
              <Megaphone className="w-10 h-10 text-text-muted mx-auto opacity-40" />
              <h4 className="font-heading font-bold text-base text-navy">No Announcements</h4>
              <p className="text-xs text-text-muted">Create your first academy announcement.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-3xl bg-white border border-border shadow-xs flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-violet/10 text-violet">{ann.priority}</span>
                    <span className="text-xs text-text-muted">{ann.date}</span>
                  </div>
                  <h4 className="font-heading font-bold text-base text-navy">{ann.title}</h4>
                  <p className="text-xs text-text-secondary whitespace-pre-line">{ann.content}</p>
                </div>
                <button
                  onClick={async () => {
                    if (!ann.id) return;
                    await deleteDoc(doc(db, 'announcements', ann.id));
                    setAnnouncements(announcements.filter((x) => x.id !== ann.id));
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
