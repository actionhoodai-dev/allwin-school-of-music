// ============================================
// Student Portal: More Navigation Menu with Badges (Clean White Theme)
// ============================================

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '@/context/StudentAuthContext';
import {
  User,
  Calendar,
  Trophy,
  Award,
  CreditCard,
  GraduationCap,
  Megaphone,
  PhoneCall,
  Settings,
  LogOut,
  ChevronRight,
  Receipt,
  CalendarCheck,
} from 'lucide-react';

export default function StudentMorePage() {
  const router = useRouter();
  const { student, sectionBadges, markSectionViewed, signOut } = useStudentAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/student-login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const MENU_GROUPS = [
    {
      title: 'Academics & Records',
      items: [
        {
          label: 'Student Profile',
          href: '/student/profile',
          icon: User,
          color: 'text-[#2874f0]',
          badgeCount: 0,
        },
        {
          label: 'Attendance Calendar',
          href: '/student/attendance',
          icon: CalendarCheck,
          color: 'text-emerald-600',
          badgeCount: sectionBadges?.attendance || 0,
          badgeKey: 'attendance' as const,
        },
        {
          label: 'Weekly Class Schedule',
          href: '/student/schedule',
          icon: Calendar,
          color: 'text-[#2874f0]',
          badgeCount: 0,
        },
        {
          label: 'Progress Reports & Grades',
          href: '/student/progress',
          icon: Trophy,
          color: 'text-amber-600',
          badgeCount: sectionBadges?.progress || 0,
          badgeKey: 'progress' as const,
        },
        {
          label: 'Certificates & Achievements',
          href: '/student/achievements',
          icon: Award,
          color: 'text-yellow-600',
          badgeCount: sectionBadges?.achievements || 0,
          badgeKey: 'achievements' as const,
        },
      ],
    },
    {
      title: 'Trinity & Examinations',
      items: [
        {
          label: 'Trinity College London Hub',
          href: '/student/exams/trinity',
          icon: GraduationCap,
          color: 'text-indigo-600',
          badgeCount: sectionBadges?.exams || 0,
          badgeKey: 'exams' as const,
        },
        {
          label: 'Grade Exam Schedule',
          href: '/student/exams',
          icon: Calendar,
          color: 'text-[#2874f0]',
          badgeCount: 0,
        },
        {
          label: 'Exam Fees & Registration Dues',
          href: '/student/exams/fees',
          icon: CreditCard,
          color: 'text-amber-600',
          badgeCount: 0,
        },
      ],
    },
    {
      title: 'Billing & Records',
      items: [
        {
          label: 'Current Fee Overview',
          href: '/student/fees',
          icon: CreditCard,
          color: 'text-teal-600',
          badgeCount: sectionBadges?.fees || 0,
          badgeKey: 'fees' as const,
        },
        {
          label: 'Payment Receipts & History',
          href: '/student/fees/history',
          icon: Receipt,
          color: 'text-emerald-600',
          badgeCount: 0,
        },
      ],
    },
    {
      title: 'Academy Communication & Settings',
      items: [
        {
          label: 'Academy Notices & Circulars',
          href: '/student/announcements',
          icon: Megaphone,
          color: 'text-[#fb641b]',
          badgeCount: sectionBadges?.announcements || 0,
          badgeKey: 'announcements' as const,
        },
        {
          label: 'Contact School & Administration',
          href: '/student/contact',
          icon: PhoneCall,
          color: 'text-emerald-600',
          badgeCount: 0,
        },
        {
          label: 'Account & Password Settings',
          href: '/student/settings',
          icon: Settings,
          color: 'text-slate-600',
          badgeCount: 0,
        },
      ],
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Student Compact Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 aspect-square rounded-2xl bg-blue-50 border border-blue-200 p-0.5 overflow-hidden shrink-0 shadow-sm">
            {student?.photo ? (
              <Image
                src={student.photo}
                alt={student.name || 'Student'}
                fill
                sizes="48px"
                className="rounded-xl object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#2874f0] text-white">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {student?.name || 'Student'}
            </h3>
            <p className="text-xs text-slate-600 font-semibold tracking-wide">
              {student?.studentId} • {student?.instrument} ({student?.grade || 'Grade 1'})
            </p>
          </div>
        </div>

        <Link
          href="/student/profile"
          className="text-xs font-bold text-white px-3.5 py-1.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] shadow-xs active:scale-95 transition-all"
        >
          View Profile
        </Link>
      </div>

      {/* Menu Groups */}
      {MENU_GROUPS.map((group) => (
        <div key={group.title} className="space-y-2">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            {group.title}
          </h4>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
            {group.items.map((item) => {
              const Icon = item.icon;
              const hasUnread = (item.badgeCount || 0) > 0;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    if (item.badgeKey) markSectionViewed(item.badgeKey);
                  }}
                  className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition-all active:scale-[0.99] active:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`relative p-2 rounded-xl bg-slate-50 border border-slate-100 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-[#fb641b] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                          {(item.badgeCount || 0) > 9 ? '9+' : item.badgeCount}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-slate-900">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasUnread && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#fb641b] text-white shadow-xs">
                        {item.badgeCount} NEW
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 active:translate-y-0.5 active:scale-[0.96] transition-all cursor-pointer select-none"
        >
          <LogOut className="w-4 h-4 text-white" />
          <span>Log Out of Student Portal</span>
        </button>
      </div>
    </div>
  );
}
