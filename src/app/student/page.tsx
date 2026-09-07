// ============================================
// Student Portal Main Dashboard (Flipkart / Amazon Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Megaphone,
  User,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import QuickActionGrid from '@/components/student/QuickActionGrid';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type {
  AttendanceRecord,
  StudentFeeItem,
  ClassScheduleItem,
  SchoolAnnouncement,
  ProgressReport,
} from '@/types/student';

export default function StudentDashboardPage() {
  const { student, sectionBadges, markSectionViewed } = useStudentAuth();

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<StudentFeeItem[]>([]);
  const [schedule, setSchedule] = useState<ClassScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>([]);
  const [latestReport, setLatestReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.studentId) return;

    async function loadDashboardData() {
      try {
        const studentId = student!.studentId;

        // 1. Attendance records
        const attQuery = query(
          collection(db, 'attendance'),
          where('studentId', '==', studentId)
        );
        const attSnap = await getDocs(attQuery).catch(() => ({ docs: [] } as any));
        const attList = attSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setAttendanceRecords(attList);

        // 2. Fees
        const feeQuery = query(
          collection(db, 'fees'),
          where('studentId', '==', studentId)
        );
        const feeSnap = await getDocs(feeQuery).catch(() => ({ docs: [] } as any));
        const feeList = feeSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setFees(feeList);

        // 3. Schedules
        const schedQuery = query(
          collection(db, 'schedules'),
          where('active', '==', true)
        );
        const schedSnap = await getDocs(schedQuery).catch(() => ({ docs: [] } as any));
        const schedList = schedSnap.docs
          .map((d: any) => ({ id: d.id, ...d.data() }))
          .filter(
            (s: any) =>
              !s.studentId ||
              s.studentId === studentId ||
              s.course === student?.course ||
              s.instrument === student?.instrument
          );
        setSchedule(schedList);

        // 4. Progress / Latest Grade Evaluation
        const progQuery = query(
          collection(db, 'progressReports'),
          where('studentId', '==', studentId),
          limit(1)
        );
        const progSnap = await getDocs(progQuery).catch(() => ({ docs: [] } as any));
        if (!progSnap.empty) {
          setLatestReport({ id: progSnap.docs[0].id, ...progSnap.docs[0].data() } as ProgressReport);
        }

        // 5. Announcements
        const annQuery = query(
          collection(db, 'announcements'),
          where('published', '==', true),
          limit(3)
        );
        const annSnap = await getDocs(annQuery).catch(() => ({ docs: [] } as any));
        const annList = annSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setAnnouncements(annList);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [student?.studentId, student?.course, student?.instrument]);

  // Attendance calculations (deduplicated by distinct dates)
  const distinctAttendance = Array.from(
    attendanceRecords.reduce((map, r) => {
      if (r.date) map.set(r.date, r);
      return map;
    }, new Map<string, AttendanceRecord>()).values()
  );
  const totalClasses = distinctAttendance.filter((r) => r.status !== 'no_class').length;
  const presentCount = distinctAttendance.filter((r) => r.status === 'present').length;
  const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 100;

  // Latest fee record
  const pendingFee = fees.find((f) => f.status === 'pending' || f.status === 'overdue');

  return (
    <div className="space-y-4">
      {/* Student Welcome & Profile Hero Card — Flipkart Blue & Gold Accent */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Student Photo */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 aspect-square rounded-2xl bg-blue-50 border-2 border-blue-200 p-0.5 overflow-hidden shrink-0 shadow-sm">
              {student?.photo ? (
                <Image
                  src={student.photo}
                  alt={student.name || 'Student'}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="rounded-xl object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#2874f0] text-white">
                  <User className="w-8 h-8" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#fff7e6] text-[#b78103] border border-[#ffd591]">
                  {student?.studentId || 'ASM101'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {student?.status === 'active' ? 'Active Learner' : 'Enrolled'}
                </span>
              </div>

              <h2 className="font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
                Welcome back, {student?.name?.split(' ')[0] || 'Student'}
              </h2>

              <p className="text-xs text-slate-600 font-medium">
                {student?.instrument || 'Keyboard'} • {student?.course || 'Western Music'} • {student?.grade || 'Grade 1'}
              </p>
            </div>
          </div>

          {/* Quick Profile View Link */}
          <Link
            href="/student/profile"
            className="px-4 py-2 rounded-xl bg-[#2874f0] hover:bg-blue-600 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95"
          >
            <span>View Profile</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Attendance */}
        <Link
          href="/student/attendance"
          onClick={() => markSectionViewed('attendance')}
          className="relative p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all active:scale-95"
        >
          {(sectionBadges?.attendance || 0) > 0 && (
            <span className="absolute top-2.5 right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#fb641b] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
              {(sectionBadges?.attendance || 0) > 9 ? '9+' : sectionBadges?.attendance}
            </span>
          )}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Attendance</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {attendancePercentage.toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {presentCount} / {totalClasses} classes
          </p>
        </Link>

        {/* Current Grade & Level */}
        <Link
          href="/student/progress"
          onClick={() => markSectionViewed('progress')}
          className="relative p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all active:scale-95"
        >
          {(sectionBadges?.progress || 0) > 0 && (
            <span className="absolute top-2.5 right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#fb641b] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
              {(sectionBadges?.progress || 0) > 9 ? '9+' : sectionBadges?.progress}
            </span>
          )}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Current Grade</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#2874f0] border border-blue-100">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 truncate">
            {student?.grade || 'Grade 1'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            Level: {student?.level || 'Beginner'}
          </p>
        </Link>

        {/* Course & Instrument */}
        <Link
          href="/student/profile"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all active:scale-95"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Instrument</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 truncate">
            {student?.instrument || 'Keyboard'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {student?.course || 'Western Music'}
          </p>
        </Link>

        {/* Fee Status */}
        <Link
          href="/student/fees"
          onClick={() => markSectionViewed('fees')}
          className="relative p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all active:scale-95"
        >
          {(sectionBadges?.fees || 0) > 0 && (
            <span className="absolute top-2.5 right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#fb641b] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
              {(sectionBadges?.fees || 0) > 9 ? '9+' : sectionBadges?.fees}
            </span>
          )}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Fees Status</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold">
            {pendingFee ? (
              <span className="text-[#fb641b]">₹{pendingFee.amount} Due</span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1">
                <span>Paid</span>
                <CheckCircle2 className="w-4 h-4 inline" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {pendingFee ? pendingFee.title : 'Tuition up to date'}
          </p>
        </Link>
      </div>

      {/* Class Schedule Highlight */}
      {schedule.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2874f0]" />
              <h3 className="font-bold text-sm text-slate-900">
                Weekly Class Schedule
              </h3>
            </div>
            <Link
              href="/student/schedule"
              className="text-xs font-bold text-[#2874f0] hover:underline"
            >
              Full Timetable →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {schedule.slice(0, 2).map((item) => (
              <div
                key={item.id || item.dayOfWeek}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#2874f0] font-bold">
                      {item.dayOfWeek}
                    </span>
                    <span>{item.instrument}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#2874f0]" />
                      {item.time} {item.endTime ? `– ${item.endTime}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Grid with Update Badges */}
      <QuickActionGrid />

      {/* Latest Announcements */}
      {announcements.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#fb641b]" />
              <h3 className="font-bold text-sm text-slate-900">
                Academy Notices & Updates
              </h3>
            </div>
            <Link
              href="/student/announcements"
              onClick={() => markSectionViewed('announcements')}
              className="text-xs font-bold text-[#2874f0] hover:underline"
            >
              All Notices →
            </Link>
          </div>

          <div className="space-y-2">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {ann.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 shrink-0 font-medium">{ann.date}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
