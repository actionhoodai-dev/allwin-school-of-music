// ============================================
// Attendance Stats & Metrics Cards (Clean White Theme)
// ============================================

'use client';

import { CheckCircle2, XCircle, Calendar } from 'lucide-react';

interface AttendanceStatsProps {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  percentage: number;
  monthName?: string;
}

export default function AttendanceStats({
  totalClasses,
  presentCount,
  absentCount,
  percentage,
  monthName,
}: AttendanceStatsProps) {
  // Determine color theme based on percentage
  const getScoreColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 75) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-3">
      {monthName && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {monthName} Overview
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getScoreColor(percentage)}`}>
            {percentage.toFixed(1)}% Overall
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Classes Held */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-1.5 border border-slate-200">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalClasses}
          </div>
          <p className="text-xs text-slate-500 font-medium">Classes Held</p>
        </div>

        {/* Present Days */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {presentCount}
          </div>
          <p className="text-xs text-emerald-700 font-medium">Present</p>
        </div>

        {/* Absent Days */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1.5 border border-rose-100">
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {absentCount}
          </div>
          <p className="text-xs text-rose-700 font-medium">Absent</p>
        </div>
      </div>
    </div>
  );
}
