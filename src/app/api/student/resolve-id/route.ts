// ============================================
// API: Resolve Student ID (ASM101) to Auth Email
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { normalizeStudentId, getStudentAuthEmail } from '@/lib/utils/student-id';

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();
    if (!identifier) {
      return NextResponse.json({ success: false, error: 'Identifier is required' }, { status: 400 });
    }

    const clean = identifier.trim();

    // If already an email, return as is
    if (clean.includes('@')) {
      return NextResponse.json({ success: true, email: clean.toLowerCase() });
    }

    const normalizedId = normalizeStudentId(clean);

    // Search by studentId
    const q = query(
      collection(db, 'students'),
      where('studentId', '==', normalizedId),
      limit(1)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const student = snap.docs[0].data();
      if (student.status === 'inactive' || student.status === 'paused') {
        return NextResponse.json(
          { success: false, error: 'This student account has been marked inactive by administration.' },
          { status: 403 }
        );
      }
      return NextResponse.json({
        success: true,
        email: student.email || getStudentAuthEmail(student.studentId),
        studentName: student.name,
        studentId: student.studentId,
        mustChangePassword: student.mustChangePassword ?? false,
      });
    }

    return NextResponse.json(
      { success: false, error: `Student ID "${clean}" was not found.` },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error resolving student ID' },
      { status: 500 }
    );
  }
}
