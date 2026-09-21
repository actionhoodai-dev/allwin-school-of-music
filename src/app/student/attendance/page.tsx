// ============================================
// Student Portal: Attendance Calendar & Records (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import AttendanceCalendar from '@/components/student/AttendanceCalendar';
import AttendanceStats from '@/components/student/AttendanceStats';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AttendanceRecord } from '@/types/student';
import { CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';

export default function StudentAttendancePage() {
  const { student, markSectionViewed } = useStudentAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear the unread badge when parent opens this section
  useEffect(() => {
    markSectionViewed('attendance');
  }, []);

  useEffect(() => {
    if (!student?.studentId) return;

    async function loadAttendance() {
      try {
        const q = query(
          collection(db, 'attendance'),
          where('studentId', '==', student!.studentId)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AttendanceRecord[];
        setRecords(list);
      } catch (err) {
        console.error('Error fetching attendance records:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, [student?.studentId]);

  // Deduplicate records by unique date to ensure exact distinct-day counts
  const distinctRecords = Array.from(
    records.reduce((map, record) => {
      if (record.date) {
        map.set(record.date, record);
      }
      return map;
    }, new Map<string, AttendanceRecord>()).values()
  );

  // Total statistics computed on unique marked class dates
  const totalClasses = distinctRecords.filter((r) => r.status !== 'no_class').length;
  const presentCount = distinctRecords.filter((r) => r.status === 'present').length;
  const absentCount = distinctRecords.filter((r) => r.status === 'absent').length;
  const percentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 100;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Title & Badge */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Attendance Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live attendance tracking for {student?.name || 'Student'} ({student?.studentId})
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified</span>
        </div>
      </div>

      {/* Prominent Attendance & Compensation Policy at Top */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 border border-amber-200/90 shadow-sm text-xs text-slate-700 space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-amber-200/60 pb-2">
          <Sparkles className="w-4 h-4 text-[#fb641b]" />
          <span>Attendance & Compensation Policy</span>
        </div>

        <p className="font-medium text-slate-800 leading-relaxed">
          Students are expected to maintain an attendance of at least <strong>80%</strong> to be eligible for annual Trinity College London exam certifications and grade promotions.
        </p>

        <div className="space-y-1.5 pt-1">
          <h4 className="font-bold text-slate-900 text-xs tracking-wide uppercase text-[11px]">
            Class Attendance &amp; Compensation Policy
          </h4>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 font-medium pl-1 leading-relaxed">
            <li>The monthly fee is based on the monthly class schedule.</li>
            <li>Whether 8, 9, or 10 classes are conducted in a month, the number of classes will not be calculated separately, and no additional fee will be charged.</li>
            <li>If a student misses a class due to leave, absence, or personal reasons, no compensation class will be provided.</li>
            <li>If additional classes are conducted in a particular month, they will be considered as adjustment for any missed classes.</li>
          </ul>
        </div>
      </div>

      {/* Summary Statistics */}
      <AttendanceStats
        totalClasses={totalClasses}
        presentCount={presentCount}
        absentCount={absentCount}
        percentage={percentage}
        monthName="Overall Term"
      />

      {/* Custom Touch-Friendly Interactive Calendar */}
      <div className="space-y-2">
        <AttendanceCalendar records={records} readOnly={true} />
      </div>
    </div>
  );
}
