// ============================================
// Student Dashboard Quick Action Grid with Badges (Flipkart / Amazon Clean White Theme)
// ============================================

'use client';

import Link from 'next/link';
import {
  CalendarCheck,
  Calendar,
  Trophy,
  Award,
  CreditCard,
  GraduationCap,
  Megaphone,
  PhoneCall,
} from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';

export default function QuickActionGrid() {
  const { sectionBadges, markSectionViewed } = useStudentAuth();

  const ACTIONS = [
    {
      title: 'Attendance',
      subtext: 'Calendar & records',
      href: '/student/attendance',
      icon: CalendarCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badgeCount: sectionBadges?.attendance || 0,
      badgeKey: 'attendance' as const,
    },
    {
      title: 'Class Schedule',
      subtext: 'Weekly timetable',
      href: '/student/schedule',
      icon: Calendar,
      iconBg: 'bg-blue-50 text-[#2874f0] border border-blue-100',
      badgeCount: 0,
    },
    {
      title: 'Progress & Grades',
      subtext: 'Grades & levels',
      href: '/student/progress',
      icon: Trophy,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      badgeCount: sectionBadges?.progress || 0,
      badgeKey: 'progress' as const,
    },
    {
      title: 'Certificates',
      subtext: 'Laurels & awards',
      href: '/student/achievements',
      icon: Award,
      iconBg: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
      badgeCount: sectionBadges?.achievements || 0,
      badgeKey: 'achievements' as const,
    },
    {
      title: 'Fees & Dues',
      subtext: 'Tuition & receipts',
      href: '/student/fees',
      icon: CreditCard,
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
      badgeCount: sectionBadges?.fees || 0,
      badgeKey: 'fees' as const,
    },
    {
      title: 'Trinity Exams',
      subtext: 'Assessments & board',
      href: '/student/exams/trinity',
      icon: GraduationCap,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      badgeCount: sectionBadges?.exams || 0,
      badgeKey: 'exams' as const,
    },
    {
      title: 'Announcements',
      subtext: 'Circulars & notices',
      href: '/student/announcements',
      icon: Megaphone,
      iconBg: 'bg-orange-50 text-[#fb641b] border border-orange-100',
      badgeCount: sectionBadges?.announcements || 0,
      badgeKey: 'announcements' as const,
    },
    {
      title: 'Contact School',
      subtext: 'Call / WhatsApp',
      href: '/student/contact',
      icon: PhoneCall,
      iconBg: 'bg-slate-100 text-slate-700 border border-slate-200',
      badgeCount: 0,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Student Portal Modules
        </h3>
        <span className="text-[11px] text-[#2874f0] font-bold">
          Quick Access
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const hasUnread = (action.badgeCount || 0) > 0;

          return (
            <Link
              key={action.title}
              href={action.href}
              onClick={() => {
                if (action.badgeKey) markSectionViewed(action.badgeKey);
              }}
              className="relative p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md active:scale-95 transition-all duration-150 flex flex-col justify-between"
            >
              {/* Unread WhatsApp-Style Count Capsule Badge */}
              {hasUnread && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fb641b] text-white text-[10px] font-black shadow-xs leading-none">
                  <span>{action.badgeCount} NEW</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  {action.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {action.subtext}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
