'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  Users,
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
  { label: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
  { label: 'Faculty', href: '/admin/faculty', icon: Users },
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
    <aside className="w-64 bg-navy text-white flex flex-col justify-between h-screen sticky top-0 border-r border-white/10 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Allwin Logo"
              width={36}
              height={36}
              className="rounded-full shadow"
            />
            <div>
              <h2 className="font-heading font-bold text-base text-white leading-tight">
                Allwin Admin
              </h2>
              <p className="text-[10px] text-white/50 tracking-wide uppercase">
                Management Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple/60 to-violet/50 text-white font-semibold shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange' : 'text-white/60'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-white/10 space-y-2 bg-navy-light/40">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
