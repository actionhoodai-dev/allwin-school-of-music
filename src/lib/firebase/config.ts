// ============================================
// Firebase Client Configuration
// ============================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBld9vDBALjPshjyc2r6FtS8n-CxcbMPxA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "allwin-school.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "allwin-school",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "allwin-school.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "460930602945",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:460930602945:web:e9df60357d53f665930140",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2LMB1VJ8S2",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Multi-tier persistence: IndexedDB with LocalStorage fallback for mobile browsers
export const auth = (() => {
  if (typeof window !== 'undefined') {
    try {
      return initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      });
    } catch {
      return getAuth(app);
    }
  }
  return getAuth(app);
})();

export const db = getFirestore(app);
export default app;
