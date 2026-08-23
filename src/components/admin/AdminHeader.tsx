'use client';

import { useState } from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminHeaderProps {
  title: string;
  onOpenMobileSidebar?: () => void;
}

export default function AdminHeader({ title, onOpenMobileSidebar }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-border py-4 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface-dim lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="font-heading font-bold text-xl sm:text-2xl text-navy">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-dim border border-border text-xs text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-medium text-navy">{user?.email || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
