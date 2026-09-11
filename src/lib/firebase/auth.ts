// ============================================
// Firebase Authentication Helpers (Admin & Portal)
// ============================================

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

export const ADMIN_SESSION_STORAGE_KEY = 'allwin_admin_session';

export function getCachedAdminSession(): { uid: string; email: string; loggedInAt: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCachedAdminSession(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }
}

export async function signInWithEmail(email: string, password: string) {
  // Enforce browser-wide persistence before sign in
  if (typeof window !== 'undefined') {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (err) {
      console.warn('[AdminAuth] Persistence warning:', err);
    }
  }

  const result = await signInWithEmailAndPassword(auth, email.trim(), password);

  // Verify user is registered as admin
  const adminDoc = await getDoc(doc(db, 'adminUsers', result.user.uid));
  if (!adminDoc.exists()) {
    await firebaseSignOut(auth);
    clearCachedAdminSession();
    throw new Error('You are not authorized to access the admin panel.');
  }

  // Save persistent admin session token to survive tab discarding/browser close
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        ADMIN_SESSION_STORAGE_KEY,
        JSON.stringify({
          uid: result.user.uid,
          email: result.user.email || email,
          loggedInAt: Date.now(),
        })
      );
    } catch (err) {
      console.warn('[AdminAuth] Error caching session:', err);
    }
  }

  return result.user;
}

export async function signOut() {
  clearCachedAdminSession();
  return firebaseSignOut(auth);
}

export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { type User };
