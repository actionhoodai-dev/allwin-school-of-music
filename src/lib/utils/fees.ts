// ============================================
// Fees Utility: Sequential Monthly Dues & Static Fee Management
// ============================================

import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  const lastDayDate = new Date(year, month + 1, 0); // 0 gets the last day of previous month index
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
 * Extracts month, year, and sequential relative label (e.g. This Month, Last Month, Overdue)
 * from a fee record's due date or title.
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
 * Ensures sequential tuition fee records exist for both Previous Month and Current Month.
 * - If dedicated monthly fee is set (e.g. ₹4000), it uses that static amount.
 * - If no dedicated fee is assigned yet, amount defaults to 0 (displays as Fees Unpaid with NO random values).
 * - Sorts all fees in reverse-chronological sequential order so the admin and student can clearly track
 *   "last month pending" and "this month pending".
 */
export async function ensureSequentialMonthlyFees(
  studentId: string,
  existingFees: StudentFeeItem[],
  studentMonthlyFee?: number
): Promise<StudentFeeItem[]> {
  if (!studentId) return existingFees;

  // Dedicated static fee or 0 if unassigned — NEVER fallback to random 2000!
  const effectiveAmount = (studentMonthlyFee && Number(studentMonthlyFee) > 0)
    ? Number(studentMonthlyFee)
    : 0;

  const now = new Date();
  // Check previous month and current month
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const targetMonths = [
    getMonthFeeInfo(prevMonthDate),
    getMonthFeeInfo(currentMonthDate),
  ];

  let updatedList = [...existingFees];

  for (const info of targetMonths) {
    // Check if a tuition fee for this specific month & year already exists
    const exists = updatedList.some((f) => {
      if (f.dueDate && f.dueDate.startsWith(info.monthYearStr)) return true;
      if (
        f.title &&
        f.title.toLowerCase().includes(info.monthName.toLowerCase()) &&
        f.title.includes(String(info.year))
      ) {
        return true;
      }
      return false;
    });

    if (!exists) {
      try {
        const newFeeData = {
          studentId,
          title: info.title,
          feeType: 'tuition' as const,
          amount: effectiveAmount,
          paidAmount: 0,
          balanceAmount: effectiveAmount,
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
          amount: effectiveAmount,
          paidAmount: 0,
          balanceAmount: effectiveAmount,
          dueDate: info.dueDate,
          status: 'pending',
          paymentMethod: 'UPI / GPay',
          receiptNumber: '',
        };

        updatedList.push(createdItem);
      } catch (err) {
        console.error(`Error auto-creating fee for ${info.title}:`, err);
      }
    }
  }

  // Sort descending by due date (This Month on top, Last Month directly below)
  updatedList.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));

  return updatedList;
}

/**
 * Backward-compatible alias for ensureSequentialMonthlyFees.
 */
export async function ensureCurrentMonthFee(
  studentId: string,
  existingFees: StudentFeeItem[],
  studentMonthlyFee?: number
): Promise<StudentFeeItem[]> {
  return ensureSequentialMonthlyFees(studentId, existingFees, studentMonthlyFee);
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
