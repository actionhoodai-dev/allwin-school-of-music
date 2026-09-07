// ============================================
// API: Permanently Delete Student & Cascade Records (Admin)
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import {
  doc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentDocId, studentId } = body;

    if (!studentDocId && !studentId) {
      return NextResponse.json(
        { success: false, error: 'studentDocId or studentId is required.' },
        { status: 400 }
      );
    }

    let targetDocId = studentDocId;
    let targetStudentId = studentId;

    // Find student document if only studentId was provided
    if (!targetDocId && targetStudentId) {
      const q = query(
        collection(db, 'students'),
        where('studentId', '==', targetStudentId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        targetDocId = snap.docs[0].id;
      }
    }

    if (targetDocId) {
      const studentRef = doc(db, 'students', targetDocId);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const data = studentSnap.data();
        if (!targetStudentId) {
          targetStudentId = data.studentId;
        }
        await deleteDoc(studentRef);
      }
    }

    // Cascade delete associated records across collections if studentId is known
    if (targetStudentId) {
      const collectionsToClean = [
        'attendance',
        'fees',
        'progressReports',
        'studentAchievements',
        'examDetails',
        'schedules',
        'notifications',
      ];

      for (const collName of collectionsToClean) {
        try {
          const q = query(
            collection(db, collName),
            where('studentId', '==', targetStudentId)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const batch = writeBatch(db);
            snap.docs.forEach((d) => {
              batch.delete(d.ref);
            });
            await batch.commit();
          }
        } catch (subErr) {
          console.error(`[Delete Cascade] Error cleaning ${collName}:`, subErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Student ${targetStudentId || ''} and associated records permanently deleted.`,
    });
  } catch (error: any) {
    console.error('[Delete Student] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete student.' },
      { status: 500 }
    );
  }
}
