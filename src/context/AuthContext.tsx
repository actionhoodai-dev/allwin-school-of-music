// ============================================
// Auth Context Provider (Admin Session)
// ============================================

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthChanged, getCachedAdminSession, clearCachedAdminSession, type User } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasCachedSession: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasCachedSession: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCachedSession, setHasCachedSession] = useState(false);

  useEffect(() => {
    const cached = getCachedAdminSession();
    if (cached) {
      setHasCachedSession(true);
    }

    let graceTimeout: NodeJS.Timeout | null = null;

    const unsubscribe = onAuthChanged((firebaseUser) => {
      if (firebaseUser) {
        if (graceTimeout) clearTimeout(graceTimeout);
        setUser(firebaseUser);
        setHasCachedSession(true);
        setLoading(false);
      } else {
        // If there is an existing session token in localStorage, give mobile Chrome / network
        // a brief grace window to finish token restoration before ejecting the user
        const existingSession = getCachedAdminSession();
        if (existingSession && !auth.currentUser) {
          if (graceTimeout) clearTimeout(graceTimeout);
          graceTimeout = setTimeout(() => {
            // Check once more if currentUser was restored
            if (auth.currentUser) {
              setUser(auth.currentUser);
              setLoading(false);
            } else {
              clearCachedAdminSession();
              setUser(null);
              setHasCachedSession(false);
              setLoading(false);
            }
          }, 2500);
        } else {
          clearCachedAdminSession();
          setUser(null);
          setHasCachedSession(false);
          setLoading(false);
        }
      }
    });

    // When user switches back into Chrome on mobile (app switching / phone unlock)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && auth.currentUser) {
        setUser(auth.currentUser);
        setLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (graceTimeout) clearTimeout(graceTimeout);
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, hasCachedSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
