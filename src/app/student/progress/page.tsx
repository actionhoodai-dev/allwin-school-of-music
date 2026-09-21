// ============================================
// Student Portal: Progress & Evaluation Reports (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ProgressReport } from '@/types/student';

export default function StudentProgressPage() {
  const { student, markSectionViewed } = useStudentAuth();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear the unread badge when parent opens this section
  useEffect(() => {
    markSectionViewed('progress');
  }, []);

  useEffect(() => {
    if (!student?.studentId) return;

    async function loadReports() {
      try {
        const q = query(
          collection(db, 'progressReports'),
          where('studentId', '==', student!.studentId)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProgressReport[];
        list.sort((a, b) => (b.assessmentDate || '').localeCompare(a.assessmentDate || ''));
        setReports(list);
      } catch (err) {
        console.error('Error fetching progress reports:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [student?.studentId]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Title */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Progress & Evaluations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periodic assessments, teacher appraisals, and official reports
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2874f0] border border-blue-200 text-xs font-bold">
          <Trophy className="w-4 h-4" />
          <span>{student?.grade || 'Initial Grade'}</span>
        </div>
      </div>

      {/* Grade Snapshot Card — White with Blue Border & Amber Accents */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#b78103] bg-[#fff7e6] px-2 py-0.5 rounded-md border border-[#ffd591]">
            Current Level Overview
          </span>
          <h3 className="font-bold text-xl sm:text-2xl text-slate-900 mt-1">
            {student?.instrument} — {student?.grade || 'Initial Grade'}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Curriculum Level: <strong className="text-slate-800">{student?.level || 'Pre Foundation Level'}</strong> • Course: {student?.course || 'Western Music'}
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block">
            Academic Status
          </span>
          <span className="text-sm font-bold text-emerald-700">
            Progressing Well
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">
              No Progress Reports Published Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Quarterly assessments and teacher evaluations will appear here once entered by the faculty.
            </p>
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
            >
              {/* Header with Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#2874f0] border border-blue-100 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Class Date: {rep.assessmentDate}</span>
                  </span>
                </div>

                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {student?.instrument} • {student?.grade || 'Current Grade'}
                </span>
              </div>

              {/* 3 Custom Evaluation Fields */}
              <div className="space-y-3">
                {rep.todaysClass && (
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#2874f0]" />
                      <span>Today&apos;s Class</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium pl-3.5">
                      {rep.todaysClass}
                    </p>
                  </div>
                )}

                {rep.practiceWork && (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Practice Work / Assignments</span>
                    </div>
                    <p className="text-amber-950 leading-relaxed font-medium pl-3.5">
                      {rep.practiceWork}
                    </p>
                  </div>
                )}

                {rep.songsCovered && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Songs Covered</span>
                    </div>
                    <p className="text-emerald-950 leading-relaxed font-medium pl-3.5">
                      {rep.songsCovered}
                    </p>
                  </div>
                )}
              </div>

              {/* Legacy Evaluation / Overview fallback */}
              {!rep.todaysClass && !rep.practiceWork && !rep.songsCovered && rep.evaluation && (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {rep.evaluation}
                </p>
              )}

              {/* Legacy Strengths & Areas for Improvement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rep.strengths && rep.strengths.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Key Strengths</span>
                    </div>
                    <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside font-medium">
                      {rep.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rep.areasToImprove && rep.areasToImprove.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Areas for Growth</span>
                    </div>
                    <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside font-medium">
                      {rep.areasToImprove.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Download Report File */}
              {rep.reportFileUrl && (
                <div className="pt-1">
                  <a
                    href={rep.reportFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2874f0] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Progress Report (PDF/Image)</span>
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
