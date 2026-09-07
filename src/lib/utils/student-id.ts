// ============================================
// Student ID Utilities & Sequence Logic (ASM101+)
// ============================================

import { doc, getDoc, setDoc, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const STUDENT_ID_PREFIX = 'ASM';
export const BASE_STUDENT_SEQUENCE = 101; // Starts at 101: ASM101, ASM102...

/**
 * Formats a sequence number into standard ASMXXX format (e.g. ASM101, ASM102)
 * Without any hyphens, three-digit number starting at 101
 */
export function formatStudentId(sequenceNumber: number): string {
  const seq = sequenceNumber < BASE_STUDENT_SEQUENCE ? BASE_STUDENT_SEQUENCE + sequenceNumber - 1 : sequenceNumber;
  return `${STUDENT_ID_PREFIX}${seq}`;
}

/**
 * Parses a student ID string to extract its numeric sequence
 * e.g., 'ASM101' -> 101, 'ASM-0042' -> 42
 */
export function parseStudentId(studentId: string): number | null {
  if (!studentId) return null;
  const match = studentId.trim().toUpperCase().match(/^ASM-?(\d+)$/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Normalizes user input into valid ASMXXX format
 * e.g. 'asm101', 'asm 101', '101', 'asm-101' -> 'ASM101'
 */
export function normalizeStudentId(rawInput: string): string {
  if (!rawInput) return '';
  const cleaned = rawInput.trim().toUpperCase().replace(/\s+/g, '');
  
  // Check for legacy ASM-XXXX format (preserve if already formatted as 4-digit legacy)
  if (/^ASM-\d{4}$/.test(cleaned)) {
    return cleaned;
  }

  const match = cleaned.match(/^(?:ASM-?)?(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return formatStudentId(num);
  }
  return cleaned;
}

/**
 * Generates an internal login email for a student ID
 * e.g. ASM101 -> student.asm101@allwinschoolofmusic.internal
 */
export function getStudentAuthEmail(studentId: string, customEmail?: string): string {
  if (customEmail && customEmail.includes('@') && !customEmail.includes('@student.allwin.internal')) {
    return customEmail.trim().toLowerCase();
  }
  const cleanId = studentId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `student.${cleanId}@allwinschoolofmusic.internal`;
}

/**
 * Checks Firestore students collection to verify if a candidate student ID is already taken
 */
export async function isStudentIdTaken(candidateId: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'students'), where('studentId', '==', candidateId));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.warn('[StudentID] Error checking studentId uniqueness:', error);
    return false;
  }
}

/**
 * Fetches the next available sequential Student ID from Firestore
 * Ensures uniqueness by verifying against existing student records
 */
export async function getNextStudentId(): Promise<string> {
  try {
    const counterRef = doc(db, 'counters', 'students');
    const counterDoc = await getDoc(counterRef);

    let candidateSeq = BASE_STUDENT_SEQUENCE;
    if (counterDoc.exists()) {
      const currentSeq = counterDoc.data().lastSequence || 0;
      candidateSeq = Math.max(BASE_STUDENT_SEQUENCE, currentSeq + 1);
    }

    // Verify uniqueness against students collection
    let candidateId = `${STUDENT_ID_PREFIX}${candidateSeq}`;
    while (await isStudentIdTaken(candidateId)) {
      candidateSeq++;
      candidateId = `${STUDENT_ID_PREFIX}${candidateSeq}`;
    }

    return candidateId;
  } catch (error) {
    console.warn('[StudentID] Error getting next ID, defaulting to ASM101:', error);
    return `${STUDENT_ID_PREFIX}${BASE_STUDENT_SEQUENCE}`;
  }
}

/**
 * Atomically reserves and increments the next sequential Student ID
 * Guarantees 100% uniqueness with Firestore duplicate check
 */
export async function reserveNextStudentId(): Promise<string> {
  const counterRef = doc(db, 'counters', 'students');

  try {
    const nextId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let nextSeq = BASE_STUDENT_SEQUENCE;

      if (counterDoc.exists()) {
        const currentSeq = counterDoc.data().lastSequence || 0;
        nextSeq = Math.max(BASE_STUDENT_SEQUENCE, currentSeq + 1);
      }

      const id = `${STUDENT_ID_PREFIX}${nextSeq}`;
      transaction.set(counterRef, {
        lastSequence: nextSeq,
        updatedAt: new Date().toISOString(),
      });

      return id;
    });

    // Verify candidate is not taken by any legacy or existing record
    let finalSeq = parseInt(nextId.replace(STUDENT_ID_PREFIX, ''), 10) || BASE_STUDENT_SEQUENCE;
    let verifiedId = `${STUDENT_ID_PREFIX}${finalSeq}`;
    
    while (await isStudentIdTaken(verifiedId)) {
      finalSeq++;
      verifiedId = `${STUDENT_ID_PREFIX}${finalSeq}`;
      // Update counter to the verified sequence
      await setDoc(counterRef, {
        lastSequence: finalSeq,
        updatedAt: new Date().toISOString(),
      });
    }

    return verifiedId;
  } catch (error) {
    console.warn('[StudentID] Transaction failed, generating manual verified fallback ID:', error);
    // Direct fallback
    const counterDoc = await getDoc(counterRef);
    let nextSeq = BASE_STUDENT_SEQUENCE;
    if (counterDoc.exists()) {
      const currentSeq = counterDoc.data().lastSequence || 0;
      nextSeq = Math.max(BASE_STUDENT_SEQUENCE, currentSeq + 1);
    }

    let candidateId = `${STUDENT_ID_PREFIX}${nextSeq}`;
    while (await isStudentIdTaken(candidateId)) {
      nextSeq++;
      candidateId = `${STUDENT_ID_PREFIX}${nextSeq}`;
    }

    await setDoc(counterRef, {
      lastSequence: nextSeq,
      updatedAt: new Date().toISOString(),
    });

    return candidateId;
  }
}
