// ============================================
// API: Forgot Password & Send 6-Digit OTP via Resend
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit, addDoc } from 'firebase/firestore';
import { normalizeStudentId } from '@/lib/utils/student-id';
import { generateNumericOtp, hashOtp, sendOtpEmail } from '@/lib/email/resend';

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length <= 2 ? name[0] + '***' : name[0] + '***' + name[name.length - 1];
  return `${maskedName}@${domain}`;
}

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();
    if (!identifier) {
      return NextResponse.json({ success: false, error: 'Student ID or registered email is required.' }, { status: 400 });
    }

    const clean = identifier.trim();
    let student: any = null;

    // 1. Search by Student ID (e.g. ASM101)
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
      // 2. Search by Parent Email
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
        { success: false, error: `No student record found for "${clean}". Please check your Student ID.` },
        { status: 404 }
      );
    }

    const targetEmail = student.parentEmail;
    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'No parent contact email is registered for this student. Please contact the music school administration.' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const rawOtp = generateNumericOtp();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in Firestore otpCodes collection
    await addDoc(collection(db, 'otpCodes'), {
      studentId: student.studentId,
      studentDocId: student.id,
      email: targetEmail.toLowerCase(),
      otpHash,
      expiresAt,
      attempts: 0,
      used: false,
      createdAt: Date.now(),
    });

    // Send email via Resend
    const sendResult = await sendOtpEmail({
      toEmail: targetEmail,
      studentName: student.name,
      studentId: student.studentId,
      otp: rawOtp,
      expiryMinutes: 10,
    });

    if (sendResult.isTestModeRestriction) {
      // Free Resend account restriction notice
      return NextResponse.json({
        success: true,
        studentId: student.studentId,
        studentName: student.name,
        maskedEmail: maskEmail(targetEmail),
        message: `OTP generated for ${maskEmail(targetEmail)}. (Note: Resend test accounts only deliver to ${sendResult.accountOwnerEmail || 'the Resend account owner email'}. To send to all parents, verify a domain at resend.com/domains).`,
        devSimulated: rawOtp,
        isTestModeRestriction: true,
      });
    }

    if (!sendResult.success) {
      return NextResponse.json({
        success: true,
        studentId: student.studentId,
        studentName: student.name,
        maskedEmail: maskEmail(targetEmail),
        message: `OTP generated: ${sendResult.error}`,
        devSimulated: rawOtp,
      });
    }

    return NextResponse.json({
      success: true,
      studentId: student.studentId,
      studentName: student.name,
      maskedEmail: maskEmail(targetEmail),
      message: `A 6-digit verification code was sent to ${maskEmail(targetEmail)}.`,
    });
  } catch (error: any) {
    console.error('[Forgot Password Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate password reset' },
      { status: 500 }
    );
  }
}
