'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  CalendarCheck,
  Menu,
} from 'lucide-react';
import { useAdminNav } from '@/context/AdminNavContext';

export default function AdminBottomNav() {
  const pathname = usePathname();
  const adminNav = useAdminNav();

  const NAV_ITEMS = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Announce',
      href: '/admin/announcements',
      icon: Megaphone,
      exact: false,
    },
    {
      label: 'Students',
      href: '/admin/students',
      icon: Users,
      exact: false,
    },
    {
      label: 'Attendance',
      href: '/admin/attendance',
      icon: CalendarCheck,
      exact: false,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 select-none pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.06)] lg:hidden"
      aria-label="Admin Mobile Navigation"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#2874f0] font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-blue-50 text-[#2874f0]' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More / All Tabs Drawer Trigger */}
        <button
          type="button"
          onClick={() => adminNav?.openMobileSidebar()}
          className="relative flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all active:scale-95 text-slate-500 hover:text-slate-800 font-medium"
          aria-label="Open full admin menu"
        >
          <div className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100">
            <Menu className="w-5 h-5 stroke-[1.75]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
