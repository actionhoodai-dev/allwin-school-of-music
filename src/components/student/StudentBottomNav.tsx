'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarCheck,
  Trophy,
  CreditCard,
  Menu,
} from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';

export default function StudentBottomNav() {
  const pathname = usePathname();
  const { sectionBadges, markSectionViewed } = useStudentAuth();

  const NAV_ITEMS = [
    {
      label: 'Home',
      href: '/student',
      icon: Home,
      exact: true,
      badgeCount: 0,
    },
    {
      label: 'Attendance',
      href: '/student/attendance',
      icon: CalendarCheck,
      exact: false,
      badgeCount: sectionBadges?.attendance || 0,
      badgeKey: 'attendance' as const,
    },
    {
      label: 'Progress',
      href: '/student/progress',
      icon: Trophy,
      exact: false,
      badgeCount: sectionBadges?.progress || 0,
      badgeKey: 'progress' as const,
    },
    {
      label: 'Fees',
      href: '/student/fees',
      icon: CreditCard,
      exact: false,
      aliases: ['/student/fees/history'],
      badgeCount: sectionBadges?.fees || 0,
      badgeKey: 'fees' as const,
    },
    {
      label: 'More',
      href: '/student/more',
      icon: Menu,
      exact: false,
      aliases: [
        '/student/profile',
        '/student/schedule',
        '/student/achievements',
        '/student/exams',
        '/student/announcements',
        '/student/contact',
        '/student/settings',
      ],
      badgeCount:
        (sectionBadges?.announcements || 0) +
        (sectionBadges?.exams || 0) +
        (sectionBadges?.achievements || 0),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 select-none pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) ||
              (item.aliases && item.aliases.some((alias) => pathname.startsWith(alias)));

          const hasUnread = (item.badgeCount || 0) > 0;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => {
                if (item.badgeKey) markSectionViewed(item.badgeKey);
              }}
              className={`relative flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#2874f0] font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-blue-50 shadow-xs' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-105 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                />

                {/* WhatsApp-Style Circular Unread Number Counter */}
                {hasUnread && (
                  <span className="absolute -top-1 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#fb641b] text-[10px] font-black text-white flex items-center justify-center ring-2 ring-white shadow-xs leading-none">
                    {(item.badgeCount || 0) > 9 ? '9+' : item.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
