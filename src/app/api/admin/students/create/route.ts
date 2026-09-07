// ============================================
// API: Create Student Account & Reserve Sequential ID
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { reserveNextStudentId, getStudentAuthEmail } from '@/lib/utils/student-id';
import { getLevelForGrade } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      parentName,
      parentEmail,
      parentPhone,
      dob,
      age,
      gender,
      course,
      instrument,
      level,
      grade,
      teacherId,
      teacherName,
      photo,
      photoPublicId,
      joiningDate,
      initialPassword,
      mustChangePassword = true,
      notes = '',
    } = body;

    if (!name || !parentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student Name and Parent Email are required.' },
        { status: 400 }
      );
    }

    // Check if student with identical name & parent email already exists
    const duplicateQuery = query(
      collection(db, 'students'),
      where('parentEmail', '==', parentEmail.trim().toLowerCase()),
      where('name', '==', name.trim())
    );
    const duplicateSnap = await getDocs(duplicateQuery);
    if (!duplicateSnap.empty) {
      return NextResponse.json(
        { success: false, error: 'A student with this name and parent email already exists.' },
        { status: 409 }
      );
    }

    // Atomically reserve next sequential Student ID (e.g. ASM101)
    const studentId = await reserveNextStudentId();
    const authEmail = getStudentAuthEmail(studentId);

    // Initial password: custom > phone number > student name
    const cleanPassword = (initialPassword || parentPhone || name).trim();

    // Store in Firestore students collection
    const studentData = {
      studentId,
      uid: '', // Will be linked upon first client auth or initialized
      name: name.trim(),
      email: authEmail,
      parentName: parentName ? parentName.trim() : '',
      parentEmail: parentEmail.trim().toLowerCase(),
      parentPhone: parentPhone ? parentPhone.trim() : '',
      dob: dob || '',
      age: age ? Number(age) : null,
      gender: gender || 'other',
      course: course || 'Western Music',
      instrument: instrument || 'Keyboard',
      level: level || (grade ? getLevelForGrade(grade) : 'Pre Foundation Level'),
      grade: grade || 'Initial Grade',
      teacherId: teacherId || '',
      teacherName: teacherName || '',
      photo: photo || '',
      photoPublicId: photoPublicId || '',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      status: 'active',
      mustChangePassword: Boolean(mustChangePassword),
      notes: notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'students'), studentData);

    // Create initial welcome notification
    await addDoc(collection(db, 'notifications'), {
      studentId,
      title: 'Welcome to Allwin School of Music!',
      message: `Welcome ${name}! Your student portal account is ready. Explore your attendance, assignments, and class schedule.`,
      type: 'announcement',
      read: false,
      link: '/student',
      createdAt: serverTimestamp(),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      id: docRef.id,
      studentId,
      authEmail,
      suggestedPassword: cleanPassword,
      message: `Student account created successfully with ID ${studentId}.`,
    });
  } catch (error: any) {
    console.error('[Create Student API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student account' },
      { status: 500 }
    );
  }
}
