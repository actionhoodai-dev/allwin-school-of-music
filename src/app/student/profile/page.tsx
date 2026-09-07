// ============================================
// Student Portal: Student Profile (Clean White Theme)
// ============================================

'use client';

import Image from 'next/image';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { student } = useStudentAuth();

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Title */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Student Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official enrollment details and parent guardian contact
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2874f0] border border-blue-100 text-xs font-bold">
          <User className="w-4 h-4" />
          <span>Profile</span>
        </div>
      </div>

      {/* Main Identity Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="relative w-24 h-24 aspect-square rounded-2xl bg-blue-50 border-2 border-blue-200 p-0.5 overflow-hidden shrink-0 shadow-sm">
          {student?.photo ? (
            <Image
              src={student.photo}
              alt={student.name || 'Student'}
              fill
              sizes="96px"
              className="rounded-xl object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#2874f0] text-white">
              <User className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold tracking-wide px-2.5 py-0.5 rounded-md bg-[#fff7e6] text-[#b78103] border border-[#ffd591]">
              {student?.studentId || 'ASM101'}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              {student?.status === 'active' ? 'Active Student' : 'Enrolled'}
            </span>
          </div>

          <h3 className="font-bold text-2xl text-slate-900">
            {student?.name || 'Student'}
          </h3>

          <p className="text-xs text-slate-600 font-medium">
            Instrument: <strong className="text-slate-900">{student?.instrument || 'Keyboard'}</strong> • Course: <strong className="text-slate-900">{student?.course || 'Western Music'}</strong>
          </p>

          <p className="text-xs text-[#2874f0] font-bold">
            Grade: {student?.grade || 'Initial Grade'} • Level: {student?.level || 'Pre Foundation Level'}
          </p>
        </div>
      </div>

      {/* Academic Details Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <GraduationCap className="w-4 h-4 text-[#2874f0]" />
          <h4 className="font-bold text-sm text-slate-900">
            Curriculum & Instrument
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3.5 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] font-medium">Primary Instrument</span>
            <span className="font-bold text-slate-900">
              {student?.instrument || 'Keyboard'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px] font-medium">Course Stream</span>
            <span className="font-bold text-slate-900">
              {student?.course || 'Western Music'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px] font-medium">Current Level</span>
            <span className="font-bold text-slate-900">
              {student?.level || 'Pre Foundation Level'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px] font-medium">Current Grade</span>
            <span className="font-bold text-slate-900">
              {student?.grade || 'Initial Grade'}
            </span>
          </div>
        </div>
      </div>

      {/* Parent & Contact Information */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="font-bold text-sm text-slate-900">
            Parent & Guardian Contact
          </h4>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-medium">Parent / Guardian Name</span>
              <span className="font-bold text-slate-900">
                {student?.parentName || 'Parent Guardian'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-medium">Registered Parent Email (For OTP)</span>
              <span className="font-bold text-slate-900">
                {student?.parentEmail || 'Not configured'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-medium">Contact Phone Number</span>
              <span className="font-bold text-slate-900">
                {student?.parentPhone || 'Not configured'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
