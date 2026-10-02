// ============================================
// Fees Utility: Last-day of Month Due Date & Auto-Ensurance
// ============================================

import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { StudentFeeItem, FeeStatus } from '@/types/student';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns the exact last day date string (YYYY-MM-DD) for a given year & month (0-indexed).
 * Defaults to current month if no arguments provided.
 * e.g., 2026-10-31, 2026-11-30, 2026-02-28
 */
export function getLastDayOfMonth(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDayDate = new Date(year, month + 1, 0); // 0 gets the last day of previous month index
  const y = lastDayDate.getFullYear();
  const m = String(lastDayDate.getMonth() + 1).padStart(2, '0');
  const d = String(lastDayDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthFeeInfo(date = new Date()) {
  const monthName = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const monthYearStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const dueDate = getLastDayOfMonth(date);
  const title = `Monthly Tuition Fee - ${monthName} ${year}`;

  return {
    monthName,
    year,
    monthYearStr,
    dueDate,
    title,
  };
}

/**
 * Ensures that the current month's tuition fee record exists for the student.
 * If not already present in the list, auto-creates it with due date set to the last day of the month
 * and status set to 'pending' (Unpaid).
 */
export async function ensureCurrentMonthFee(
  studentId: string,
  existingFees: StudentFeeItem[],
  defaultAmount = 2000
): Promise<StudentFeeItem[]> {
  if (!studentId) return existingFees;

  const info = getCurrentMonthFeeInfo();

  // Check if a fee for the current month already exists
  const hasCurrentMonthFee = existingFees.some((f) => {
    if (f.dueDate && f.dueDate.startsWith(info.monthYearStr)) return true;
    if (f.title && f.title.toLowerCase().includes(info.monthName.toLowerCase()) && f.title.includes(String(info.year))) return true;
    return false;
  });

  if (hasCurrentMonthFee) {
    return existingFees;
  }

  try {
    const newFeeData = {
      studentId,
      title: info.title,
      feeType: 'tuition' as const,
      amount: defaultAmount,
      paidAmount: 0,
      balanceAmount: defaultAmount,
      dueDate: info.dueDate,
      status: 'pending' as FeeStatus,
      paymentMethod: 'UPI / GPay' as const,
      receiptNumber: '',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'fees'), newFeeData);

    const createdItem: StudentFeeItem = {
      id: docRef.id,
      studentId,
      title: info.title,
      feeType: 'tuition',
      amount: defaultAmount,
      paidAmount: 0,
      balanceAmount: defaultAmount,
      dueDate: info.dueDate,
      status: 'pending',
      paymentMethod: 'UPI / GPay',
      receiptNumber: '',
    };

    return [createdItem, ...existingFees];
  } catch (err) {
    console.error('Error auto-creating current month fee:', err);
    return existingFees;
  }
}

/**
 * Quick status switcher for the fee ledger.
 * Updates Firestore doc and returns the updated item fields.
 */
export async function toggleFeeStatusInDb(
  feeId: string,
  currentStatus: FeeStatus,
  amount: number
): Promise<FeeStatus> {
  const nextStatus: FeeStatus = currentStatus === 'paid' ? 'pending' : 'paid';
  const todayStr = new Date().toISOString().split('T')[0];

  const updatePayload: Record<string, any> = {
    status: nextStatus,
    updatedAt: serverTimestamp(),
  };

  if (nextStatus === 'paid') {
    updatePayload.paidAmount = amount;
    updatePayload.balanceAmount = 0;
    updatePayload.paymentDate = todayStr;
  } else {
    updatePayload.paidAmount = 0;
    updatePayload.balanceAmount = amount;
    updatePayload.paymentDate = '';
  }

  await updateDoc(doc(db, 'fees', feeId), updatePayload);
  return nextStatus;
}
