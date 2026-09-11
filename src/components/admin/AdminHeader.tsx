'use client';

import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminNav } from '@/context/AdminNavContext';

interface AdminHeaderProps {
  title: string;
  onOpenMobileSidebar?: () => void;
}

export default function AdminHeader({ title, onOpenMobileSidebar }: AdminHeaderProps) {
  const { user } = useAuth();
  const adminNav = useAdminNav();

  const handleOpen = onOpenMobileSidebar || adminNav?.openMobileSidebar;

  return (
    <header className="bg-white border-b border-slate-200 py-3.5 sm:py-4 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {handleOpen && (
          <button
            onClick={handleOpen}
            className="p-2 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden flex items-center justify-center transition-colors active:scale-95 shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="font-bold text-lg sm:text-2xl text-slate-900 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span className="font-bold text-slate-900 text-[11px] sm:text-xs truncate max-w-[120px] sm:max-w-[200px]">
            {user?.email || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
