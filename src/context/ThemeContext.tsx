// ============================================
// ThemeContext — Locked to High-Contrast Light Theme
// ============================================

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>('light');

  useEffect(() => {
    // Always enforce clean light theme across entire site
    try {
      localStorage.setItem('allwin_theme', 'light');
      const root = document.documentElement;
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } catch (_) {}
  }, []);

  const toggleTheme = () => {
    // No-op: Dark theme is disabled; light theme only
  };

  const setTheme = () => {
    // No-op: Light theme only
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

