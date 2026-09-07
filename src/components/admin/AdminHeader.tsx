'use client';

import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminHeaderProps {
  title: string;
  onOpenMobileSidebar?: () => void;
}

export default function AdminHeader({ title, onOpenMobileSidebar }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 py-4 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="font-bold text-xl sm:text-2xl text-slate-900">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span className="font-bold text-slate-900">{user?.email || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
