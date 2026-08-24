// ============================================
// ThemeToggle Component — Smooth Sun / Moon Switcher
// ============================================

'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative p-2 rounded-xl text-slate-700 dark:text-white/90 bg-slate-100/90 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all duration-300 flex items-center justify-center cursor-pointer border border-slate-200/80 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-violet/40 shadow-sm ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon (shown in Dark Mode -> click for Light Mode) */}
        <Sun
          className={`w-5 h-5 text-amber-400 transition-all duration-300 transform absolute ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
        {/* Moon Icon (shown in Light Mode -> click for Dark Mode) */}
        <Moon
          className={`w-5 h-5 text-violet transition-all duration-300 transform absolute ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </div>
    </button>
  );
}
