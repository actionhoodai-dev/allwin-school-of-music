// ============================================
// Firebase Authentication Helpers
// ============================================

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  // Verify user is an admin
  const adminDoc = await getDoc(doc(db, 'adminUsers', result.user.uid));
  if (!adminDoc.exists()) {
    await firebaseSignOut(auth);
    throw new Error('You are not authorized to access the admin panel.');
  }
  return result.user;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { type User };
