// ============================================
// Student Portal: Certificates & Achievements (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  Award,
  Download,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { StudentAchievementItem } from '@/types/student';

export default function StudentAchievementsPage() {
  const { student, markSectionViewed } = useStudentAuth();
  const [achievements, setAchievements] = useState<StudentAchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear the unread badge when parent opens this section
  useEffect(() => {
    markSectionViewed('achievements');
  }, []);

  useEffect(() => {
    if (!student?.studentId) return;

    async function loadAchievements() {
      try {
        const q = query(
          collection(db, 'studentAchievements'),
          where('studentId', '==', student!.studentId)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as StudentAchievementItem[];
        setAchievements(list);
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, [student?.studentId]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Title */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Certificates & Achievements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Grade examination laurels, concert performances, and recognitions
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
          <Award className="w-4 h-4" />
          <span>Awards</span>
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.length === 0 ? (
          <div className="sm:col-span-2 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">
              No Certificates Logged Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Certificates from Trinity College London assessments, school concerts, and competitions will be displayed here.
            </p>
          </div>
        ) : (
          achievements.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    {item.category?.replace('_', ' ') || 'Milestone'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{item.date}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium">
                  {item.description}
                </p>

                {item.issuedBy && (
                  <p className="text-[11px] text-slate-500 font-medium">
                    Issued by: <span className="text-slate-800 font-semibold">{item.issuedBy}</span>
                  </p>
                )}
              </div>

              {item.certificateUrl && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                    <Image
                      src={item.certificateUrl}
                      alt={item.title || 'Certificate'}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                  <a
                    href={item.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2874f0] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download Official Certificate</span>
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
