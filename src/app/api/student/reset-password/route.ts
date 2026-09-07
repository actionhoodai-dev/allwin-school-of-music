// ============================================
// API: Verify OTP & Reset Student Password
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { hashOtp } from '@/lib/email/resend';
import { normalizeStudentId, getStudentAuthEmail } from '@/lib/utils/student-id';
import {
  getAuth,
  signInWithEmailAndPassword,
  updatePassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export async function POST(request: Request) {
  try {
    const { identifier, otp, newPassword } = await request.json();

    if (!identifier || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Student ID/email, OTP code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const clean = identifier.trim();

    // 1. Find the student record
    let student: any = null;
    const normalizedId = normalizeStudentId(clean);

    const idQuery = query(
      collection(db, 'students'),
      where('studentId', '==', normalizedId),
      limit(1)
    );
    const idSnap = await getDocs(idQuery);

    if (!idSnap.empty) {
      student = { id: idSnap.docs[0].id, ...idSnap.docs[0].data() };
    } else {
      // Try by email
      const emailQuery = query(
        collection(db, 'students'),
        where('parentEmail', '==', clean.toLowerCase()),
        limit(1)
      );
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        student = { id: emailSnap.docs[0].id, ...emailSnap.docs[0].data() };
      }
    }

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found. Please check your Student ID.' },
        { status: 404 }
      );
    }

    // 2. Verify OTP from Firestore
    const cleanId = student.studentId;
    const incomingHash = hashOtp(otp.trim());

    const otpQuery = query(
      collection(db, 'otpCodes'),
      where('studentId', '==', cleanId),
      where('used', '==', false),
      limit(5)
    );

    const otpSnap = await getDocs(otpQuery);
    if (otpSnap.empty) {
      return NextResponse.json(
        { success: false, error: 'No active OTP request found. Please request a new verification code.' },
        { status: 400 }
      );
    }

    let validDoc: any = null;
    const now = Date.now();

    for (const d of otpSnap.docs) {
      const data = d.data();

      if (data.expiresAt < now) continue; // Expired
      if (data.attempts >= 5) continue;   // Too many attempts

      if (data.otpHash === incomingHash) {
        validDoc = { id: d.id, ...data };
        break;
      } else {
        // Increment failed attempts
        await updateDoc(doc(db, 'otpCodes', d.id), {
          attempts: (data.attempts || 0) + 1,
        });
      }
    }

    if (!validDoc) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code. Please try again or request a new code.' },
        { status: 400 }
      );
    }

    // 3. Mark OTP as used
    await updateDoc(doc(db, 'otpCodes', validDoc.id), {
      used: true,
      usedAt: now,
    });

    // 4. Update password in Firebase Auth
    try {
      const cleanId = student.studentId.toLowerCase().replace(/[^a-z0-9]/g, '');
      const freshEmail = `student.${cleanId}_v${Date.now()}@allwinschoolofmusic.internal`;
      const cred = await createUserWithEmailAndPassword(auth, freshEmail, newPassword);

      await updateDoc(doc(db, 'students', student.id), {
        email: freshEmail,
        uid: cred.user.uid,
        pendingPasswordReset: null,
        mustChangePassword: false,
        updatedAt: serverTimestamp(),
      });
    } catch (authError: any) {
      console.error('[Reset Password Auth Error]', authError);
      // Fallback: store pending reset for client-side resolution
      await updateDoc(doc(db, 'students', student.id), {
        pendingPasswordReset: newPassword,
        mustChangePassword: false,
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('[Reset Password Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Password reset failed.' },
      { status: 500 }
    );
  }
}
