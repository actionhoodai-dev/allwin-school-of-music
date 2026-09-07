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

      {/* Informative Note for Parents */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <Sparkles className="w-4 h-4 text-[#fb641b]" />
          <span>Attendance Policy</span>
        </div>
        <p>
          Students are expected to maintain an attendance of at least 80% to be eligible for annual Trinity College London exam certifications and grade promotions.
        </p>
      </div>
    </div>
  );
}
