// ============================================
// Fees Utility: Monthly Dues & Static Fee Management
// ============================================

import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { StudentFeeItem, FeeStatus } from '@/types/student';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns the exact last day date string (YYYY-MM-DD) for a given date.
 * Defaults to current month if no argument provided.
 * e.g., 2026-10-31, 2026-11-30, 2026-02-28
 */
export function getLastDayOfMonth(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDayDate = new Date(year, month + 1, 0); // last day of month
  const y = lastDayDate.getFullYear();
  const m = String(lastDayDate.getMonth() + 1).padStart(2, '0');
  const d = String(lastDayDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthFeeInfo(date = new Date()) {
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

export function getCurrentMonthFeeInfo(date = new Date()) {
  return getMonthFeeInfo(date);
}

export interface FeeMonthDetails {
  monthName: string;
  year: number;
  formattedMonth: string;
  isCurrentMonth: boolean;
  isLastMonth: boolean;
  isPastMonth: boolean;
  relativeLabel: string;
}

/**
 * Extracts month, year, and relative label from a fee record's due date or title.
 */
export function getFeeMonthDetails(fee: StudentFeeItem): FeeMonthDetails {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  let feeYear = currentYear;
  let feeMonth = currentMonth;
  let hasExtracted = false;

  // 1. Try parsing dueDate (YYYY-MM-DD)
  if (fee.dueDate && fee.dueDate.includes('-')) {
    const parts = fee.dueDate.split('-');
    if (parts.length >= 2) {
      const parsedYear = parseInt(parts[0], 10);
      const parsedMonth = parseInt(parts[1], 10) - 1;
      if (!isNaN(parsedYear) && !isNaN(parsedMonth) && parsedMonth >= 0 && parsedMonth < 12) {
        feeYear = parsedYear;
        feeMonth = parsedMonth;
        hasExtracted = true;
      }
    }
  }

  // 2. Fallback to scanning fee title if dueDate was missing or generic
  if (!hasExtracted && fee.title) {
    const titleLower = fee.title.toLowerCase();
    for (let i = 0; i < MONTH_NAMES.length; i++) {
      if (titleLower.includes(MONTH_NAMES[i].toLowerCase())) {
        feeMonth = i;
        hasExtracted = true;
        break;
      }
    }
    const yearMatch = fee.title.match(/20\d{2}/);
    if (yearMatch) {
      feeYear = parseInt(yearMatch[0], 10);
    }
  }

  const monthDiff = (currentYear - feeYear) * 12 + (currentMonth - feeMonth);
  const monthName = MONTH_NAMES[feeMonth] || '';

  let relativeLabel = '';
  if (monthDiff === 0) {
    relativeLabel = 'This Month';
  } else if (monthDiff === 1) {
    relativeLabel = 'Last Month';
  } else if (monthDiff > 1) {
    relativeLabel = `${monthDiff} Months Overdue`;
  } else if (monthDiff < 0) {
    relativeLabel = 'Upcoming Month';
  }

  return {
    monthName,
    year: feeYear,
    formattedMonth: `${monthName} ${feeYear}`,
    isCurrentMonth: monthDiff === 0,
    isLastMonth: monthDiff === 1,
    isPastMonth: monthDiff > 0,
    relativeLabel,
  };
}

/**
 * Ensures ONLY the current month's tuition fee record exists for the student.
 * - Does NOT auto-create previous months (only 1 current active month is triggered).
 * - If dedicated monthly fee is configured by admin, it uses that exact amount.
 * - If no dedicated fee is configured by admin, amount is strictly 0 / unassigned (NO random 1500 or 2000).
 * - Cleans up any stale 1500/2000 amounts on pending tuition fees if the admin has not set a dedicated fee.
 * - Cleans up any auto-created past empty months (e.g. September).
 */
export async function ensureCurrentMonthlyFee(
  studentId: string,
  existingFees: StudentFeeItem[],
  studentMonthlyFee?: number
): Promise<StudentFeeItem[]> {
  if (!studentId) return existingFees;

  const now = new Date();
  const currentMonthInfo = getMonthFeeInfo(now);

  const hasConfiguredFee =
    studentMonthlyFee !== undefined &&
    studentMonthlyFee !== null &&
    Number(studentMonthlyFee) > 0;
  const effectiveAmount = hasConfiguredFee ? Number(studentMonthlyFee) : 0;

  // Clean up any empty past month tuition records that were auto-created
  const cleanedList: StudentFeeItem[] = [];
  for (const f of existingFees) {
    if (
      f.feeType === 'tuition' &&
      f.status === 'pending' &&
      (!f.amount || f.amount === 0) &&
      f.dueDate &&
      f.dueDate < currentMonthInfo.monthYearStr
    ) {
      if (f.id) {
        deleteDoc(doc(db, 'fees', f.id)).catch(() => {});
      }
      continue;
    }
    cleanedList.push(f);
  }

  // Check if current month tuition fee already exists
  const existingCurrentIndex = cleanedList.findIndex((f) => {
    if (f.dueDate && f.dueDate.startsWith(currentMonthInfo.monthYearStr)) return true;
    if (
      f.title &&
      f.title.toLowerCase().includes(currentMonthInfo.monthName.toLowerCase()) &&
      f.title.includes(String(currentMonthInfo.year))
    ) {
      return true;
    }
    return false;
  });

  if (existingCurrentIndex >= 0) {
    const currentFee = cleanedList[existingCurrentIndex];

    // If student has NO configured fee, but the doc had an old hardcoded amount (e.g. 1500 or 2000), wipe it out to 0
    if (!hasConfiguredFee && currentFee.amount > 0 && currentFee.status === 'pending') {
      currentFee.amount = 0;
      currentFee.balanceAmount = 0;
      if (currentFee.id) {
        updateDoc(doc(db, 'fees', currentFee.id), {
          amount: 0,
          balanceAmount: 0,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
    } else if (hasConfiguredFee && currentFee.status === 'pending' && currentFee.amount !== effectiveAmount) {
      // Sync to configured dedicated fee
      currentFee.amount = effectiveAmount;
      currentFee.balanceAmount = effectiveAmount;
      if (currentFee.id) {
        updateDoc(doc(db, 'fees', currentFee.id), {
          amount: effectiveAmount,
          balanceAmount: effectiveAmount,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
    }

    cleanedList.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
    return cleanedList;
  }

  // Create current month tuition fee
  try {
    const newFeeData = {
      studentId,
      title: currentMonthInfo.title,
      feeType: 'tuition' as const,
      amount: effectiveAmount,
      paidAmount: 0,
      balanceAmount: effectiveAmount,
      dueDate: currentMonthInfo.dueDate,
      status: 'pending' as FeeStatus,
      paymentMethod: 'UPI / GPay' as const,
      receiptNumber: '',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'fees'), newFeeData);

    const createdItem: StudentFeeItem = {
      id: docRef.id,
      studentId,
      title: currentMonthInfo.title,
      feeType: 'tuition',
      amount: effectiveAmount,
      paidAmount: 0,
      balanceAmount: effectiveAmount,
      dueDate: currentMonthInfo.dueDate,
      status: 'pending',
      paymentMethod: 'UPI / GPay',
      receiptNumber: '',
    };

    cleanedList.unshift(createdItem);
  } catch (err) {
    console.error(`Error auto-creating fee for ${currentMonthInfo.title}:`, err);
  }

  cleanedList.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
  return cleanedList;
}

/**
 * Backward-compatible aliases
 */
export async function ensureSequentialMonthlyFees(
  studentId: string,
  existingFees: StudentFeeItem[],
  studentMonthlyFee?: number
): Promise<StudentFeeItem[]> {
  return ensureCurrentMonthlyFee(studentId, existingFees, studentMonthlyFee);
}

export async function ensureCurrentMonthFee(
  studentId: string,
  existingFees: StudentFeeItem[],
  studentMonthlyFee?: number
): Promise<StudentFeeItem[]> {
  return ensureCurrentMonthlyFee(studentId, existingFees, studentMonthlyFee);
}

/**
 * Quick status switcher for the fee ledger.
 * Updates Firestore doc and returns the updated item status.
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
