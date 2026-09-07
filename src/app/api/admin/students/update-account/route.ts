// ============================================
// API: Update Student Account Settings (Admin)
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentDocId, updates } = body;

    if (!studentDocId || !updates) {
      return NextResponse.json({ success: false, error: 'Student document ID and updates are required' }, { status: 400 });
    }

    const studentRef = doc(db, 'students', studentDocId);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) {
      return NextResponse.json({ success: false, error: 'Student record not found' }, { status: 404 });
    }

    await updateDoc(studentRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Student account updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update student account' },
      { status: 500 }
    );
  }
}
