// ============================================
// Student Portal: Exams Hub & Registrations (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  GraduationCap,
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ExamRecord } from '@/types/student';

export default function StudentExamsPage() {
  const { student, markSectionViewed } = useStudentAuth();
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear the unread badge when parent opens this section
  useEffect(() => {
    markSectionViewed('exams');
  }, []);

  useEffect(() => {
    if (!student?.studentId) return;

    async function loadExams() {
      try {
        const q = query(
          collection(db, 'examDetails'),
          where('studentId', '==', student!.studentId)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ExamRecord[];
        setExams(list);
      } catch (err) {
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExams();
  }, [student?.studentId]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Title & Quick Links */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Grade Examinations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trinity College London & international music board assessments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/exams/trinity"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-[#2874f0] border border-blue-100 text-xs font-bold hover:bg-blue-100 transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Trinity Hub</span>
          </Link>
          <Link
            href="/student/exams/fees"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Exam Fees</span>
          </Link>
        </div>
      </div>

      {/* Featured Trinity Banner — Clean White Card with Flipkart Blue Accent */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-[#fff7e6] text-[#b78103] border border-[#ffd591]">
            Official Exam Center
          </span>
        </div>

        <h3 className="font-bold text-lg sm:text-xl text-slate-900">
          Trinity College London Assessments
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
          Allwin School of Music prepares students for Trinity College London Practical & Theory examinations with structured syllabi, technical exercises, pieces, and mock viva-voce tests.
        </p>

        <div className="pt-1">
          <Link
            href="/student/exams/trinity"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2874f0] text-white font-bold text-xs hover:bg-blue-600 transition-all shadow-sm active:scale-95"
          >
            <span>Open Dedicated Trinity Exam Hub</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Student Registered Exams List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
          Your Exam Entries & Registrations
        </h3>

        {exams.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">
              No Exams Registered Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              When your faculty schedules a grade examination or Trinity session for your instrument, official registration details and dates will appear here.
            </p>
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2874f0] border border-blue-100">
                      {exam.board || 'Trinity College London'}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {exam.grade}
                    </span>
                  </div>
                  <h4 className="font-bold text-base sm:text-lg text-slate-900 mt-1.5">
                    {exam.examName}
                  </h4>
                </div>

                <div className="shrink-0">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    exam.registrationStatus === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-[#2874f0] border border-blue-200'
                  }`}>
                    {exam.registrationStatus === 'registered' ? 'Registered ✓' : (exam.registrationStatus || 'In Preparation')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                {exam.examDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2874f0] shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Exam Date</span>
                      <span className="font-bold text-slate-900">{exam.examDate}</span>
                    </div>
                  </div>
                )}

                {exam.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Venue</span>
                      <span className="font-bold text-slate-900">{exam.venue}</span>
                    </div>
                  </div>
                )}

                {exam.candidateNumber && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Candidate No.</span>
                      <span className="font-bold tracking-wide text-slate-900">{exam.candidateNumber}</span>
                    </div>
                  </div>
                )}
              </div>

              {exam.instructions && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                    Exam Instructions:
                  </span>
                  <p className="text-slate-600 font-medium">
                    {exam.instructions}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
