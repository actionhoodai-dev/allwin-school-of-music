// ============================================
// Custom Touch-Friendly Attendance Calendar UI (Clean White Theme)
// ============================================

'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Info,
  Check,
  X,
} from 'lucide-react';
import type { AttendanceRecord } from '@/types/student';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  onDateSelect?: (dateStr: string, record?: AttendanceRecord) => void;
  selectedDate?: string;
  readOnly?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function AttendanceCalendar({
  records,
  onDateSelect,
  selectedDate,
  readOnly = true,
}: AttendanceCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [activeDayRecord, setActiveDayRecord] = useState<{ date: string; record?: AttendanceRecord } | null>(null);

  // Map records by YYYY-MM-DD for O(1) lookups
  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    records.forEach((r) => {
      if (r.date) {
        map.set(r.date, r);
      }
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

    // Convert JS day (0=Sun, 1=Mon... 6=Sat) to Mon-first (0=Mon... 6=Sun)
    let firstWeekday = firstDayOfMonth.getDay() - 1;
    if (firstWeekday === -1) firstWeekday = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const prevDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      prevDays.push({ day: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    const currentDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const m = currentMonth + 1;
      const dateStr = `${currentYear}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      currentDays.push({ day: i, dateStr, isCurrentMonth: true });
    }

    // Next month padding days to complete grid
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

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handleDayClick = (dateStr: string) => {
    const rec = recordsByDate.get(dateStr);
    setActiveDayRecord({ date: dateStr, record: rec });
    if (onDateSelect) {
      onDateSelect(dateStr, rec);
    }
  };

  return (
    <div className="w-full max-w-[502px] bg-[#FFFFFF] rounded-[16px] border border-[#D5D4DF] shadow-sm p-5 sm:p-[30px] flex flex-col gap-[12px] select-none mx-auto">
      {/* Calendar Header / Month Nav */}
      <div className="flex flex-row justify-between items-center w-full min-h-[46px]">
        <div>
          <h3 className="font-heading font-black text-[20px] sm:text-[24px] leading-tight text-[#000000]">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Tap on any class date for details</p>
        </div>

        {/* Frame 9 (Chevrons) */}
        <div className="flex flex-row items-center gap-[8px]">
          <button
            onClick={handlePrevMonth}
            className="w-[46px] h-[46px] rounded-xl border border-[#D5D4DF] bg-[#FFFFFF] hover:bg-slate-50 flex items-center justify-center text-[#000000] cursor-pointer active:scale-95 transition-all shadow-2xs"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={handleNextMonth}
            className="w-[46px] h-[46px] rounded-xl border border-[#D5D4DF] bg-[#FFFFFF] hover:bg-slate-50 flex items-center justify-center text-[#000000] cursor-pointer active:scale-95 transition-all shadow-2xs"
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
          const isSelected = selectedDate === item.dateStr || activeDayRecord?.date === item.dateStr;

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
          let textColor = 'text-[#000000] font-medium';
          let badge = null;

          if (rec?.status === 'present') {
            cellStyle = isSelected
              ? 'bg-emerald-600 ring-3 ring-inset ring-[#45539D] text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs';
            textColor = 'text-white font-extrabold';
            badge = (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-100 uppercase tracking-tighter leading-none">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            );
          } else if (rec?.status === 'absent') {
            cellStyle = isSelected
              ? 'bg-rose-600 ring-3 ring-inset ring-[#45539D] text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs';
            textColor = 'text-white font-extrabold';
            badge = (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-100 uppercase tracking-tighter leading-none">
                <X className="w-3 h-3 stroke-[3]" />
              </span>
            );
          } else if (rec?.status === 'no_class') {
            cellStyle = isSelected
              ? 'bg-slate-300 ring-3 ring-inset ring-[#45539D] text-slate-800'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700';
            textColor = 'text-slate-800 font-bold';
            badge = (
              <span className="text-[11px] font-black text-slate-600 leading-none">−</span>
            );
          } else if (isSelected) {
            // Figma Active day when not marked
            cellStyle = 'bg-[#45539D] text-[#FFFFFF] font-semibold';
            textColor = 'text-[#FFFFFF] font-bold';
          }

          return (
            <button
              key={`${item.dateStr}-${index}`}
              onClick={() => handleDayClick(item.dateStr)}
              className={`h-[52px] sm:h-[64px] border-r border-b border-[#D5D4DF] flex flex-col items-center justify-center gap-0.5 relative cursor-pointer transition-all active:scale-95 ${cellStyle} ${
                isToday && !isSelected && !rec?.status
                  ? 'ring-2 ring-inset ring-[#45539D]/80'
                  : isToday && rec?.status
                  ? 'ring-2 ring-inset ring-white'
                  : ''
              }`}
              title={
                rec?.status
                  ? `${item.dateStr}: ${rec.status.toUpperCase()}${rec.remarks ? ` (${rec.remarks})` : ''}`
                  : item.dateStr
              }
            >
              <span className={`text-[14px] sm:text-[15px] leading-tight ${textColor}`}>
                {item.day}
              </span>
              {badge && (
                <div className="flex items-center justify-center">
                  {badge}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Info Popup Card */}
      {activeDayRecord && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-fade-in flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">
              {activeDayRecord.record?.status === 'present' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : activeDayRecord.record?.status === 'absent' ? (
                <XCircle className="w-5 h-5 text-rose-500" />
              ) : (
                <MinusCircle className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {activeDayRecord.date} —{' '}
                <span className="capitalize">
                  {activeDayRecord.record?.status
                    ? activeDayRecord.record.status.replace('_', ' ')
                    : 'No record on this day'}
                </span>
              </p>
              {activeDayRecord.record?.remarks ? (
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {activeDayRecord.record.remarks}
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeDayRecord.record?.status === 'present'
                    ? 'Class attended successfully'
                    : activeDayRecord.record?.status === 'absent'
                    ? 'Marked absent for scheduled session'
                    : 'Regular timetable session'}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveDayRecord(null)}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[9px] font-bold shadow-xs">✓</span>
          <span className="font-bold text-slate-800">Present (Green)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-rose-600 flex items-center justify-center text-white text-[9px] font-bold shadow-xs">✕</span>
          <span className="font-bold text-slate-800">Absent (Red)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-slate-200 flex items-center justify-center text-slate-700 text-[9px] font-bold">−</span>
          <span className="font-bold text-slate-800">No Class</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md border-2 border-[#45539D] flex items-center justify-center text-[#45539D] text-[9px] font-bold" />
          <span className="font-bold text-slate-800">Today</span>
        </div>
      </div>
    </div>
  );
}
