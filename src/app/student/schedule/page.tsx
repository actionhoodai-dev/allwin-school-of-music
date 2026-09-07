// ============================================
// Student Portal: Class Schedule (Clean White Theme)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  Calendar,
  Clock,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ClassScheduleItem } from '@/types/student';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudentSchedulePage() {
  const { student } = useStudentAuth();
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const q = query(
          collection(db, 'schedules'),
          where('active', '==', true)
        );
        const snap = await getDocs(q);
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() })) as ClassScheduleItem[];

        // Filter for this student or their course
        const studentId = student?.studentId;
        const filtered = list.filter(
          (s) =>
            !s.studentId ||
            s.studentId === studentId ||
            s.course === student?.course ||
            s.instrument === student?.instrument
        );

        filtered.sort((a, b) => DAYS_ORDER.indexOf(a.dayOfWeek) - DAYS_ORDER.indexOf(b.dayOfWeek));
        setSchedules(filtered);
      } catch (err) {
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [student?.studentId, student?.course, student?.instrument]);

  const displayedSchedules = selectedDay === 'All'
    ? schedules
    : schedules.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Title */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Weekly Class Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scheduled class timings for {student?.instrument || 'music'} sessions
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2874f0] border border-blue-100 text-xs font-bold">
          <Calendar className="w-4 h-4" />
          <span>Timetable</span>
        </div>
      </div>

      {/* Day Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {['All', ...DAYS_ORDER].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedDay === day
                ? 'bg-[#2874f0] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Cards */}
      <div className="space-y-3">
        {displayedSchedules.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">
              No Classes Scheduled
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No classes scheduled for {selectedDay === 'All' ? 'your instrument' : selectedDay}.
            </p>
          </div>
        ) : (
          displayedSchedules.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2874f0] border border-blue-100 font-bold text-xs">
                    {item.dayOfWeek}
                  </span>
                  <span className="font-bold text-base text-slate-900">
                    {item.instrument}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-800 font-bold">
                  <Clock className="w-4 h-4 text-[#2874f0]" />
                  <span>{item.time} {item.endTime ? `– ${item.endTime}` : ''}</span>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 italic font-medium">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
