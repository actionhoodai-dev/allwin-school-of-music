import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  updatePassword,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import type { Student } from '@/types/student';
import { normalizeStudentId, getStudentAuthEmail } from '@/lib/utils/student-id';

/**
 * Persistence is configured declaratively in initializeAuth (config.ts).
 * Repeated dynamic calls to setPersistence are avoided to prevent session dropping on iOS Safari.
 */
export async function enablePersistentSession(): Promise<void> {
  // Configured in config.ts via initializeAuth
}

/**
 * Finds a student Firestore record by their Student ID (e.g. ASM101) or Email
 */
export async function findStudentByLoginIdentifier(identifier: string): Promise<Student | null> {
  const clean = identifier.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  if (!clean) return null;

  try {
    // 1. Try matching studentId (normalized)
    const normalizedId = normalizeStudentId(clean);
    const idQuery = query(
      collection(db, 'students'),
      where('studentId', '==', normalizedId),
      limit(1)
    );
    const idSnap = await getDocs(idQuery);
    if (!idSnap.empty) {
      const d = idSnap.docs[0];
      return { id: d.id, ...d.data() } as Student;
    }

    // 2. Try matching email directly
    const emailQuery = query(
      collection(db, 'students'),
      where('email', '==', clean.toLowerCase()),
      limit(1)
    );
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      const d = emailSnap.docs[0];
      return { id: d.id, ...d.data() } as Student;
    }

    // 3. Try matching parent email
    const parentEmailQuery = query(
      collection(db, 'students'),
      where('parentEmail', '==', clean.toLowerCase()),
      limit(1)
    );
    const parentEmailSnap = await getDocs(parentEmailQuery);
    if (!parentEmailSnap.empty) {
      const d = parentEmailSnap.docs[0];
      return { id: d.id, ...d.data() } as Student;
    }

    return null;
  } catch (error) {
    console.error('[Auth] Error looking up student by identifier:', error);
    return null;
  }
}

/**
 * Signs in a student or parent using Student ID (ASM101) or Email + Password
 */
export async function signInStudent(identifier: string, password: string): Promise<{ user: User; student: Student }> {
  const cleanIdentifier = identifier.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  const cleanPassword = password.trim();

  if (!cleanIdentifier || !cleanPassword) {
    throw new Error('Please enter both your Student ID / Email and password.');
  }

  // 1. Look up student in Firestore first to resolve account & status
  const foundStudent = await findStudentByLoginIdentifier(cleanIdentifier);
  if (!foundStudent) {
    throw new Error(`No student found for "${cleanIdentifier}". Please check your Student ID (e.g. ASM101) or registered parent email.`);
  }

  if (foundStudent.status === 'inactive' || foundStudent.status === 'paused') {
    throw new Error('This student account is currently inactive. Please contact school administration.');
  }

  const authEmail = foundStudent.email || getStudentAuthEmail(foundStudent.studentId);
  let user: User;

  // 2. Check for pending password reset (from OTP reset flow) or admin initial password
  const hasPendingReset = !!(foundStudent as any).pendingPasswordReset;
  const pendingPassword = (foundStudent as any).pendingPasswordReset;
  const initialPassword = (foundStudent as any).initialPassword;
  const phonePassword = foundStudent.parentPhone ? foundStudent.parentPhone.trim() : '';

  // Check if entered password matches admin-assigned initial credentials
  const matchesInitialPassword =
    (initialPassword && cleanPassword === initialPassword.trim()) ||
    (phonePassword && cleanPassword === phonePassword);

  // 3. Authenticate or seamlessly initialize credentials on first login
  try {
    const credential = await signInWithEmailAndPassword(auth, authEmail, cleanPassword);
    user = credential.user;

    // If they logged in with the old password but there's a pending reset, clear it
    if (hasPendingReset && foundStudent.id) {
      await updateDoc(doc(db, 'students', foundStudent.id), {
        pendingPasswordReset: null,
      }).catch(() => {});
    }
  } catch (authErr: any) {
    // If not registered in Firebase Auth yet, or password was assigned by admin / OTP reset
    if (
      authErr.code === 'auth/user-not-found' ||
      authErr.code === 'auth/invalid-credential' ||
      authErr.code === 'auth/invalid-login-credentials'
    ) {
      // Helper function to create fresh auth credential seamlessly
      const createFreshAuthUser = async (targetEmail: string) => {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, targetEmail, cleanPassword);
          return newCred.user;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            const cleanId = foundStudent.studentId.toLowerCase().replace(/[^a-z0-9]/g, '');
            const freshEmail = `student.${cleanId}_v${Date.now()}@allwinschoolofmusic.internal`;
            const freshCred = await createUserWithEmailAndPassword(auth, freshEmail, cleanPassword);
            if (foundStudent.id) {
              await updateDoc(doc(db, 'students', foundStudent.id), {
                email: freshEmail,
                uid: freshCred.user.uid,
              }).catch(() => {});
            }
            return freshCred.user;
          }
          throw createErr;
        }
      };

      if (hasPendingReset && cleanPassword === pendingPassword) {
        try {
          user = await createFreshAuthUser(authEmail);
          if (foundStudent.id) {
            await updateDoc(doc(db, 'students', foundStudent.id), {
              uid: user.uid,
              pendingPasswordReset: null,
            }).catch(() => {});
          }
        } catch (createErr: any) {
          console.error('[Auth] Failed to complete password reset login:', createErr);
          throw new Error('Failed to complete password reset login. Please try again.');
        }
      } else if (matchesInitialPassword || !foundStudent.uid) {
        // Enrolled student logging in with admin-assigned password for the first time
        try {
          user = await createFreshAuthUser(authEmail);
          if (foundStudent.id) {
            await updateDoc(doc(db, 'students', foundStudent.id), {
              uid: user.uid,
            }).catch(() => {});
          }
        } catch (createErr: any) {
          console.error('[Auth] Account activation error:', createErr);
          throw new Error(
            createErr.message ||
            'Could not activate student account. Please verify password length (at least 6 characters) or contact administration.'
          );
        }
      } else {
        throw new Error(
          'Incorrect password. Please verify the password provided during enrollment, or use "Forgot Password?" below to receive an OTP reset code.'
        );
      }
    } else {
      throw authErr;
    }
  }

  // 4. Link UID and update last login timestamp
  if (foundStudent.id) {
    await updateDoc(doc(db, 'students', foundStudent.id), {
      uid: user!.uid,
      lastLoginAt: serverTimestamp(),
    }).catch(() => {});
  }

  return { user: user!, student: { ...foundStudent, uid: user!.uid } };
}

/**
 * Gets student document by Firebase Auth UID
 */
export async function getStudentByUid(uid: string): Promise<Student | null> {
  try {
    const q = query(
      collection(db, 'students'),
      where('uid', '==', uid),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as Student;
    }
    return null;
  } catch (err) {
    console.warn('[Auth] getStudentByUid error:', err);
    return null;
  }
}

/**
 * Signs out current student
 */
export async function signOutStudent(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribes to live updates of a student's profile
 */
export function subscribeStudentProfile(
  studentDocId: string,
  callback: (student: Student | null) => void
) {
  const ref = doc(db, 'students', studentDocId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as Student);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('[Auth] Realtime profile subscription note:', err);
  });
}

/**
 * Updates student password and marks mustChangePassword as false
 */
export async function updateStudentPassword(newPassword: string, studentDocId?: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User is not authenticated.');
  }
  await updatePassword(auth.currentUser, newPassword);

  if (studentDocId) {
    await updateDoc(doc(db, 'students', studentDocId), {
      mustChangePassword: false,
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }
}
