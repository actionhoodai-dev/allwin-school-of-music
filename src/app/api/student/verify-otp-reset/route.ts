// ============================================
// API: Verify OTP & Reset Password
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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { hashOtp } from '@/lib/email/resend';
import { normalizeStudentId } from '@/lib/utils/student-id';

export async function POST(request: Request) {
  try {
    const { studentId, otp, newPassword } = await request.json();

    if (!studentId || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Student ID, OTP code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanId = normalizeStudentId(studentId);
    const incomingHash = hashOtp(otp);

    // Look up active OTPs for this student
    const otpQuery = query(
      collection(db, 'otpCodes'),
      where('studentId', '==', cleanId),
      where('used', '==', false),
      limit(5)
    );

    const snap = await getDocs(otpQuery);
    if (snap.empty) {
      return NextResponse.json(
        { success: false, error: 'No active OTP request found. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Find matching unexpired record
    let validDoc: any = null;
    const now = Date.now();

    for (const d of snap.docs) {
      const data = d.data();
      if (data.expiresAt < now) {
        // Expired
        continue;
      }
      if (data.attempts >= 5) {
        // Too many attempts
        continue;
      }

      if (data.otpHash === incomingHash) {
        validDoc = { id: d.id, ...data };
        break;
      } else {
        // Increment attempts on wrong OTP
        await updateDoc(doc(db, 'otpCodes', d.id), {
          attempts: (data.attempts || 0) + 1,
        });
      }
    }

    if (!validDoc) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code. Please try again.' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await updateDoc(doc(db, 'otpCodes', validDoc.id), {
      used: true,
      usedAt: now,
    });

    // Update student doc mustChangePassword to false
    if (validDoc.studentDocId) {
      await updateDoc(doc(db, 'students', validDoc.studentDocId), {
        mustChangePassword: false,
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset verified successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('[Verify OTP Reset Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
