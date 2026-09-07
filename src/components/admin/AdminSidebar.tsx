'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Megaphone,
  MessageSquare,
  GraduationCap,
  Image as ImageIcon,
  Trophy,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { label: 'Achievements', href: '/admin/achievements', icon: Trophy },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { label: 'Site Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col justify-between h-screen sticky top-0 border-r border-slate-200 select-none shadow-sm">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Allwin Logo"
              width={36}
              height={36}
              className="rounded-full shadow-sm ring-2 ring-blue-100"
            />
            <div>
              <h2 className="font-bold text-base text-slate-900 leading-tight">
                Allwin Admin
              </h2>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                Management Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2874f0] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#2874f0]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all border border-slate-200"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#2874f0]" />
            <span>Live Website</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            Online
          </span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
}
