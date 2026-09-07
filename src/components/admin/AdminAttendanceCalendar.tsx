// ============================================
// Interactive Admin Attendance Calendar (Tap-to-Mark & Auto-Save)
// ============================================

'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Save,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, addDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AttendanceRecord, AttendanceStatus } from '@/types/student';

interface AdminAttendanceCalendarProps {
  studentId: string; // ASM101
  studentName?: string;
  course?: string;
  instrument?: string;
  records: AttendanceRecord[];
  onRecordChange: (updatedRecords: AttendanceRecord[]) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function AdminAttendanceCalendar({
  studentId,
  studentName,
  course,
  instrument,
  records,
  onRecordChange,
}: AdminAttendanceCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Action Sheet / Modal state
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalStatus, setModalStatus] = useState<AttendanceStatus>('present');
  const [modalRemarks, setModalRemarks] = useState('');
  const [savingModal, setSavingModal] = useState(false);

  // Map records by date
  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    records.forEach((r) => {
      if (r.date) map.set(r.date, r);
    });
    return map;
  }, [records]);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    let firstWeekday = firstDayOfMonth.getDay() - 1;
    if (firstWeekday === -1) firstWeekday = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    const prevDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      prevDays.push({ day: d, dateStr, isCurrentMonth: false });
    }

    const currentDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const m = currentMonth + 1;
      const dateStr = `${currentYear}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      currentDays.push({ day: i, dateStr, isCurrentMonth: true });
    }

    const totalSlots = Math.ceil((prevDays.length + currentDays.length) / 7) * 7;
    const nextDaysNeeded = totalSlots - (prevDays.length + currentDays.length);
    const nextDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      nextDays.push({ day: i, dateStr, isCurrentMonth: false });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentYear, currentMonth]);

  // Flash "Saved ✓" toast
  const triggerSavedToast = (msg = 'Saved ✓') => {
    setSaveStatus(msg);
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  };

  // Save or update attendance in Firestore
  const saveAttendanceRecord = async (dateStr: string, status: AttendanceStatus, remarks = '') => {
    try {
      // Deterministic document ID to prevent duplicate records for the same student on the same day
      const docId = `att_${studentId}_${dateStr}`;
      const attDocRef = doc(db, 'attendance', docId);

      const recordData = {
        studentId,
        date: dateStr,
        status,
        course: course || '',
        instrument: instrument || '',
        remarks: remarks || '',
        markedBy: 'admin',
        updatedAt: serverTimestamp(),
      };

      await setDoc(attDocRef, recordData, { merge: true });

      // Deduplicate in-memory state cleanly by date
      const updatedMap = new Map<string, AttendanceRecord>();
      records.forEach((r) => {
        if (r.date) updatedMap.set(r.date, r);
      });
      updatedMap.set(dateStr, {
        id: docId,
        studentId,
        date: dateStr,
        status,
        remarks,
        course,
        instrument,
      });

      const updatedList = Array.from(updatedMap.values());

      // Push in-app notification so parent sees attendance update badge
      await addDoc(collection(db, 'notifications'), {
        studentId,
        title: 'Attendance Updated',
        message: `Attendance marked as ${status.toUpperCase()} for ${dateStr}.`,
        type: 'attendance',
        read: false,
        link: '/student/attendance',
        createdAt: serverTimestamp(),
      });

      onRecordChange(updatedList);
      triggerSavedToast();
    } catch (err) {
      console.error('Error saving attendance:', err);
      triggerSavedToast('Save failed!');
    }
  };

  // Day click logic:
  // 1st click on an unmarked day -> auto-marks "Present" and saves immediately.
  // Click on an already marked day -> opens status modal/sheet to adjust.
  const handleDateClick = async (dateStr: string) => {
    const existing = recordsByDate.get(dateStr);

    if (!existing) {
      // First tap on unmarked date -> instant Present + Auto Save
      await saveAttendanceRecord(dateStr, 'present');
    } else {
      // Already marked -> open status selector modal
      setModalDate(dateStr);
      setModalStatus(existing.status);
      setModalRemarks(existing.remarks || '');
    }
  };

  const handleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDate) return;
    setSavingModal(true);
    await saveAttendanceRecord(modalDate, modalStatus, modalRemarks);
    setSavingModal(false);
    setModalDate(null);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="w-full max-w-[502px] bg-[#FFFFFF] rounded-[16px] border border-[#D5D4DF] shadow-sm p-5 sm:p-[30px] flex flex-col gap-[12px] select-none mx-auto lg:mx-0">
      {/* Top Header with Month Navigator & Auto-Save Toast */}
      <div className="flex flex-row justify-between items-center w-full min-h-[46px]">
        <div>
          <h3 className="font-heading font-black text-[20px] sm:text-[24px] leading-tight text-[#000000]">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          {saveStatus && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white animate-fade-in shadow-xs mt-1">
              <Check className="w-3 h-3" />
              <span>{saveStatus}</span>
            </span>
          )}
        </div>

        {/* Frame 9 (Chevrons) */}
        <div className="flex flex-row items-center gap-[8px]">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-[46px] h-[46px] rounded-xl border border-[#D5D4DF] bg-[#FFFFFF] hover:bg-slate-50 flex items-center justify-center text-[#000000] cursor-pointer transition-all active:scale-95 shadow-2xs"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-[46px] h-[46px] rounded-xl border border-[#D5D4DF] bg-[#FFFFFF] hover:bg-slate-50 flex items-center justify-center text-[#000000] cursor-pointer transition-all active:scale-95 shadow-2xs"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Weekday headers: Mo, Tu, We, Th, Fr, Sa, Su */}
      <div className="grid grid-cols-7 w-full text-center">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-[36px] sm:h-[44px] flex items-center justify-center font-semibold text-[14px] leading-[17px] text-[#000000]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid with #D5D4DF border grid */}
      <div className="grid grid-cols-7 border-t border-l border-[#D5D4DF] w-full rounded-lg overflow-hidden">
        {calendarDays.map((item, index) => {
          const rec = recordsByDate.get(item.dateStr);
          const isToday = item.dateStr === todayStr;
          const isActive = modalDate === item.dateStr;

          // Inactive days (outside current month): #F2F3F7 bg, #A8A8A8 text
          if (!item.isCurrentMonth) {
            return (
              <div
                key={`${item.dateStr}-${index}`}
                className="h-[52px] sm:h-[64px] border-r border-b border-[#D5D4DF] bg-[#F2F3F7] text-[#A8A8A8] flex flex-col items-center justify-center font-normal text-[14px] leading-[17px]"
              >
                <span>{item.day}</span>
              </div>
            );
          }

          let cellStyle = 'bg-[#FFFFFF] text-[#000000] hover:bg-slate-50';
          let textColor = 'text-[#000000] font-normal';
          let dot = null;

          if (isActive) {
            // Figma Active day: #45539D background, #FFFFFF text
            cellStyle = 'bg-[#45539D] text-[#FFFFFF] font-semibold';
            textColor = 'text-[#FFFFFF] font-semibold';
          } else if (rec?.status === 'present') {
            cellStyle = 'bg-emerald-50/70 text-emerald-950 hover:bg-emerald-100/70 font-medium';
            textColor = 'text-emerald-950 font-semibold';
            dot = <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />;
          } else if (rec?.status === 'absent') {
            cellStyle = 'bg-rose-50/70 text-rose-950 hover:bg-rose-100/70 font-medium';
            textColor = 'text-rose-950 font-semibold';
            dot = <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-0.5" />;
          } else if (rec?.status === 'no_class') {
            cellStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
            textColor = 'text-slate-700';
            dot = <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-0.5" />;
          }

          return (
            <button
              key={`${item.dateStr}-${index}`}
              type="button"
              onClick={() => handleDateClick(item.dateStr)}
              className={`h-[52px] sm:h-[64px] border-r border-b border-[#D5D4DF] flex flex-col items-center justify-center relative cursor-pointer transition-all active:scale-95 ${cellStyle} ${
                isToday && !isActive ? 'ring-2 ring-inset ring-[#45539D]/70' : ''
              }`}
            >
              <span className={`text-[14px] leading-[17px] ${textColor}`}>{item.day}</span>
              {dot && <div className="absolute bottom-1.5 flex items-center justify-center">{dot}</div>}
            </button>
          );
        })}
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-slate-800">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[11px] font-semibold text-slate-800">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[11px] font-semibold text-slate-800">No Class</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Tap date to update attendance
        </span>
      </div>

      {/* Status Selector Modal / Action Sheet */}
      {modalDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-navy/70 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setModalDate(null)}
          />

          <div className="relative w-full max-w-sm bg-surface dark:bg-[#0c1626] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border dark:border-white/10 p-5 z-10 animate-slide-in-right sm:animate-scale-in text-text-primary dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-border dark:border-white/10 pb-3">
              <div>
                <h4 className="font-heading font-bold text-base">
                  Mark Attendance Status
                </h4>
                <p className="text-xs text-text-muted">
                  {modalDate} • {studentName || studentId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalDate(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-text-muted hover:text-text-primary dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSave} className="space-y-4">
              {/* Status Radio Buttons */}
              <div className="space-y-2">
                <label
                  onClick={() => setModalStatus('present')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    modalStatus === 'present'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-white/5 border-border dark:border-white/10 text-text-secondary dark:text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold block">Present</span>
                    <span className="text-[10px] text-text-muted">Student attended class</span>
                  </div>
                </label>

                <label
                  onClick={() => setModalStatus('absent')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    modalStatus === 'absent'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-300 font-bold'
                      : 'bg-slate-50 dark:bg-white/5 border-border dark:border-white/10 text-text-secondary dark:text-slate-300'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold block">Absent</span>
                    <span className="text-[10px] text-text-muted">Student did not attend</span>
                  </div>
                </label>

                <label
                  onClick={() => setModalStatus('no_class')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    modalStatus === 'no_class'
                      ? 'bg-slate-200 dark:bg-white/15 border-slate-400 font-bold text-text-primary dark:text-white'
                      : 'bg-slate-50 dark:bg-white/5 border-border dark:border-white/10 text-text-secondary dark:text-slate-300'
                  }`}
                >
                  <MinusCircle className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold block">No Class / Holiday</span>
                    <span className="text-[10px] text-text-muted">Class was not scheduled</span>
                  </div>
                </label>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-300 mb-1">
                  Optional Remarks / Notes
                </label>
                <input
                  type="text"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="e.g. Mastered C scale, informed sick leave"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-border dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalDate(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModal}
                  className="flex-1 py-2.5 rounded-xl bg-violet text-white text-xs font-semibold hover:bg-violet-600 transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingModal ? 'Saving...' : 'Save Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
