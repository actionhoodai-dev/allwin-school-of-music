// ============================================
// Student Portal: Trinity College London Hub (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  BookOpen,
  ChevronLeft,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ExamRecord } from '@/types/student';

export default function StudentTrinityExamPage() {
  const { student } = useStudentAuth();
  const [trinityExams, setTrinityExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.studentId) return;

    async function loadTrinityData() {
      try {
        const q = query(
          collection(db, 'examDetails'),
          where('studentId', '==', student!.studentId),
          where('board', '==', 'Trinity College London')
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ExamRecord[];
        setTrinityExams(list);
      } catch (err) {
        console.error('Error fetching Trinity exams:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTrinityData();
  }, [student?.studentId]);

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <Link
          href="/student/exams"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 shadow-sm hover:bg-slate-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Trinity College London
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Western Music Grade Examination Portal
          </p>
        </div>
      </div>

      {/* Hero Badge — Clean White Card with Flipkart Blue Accent */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#fff7e6] text-[#b78103] border border-[#ffd591]">
            Trinity Affiliated Since 2007
          </span>
        </div>

        <h3 className="font-bold text-xl sm:text-2xl text-slate-900">
          Grade Exam Preparation
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-medium">Candidate</span>
            <span className="font-bold text-slate-900 truncate block">{student?.name}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-medium">Instrument</span>
            <span className="font-bold text-slate-900">{student?.instrument}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-medium">Current Grade</span>
            <span className="font-bold text-slate-900">{student?.grade || 'Initial Grade'}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-800 block text-[10px] font-bold">Exam Status</span>
            <span className="font-bold text-emerald-700">Enrolled</span>
          </div>
        </div>
      </div>

      {/* Trinity Components Guide */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2874f0]" />
          <span>Trinity Exam Assessment Pillars</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">1. Selected Pieces (66 Marks)</span>
            <p className="text-[11px] text-slate-600 font-medium">3 performance pieces from the official Trinity repertoire book.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">2. Technical Work (14 Marks)</span>
            <p className="text-[11px] text-slate-600 font-medium">Scales, arpeggios, broken chords, and technical exercises.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">3. Supporting Tests (20 Marks)</span>
            <p className="text-[11px] text-slate-600 font-medium">Sight reading, aural tests, improvisation, or musical knowledge.</p>
          </div>
        </div>
      </div>

      {/* Trinity Exam Entries for this student */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
          Registered Trinity Sessions
        </h3>

        {trinityExams.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-500 font-medium">
            No specific Trinity session booked yet. Your instructor will notify you before registration windows open.
          </div>
        ) : (
          trinityExams.map((exam) => (
            <div
              key={exam.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    {exam.examName} ({exam.grade})
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Session: {exam.session || 'Upcoming Assessment'}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {exam.registrationStatus || 'Registered'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
