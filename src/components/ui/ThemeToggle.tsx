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
      className={`relative p-2 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center cursor-pointer border border-white/15 focus:outline-none focus:ring-2 focus:ring-violet/40 ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon (for Dark Mode -> Switch to Light) */}
        <Sun
          className={`w-5 h-5 text-amber-300 transition-all duration-300 transform absolute ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
        {/* Moon Icon (for Light Mode -> Switch to Dark) */}
        <Moon
          className={`w-5 h-5 text-purple-200 transition-all duration-300 transform absolute ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </div>
    </button>
  );
}
