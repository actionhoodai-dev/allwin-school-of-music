// ============================================
// API: Get Next Sequential Student ID (Preview)
// ============================================

import { NextResponse } from 'next/server';
import { getNextStudentId } from '@/lib/utils/student-id';

export async function GET() {
  try {
    const nextId = await getNextStudentId();
    return NextResponse.json({ success: true, nextId });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to determine next student ID' },
      { status: 500 }
    );
  }
}
