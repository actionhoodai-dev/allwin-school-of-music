// ============================================
// Admin: Bulk Class Attendance Marking Tool
// ============================================

'use client';

import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Save,
  Check,
  Users,
  Search,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import { collection, getDocs, query, where, addDoc, updateDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Student, AttendanceRecord, AttendanceStatus } from '@/types/student';
import { INSTRUMENT_OPTIONS } from '@/lib/constants';

export default function AdminBulkAttendancePage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedInstrument, setSelectedInstrument] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, { id?: string; status: AttendanceStatus; remarks?: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveAllLoading, setSaveAllLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadClassAndAttendance();
  }, [selectedDate]);

  async function loadClassAndAttendance() {
    setLoading(true);
    try {
      // 1. Fetch active students
      const studSnap = await getDocs(collection(db, 'students'));
      const studList = studSnap.docs
        .map((d) => ({ id: d.id, ...d.data() })) as Student[];
      setStudents(studList.filter((s) => s.status !== 'inactive'));

      // 2. Fetch existing attendance records for selectedDate
      const attQuery = query(
        collection(db, 'attendance'),
        where('date', '==', selectedDate)
      );
      const attSnap = await getDocs(attQuery);
      const map = new Map<string, { id?: string; status: AttendanceStatus; remarks?: string }>();

      attSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.studentId) {
          map.set(data.studentId, {
            id: d.id,
            status: data.status,
            remarks: data.remarks,
          });
        }
      });

      setAttendanceMap(map);
    } catch (err) {
      console.error('Error loading attendance roster:', err);
    } finally {
      setLoading(false);
    }
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStatusToggle = async (student: Student, targetStatus: AttendanceStatus) => {
    setSavingId(student.studentId);
    try {
      const docId = `att_${student.studentId}_${selectedDate}`;
      const attDocRef = doc(db, 'attendance', docId);

      await setDoc(attDocRef, {
        studentId: student.studentId,
        date: selectedDate,
        status: targetStatus,
        course: student.course || '',
        instrument: student.instrument || '',
        markedBy: 'admin',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const newMap = new Map(attendanceMap);
      newMap.set(student.studentId, { id: docId, status: targetStatus });

      // Only trigger notification alert if student is marked absent (routine presence does not need notification alerts)
      if (targetStatus === 'absent') {
        await addDoc(collection(db, 'notifications'), {
          studentId: student.studentId,
          title: 'Class Absence Recorded',
          message: `You were marked absent for class on ${selectedDate}. Contact the academy if this was an excused leave.`,
          type: 'attendance',
          read: false,
          link: '/student/attendance',
          createdAt: serverTimestamp(),
        });
      }

      setAttendanceMap(newMap);
      triggerToast(`Saved ${student.name} as ${targetStatus} ✓`);
    } catch (err) {
      console.error('Error updating status:', err);
      triggerToast('Error saving record');
    } finally {
      setSavingId(null);
    }
  };

  const handleMarkAllPresent = async () => {
    setSaveAllLoading(true);
    try {
      const newMap = new Map(attendanceMap);

      await Promise.all(
        filteredStudents.map(async (student) => {
          const docId = `att_${student.studentId}_${selectedDate}`;
          const attDocRef = doc(db, 'attendance', docId);

          await setDoc(attDocRef, {
            studentId: student.studentId,
            date: selectedDate,
            status: 'present',
            course: student.course || '',
            instrument: student.instrument || '',
            markedBy: 'admin',
            updatedAt: serverTimestamp(),
          }, { merge: true });

          newMap.set(student.studentId, { id: docId, status: 'present' });
        })
      );

      setAttendanceMap(newMap);
      triggerToast(`Marked ${filteredStudents.length} students Present ✓`);
    } catch (err) {
      console.error(err);
      triggerToast('Error during bulk mark');
    } finally {
      setSaveAllLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchFilter.toLowerCase().trim();
    const cleanDigits = q.replace(/\D/g, '');
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.parentPhone && (
        s.parentPhone.includes(q) ||
        (cleanDigits.length >= 3 && s.parentPhone.replace(/\D/g, '').includes(cleanDigits))
      )) ||
      s.studentId.toLowerCase().includes(q);

    const matchesInstrument =
      selectedInstrument === 'All' || s.instrument === selectedInstrument;

    const matchesCourse =
      selectedCourse === 'All' || s.course === selectedCourse;

    const isActive = !s.status || s.status === 'active';

    return matchesSearch && matchesInstrument && matchesCourse && isActive;
  });

  const presentCount = Array.from(attendanceMap.values()).filter((v) => v.status === 'present').length;
  const absentCount = Array.from(attendanceMap.values()).filter((v) => v.status === 'absent').length;

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Class Roster Attendance" />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-navy">
                Bulk Attendance Marker
              </h2>
              {toastMessage && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white animate-fade-in">
                  {toastMessage}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Select date, syllabus, and mark entire roster in 1 tap
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleMarkAllPresent}
              disabled={saveAllLoading || filteredStudents.length === 0}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveAllLoading ? 'Marking All...' : 'Mark Visible as Present'}</span>
            </button>
          </div>
        </div>

        {/* Date & Filter Controls */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-semibold">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-border font-bold text-navy focus:ring-2 focus:ring-violet"
            />
          </div>

          <div>
            <label className="block text-text-muted mb-1 font-semibold">Instrument</label>
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-navy"
            >
              <option value="All">All Instruments</option>
              {INSTRUMENT_OPTIONS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-muted mb-1 font-semibold">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-navy"
            >
              <option value="All">All Courses</option>
              <option value="Western Music">Western Music</option>
              <option value="Classical Carnatic">Classical Carnatic</option>
              <option value="Vocal Music">Vocal Music</option>
              <option value="Bharatham Dance">Bharatham Dance</option>
            </select>
          </div>

          <div>
            <label className="block text-text-muted mb-1 font-semibold">Search Student</label>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search student name or phone..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-border text-navy"
            />
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary px-1">
          <span>Date: <strong>{selectedDate}</strong></span>
          <span>•</span>
          <span className="text-emerald-700">Present: <strong>{presentCount}</strong></span>
          <span>•</span>
          <span className="text-rose-700">Absent: <strong>{absentCount}</strong></span>
          <span>•</span>
          <span>Total in Class: <strong>{filteredStudents.length}</strong></span>
        </div>

        {/* Student Roster Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-16 text-center text-text-muted">
              Loading class roster...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-border text-text-muted">
              No students match the chosen filters.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const record = attendanceMap.get(student.studentId);
              const status = record?.status;

              return (
                <div
                  key={student.id || student.studentId}
                  className={`p-4 rounded-2xl bg-white border transition-all shadow-sm flex flex-col justify-between gap-3.5 ${
                    status === 'present'
                      ? 'border-emerald-500/70 bg-emerald-50/20'
                      : status === 'absent'
                      ? 'border-rose-500/70 bg-rose-50/20'
                      : status === 'no_class'
                      ? 'border-slate-400 bg-slate-50/60'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  {/* Top Section: Badges & Name & Status */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="font-mono font-bold tracking-wide text-[11px] text-violet bg-violet/10 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                          {student.studentId}
                        </span>
                        <span
                          className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[170px]"
                          title={`${student.instrument} (${student.grade || 'Grade 1'})`}
                        >
                          {student.instrument} ({student.grade || 'Grade 1'})
                        </span>
                      </div>

                      {/* Current Status Pill */}
                      <div className="shrink-0">
                        {status === 'present' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Present
                          </span>
                        )}
                        {status === 'absent' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Absent
                          </span>
                        )}
                        {status === 'no_class' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                            No Class
                          </span>
                        )}
                        {!status && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Unmarked
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-heading font-bold text-base text-navy mt-2 truncate" title={student.name}>
                      {student.name}
                    </h4>
                  </div>

                  {/* 3 Status Action Buttons - Mobile friendly, easy to press with visible labels */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(student, 'present')}
                      disabled={savingId === student.studentId}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 touch-manipulation min-h-[42px] select-none ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600 ring-offset-1 font-extrabold'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                      }`}
                      title="Mark Present"
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${status === 'present' ? 'text-white' : 'text-emerald-600'}`} />
                      <span className="truncate">Present</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusToggle(student, 'absent')}
                      disabled={savingId === student.studentId}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 touch-manipulation min-h-[42px] select-none ${
                        status === 'absent'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600 ring-offset-1 font-extrabold'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                      }`}
                      title="Mark Absent"
                    >
                      <XCircle className={`w-4 h-4 shrink-0 ${status === 'absent' ? 'text-white' : 'text-rose-600'}`} />
                      <span className="truncate">Absent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusToggle(student, 'no_class')}
                      disabled={savingId === student.studentId}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 touch-manipulation min-h-[42px] select-none ${
                        status === 'no_class'
                          ? 'bg-slate-800 text-white shadow-md shadow-slate-800/25 ring-2 ring-slate-800 ring-offset-1 font-extrabold'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Mark No Class"
                    >
                      <MinusCircle className={`w-4 h-4 shrink-0 ${status === 'no_class' ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">No Class</span>
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
