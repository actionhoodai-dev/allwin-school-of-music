// ============================================
// Student Portal: Contact School & Teacher (Clean White Theme)
// ============================================

'use client';

import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export default function StudentContactPage() {
  const { student } = useStudentAuth();

  const defaultWhatsappMessage = `Hello Allwin School of Music, I am contacting you regarding Student ID ${student?.studentId || ''} (${student?.name || ''}).`;

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Title */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900">
            Contact School & Faculty
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct communication for queries, leaves, or academic assistance
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <Phone className="w-4 h-4" />
          <span>Support</span>
        </div>
      </div>

      {/* 1-Tap Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* WhatsApp Direct */}
        <a
          href={BUSINESS.whatsappLink(defaultWhatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="p-4 rounded-2xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-between active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block">WhatsApp School</span>
              <span className="text-xs text-emerald-100 font-medium">+91 94892 03683</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Direct Phone Call */}
        <a
          href={BUSINESS.phoneLink}
          className="p-4 rounded-2xl bg-[#2874f0] text-white shadow-sm hover:bg-blue-600 transition-all flex items-center justify-between active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block">Call Administration</span>
              <span className="text-xs text-blue-100 font-medium">+91 94892 03683</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Assigned Faculty Section */}
      {student?.teacherName && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-[#2874f0]" />
            <h4 className="font-bold text-sm text-slate-900">
              Assigned Faculty Mentor
            </h4>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-base text-slate-900">
                {student.teacherName}
              </h5>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Instructor for {student.instrument} • {student.course}
              </p>
            </div>

            <a
              href={BUSINESS.whatsappLink(`Hello, I am contacting you regarding ${student.name}'s ${student.instrument} classes.`)}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#2874f0] border border-blue-100 text-xs font-bold hover:bg-blue-100 transition-all"
            >
              Message via Office
            </a>
          </div>
        </div>
      )}

      {/* Academy Location & Hours */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 text-xs text-slate-700">
        <h4 className="font-bold text-sm text-slate-900">
          Academy Office & Visiting Hours
        </h4>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#fb641b] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Salem Main Branch</span>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Chinnathirupathi, Salem - 636008, Tamil Nadu, India.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Operating Hours</span>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Monday to Saturday: 9:00 AM – 7:30 PM • Sunday: Closed
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Email Desk</span>
              <a
                href={BUSINESS.emailLink}
                className="text-xs text-[#2874f0] hover:underline mt-0.5 block font-medium"
              >
                {BUSINESS.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
