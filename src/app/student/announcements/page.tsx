// ============================================
// Student Portal: School Announcements (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  Megaphone,
  Calendar,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { SchoolAnnouncement } from '@/types/student';

export default function StudentAnnouncementsPage() {
  const { student, markSectionViewed } = useStudentAuth();
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear the unread badge when student opens this section
  useEffect(() => {
    markSectionViewed('announcements');
  }, [markSectionViewed]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const q = query(
          collection(db, 'announcements'),
          where('published', '==', true)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SchoolAnnouncement[];
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setAnnouncements(list);

        // Store these IDs as read for this student
        if (student?.studentId) {
          localStorage.setItem(
            `allwin_read_announcements_${student.studentId}`,
            JSON.stringify(list.map((a) => a.id))
          );
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, [student?.studentId]);

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
      {/* Title */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Academy Notices & Circulars
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official holidays, upcoming recitals, exam dates, and masterclasses
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#fb641b] border border-orange-200 text-xs font-bold">
          <Megaphone className="w-4 h-4" />
          <span>Circulars</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">
              No Active Notices
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              School circulars and event schedules will appear here.
            </p>
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md ${
                    item.priority === 'urgent'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : item.priority === 'important'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-[#2874f0] border border-blue-100'
                  }`}>
                    {item.priority ? item.priority.toUpperCase() : 'NOTICE'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.date}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed font-medium">
                {item.content}
              </p>

              {item.attachmentUrl && (
                <div className="pt-2">
                  <a
                    href={item.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2874f0] hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Circular Attachment</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
